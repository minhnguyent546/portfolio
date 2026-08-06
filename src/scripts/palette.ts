/**
 * The ⌘K palette. Loaded on the first keypress, never on page load.
 *
 * Two sources feed it. The static payload in the document covers every title
 * on the site and answers instantly. Pagefind indexes only the blog post route,
 * so it loads on demand and adds full-text matches from inside post bodies.
 */
import type {
  PaletteEntry,
  PaletteGroup,
} from "@/components/palette/buildIndex";

type Labels = Record<PaletteGroup | "inPosts" | "noResults", string>;

type Row = {
  title: string;
  detail: string;
  group: PaletteGroup | "inPosts";
  url: string;
  /** Ranges already marked by Pagefind, which the palette does not recompute. */
  detailMarks?: [number, number][];
};

type PagefindResult = {
  data: () => Promise<{
    url: string;
    meta: { title?: string };
    excerpt: string;
    /** The indexed page text, used to tell a real match from a near one. */
    raw_content?: string;
  }>;
};

type Pagefind = {
  options: (opts: Record<string, unknown>) => Promise<void>;
  debouncedSearch: (
    term: string,
    opts?: Record<string, unknown>,
    delay?: number
  ) => Promise<{ results: PagefindResult[] } | null>;
};

/** Order the groups appear in. */
const GROUPS: (PaletteGroup | "inPosts")[] = [
  "post",
  "publication",
  "competition",
  "project",
  "page",
  "inPosts",
];

/** Pagefind carries the body text, so a short query would match everything. */
const FULLTEXT_MIN = 3;

/**
 * Tone marks are separate code points after NFD, so dropping the combining
 * range turns "Cây ảo" into "cay ao" and lets an unaccented query match. Đ/đ
 * is a distinct letter rather than a composition, so it needs its own pass.
 *
 * Folded one character at a time, and each result kept to a single character,
 * so a folded index still points at the same place in the original string. A
 * match therefore highlights with one `indexOf` and no offset table.
 */
const fold = (value: string) => {
  let out = "";
  for (const char of value) {
    const stripped = char
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase();
    // A surrogate pair, or a letter whose lowercase is longer, would shift
    // every later index. Keep the original in that case; it only costs a
    // match on a character that carries no tone mark anyway.
    out += stripped.length === char.length ? stripped : char;
  }
  return out;
};

const dialog = document.querySelector<HTMLDialogElement>("#palette");
const input = document.querySelector<HTMLInputElement>("#palette-input");
const list = document.querySelector<HTMLUListElement>("#palette-list");
const empty = document.querySelector<HTMLParagraphElement>("#palette-empty");
const payload = document.querySelector<HTMLScriptElement>("#palette-index");

const entries: PaletteEntry[] = JSON.parse(payload?.textContent ?? "[]");
const labels: Labels = JSON.parse(dialog?.dataset.labels ?? "{}");
const bundlePath = dialog?.dataset.bundlePath ?? "/pagefind/";

/** Precomputed so a keystroke does not re-normalize the whole payload. */
const haystacks = entries.map(entry =>
  fold(`${entry.t} ${entry.d} ${entry.a ?? ""}`)
);

/**
 * Pagefind indexes both halves of a translated pair as separate pages, since
 * nothing in the built HTML says they are one article. Every other listing on
 * the site shows one row per article, so map the dropped half back onto the
 * shown one before a hit is compared or listed.
 */
const canonical = new Map(
  entries.filter(entry => entry.v).map(entry => [entry.v as string, entry])
);

/**
 * Writes `text` into `parent`, wrapping the given ranges in `<mark>`. Built from
 * text nodes rather than `innerHTML`, since the query reaches this unescaped.
 */
function withMarks(
  parent: HTMLElement,
  text: string,
  ranges: [number, number][]
) {
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start < cursor) continue;
    if (start > cursor) parent.append(text.slice(cursor, start));
    const mark = document.createElement("mark");
    mark.textContent = text.slice(start, end);
    parent.append(mark);
    cursor = end;
  }
  parent.append(text.slice(cursor));
}

/**
 * Where each query word occurs in `text`, as ranges into the original string.
 * Sorted and merged, so `withMarks` can walk them in one pass and an overlap
 * from two words that share a prefix does not produce nested marks.
 */
function findMarks(text: string, query: string): [number, number][] {
  const folded = fold(text);
  const found: [number, number][] = [];
  for (const word of fold(query).split(/\s+/).filter(Boolean)) {
    let at = folded.indexOf(word);
    while (at >= 0) {
      found.push([at, at + word.length]);
      at = folded.indexOf(word, at + word.length);
    }
  }
  found.sort((a, c) => a[0] - c[0]);

  const merged: [number, number][] = [];
  for (const range of found) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push(range);
  }
  return merged;
}

/**
 * Pagefind escapes the page text it returns, so a C++ excerpt arrives as
 * `vector&lt;int&gt;`. Decoded through the parser rather than a replace list, so
 * every entity is covered; the input is a text node, never markup.
 */
const decode = (value: string) => {
  const area = document.createElement("textarea");
  area.innerHTML = value;
  return area.value;
};

/**
 * Splits a Pagefind excerpt into plain text and the ranges it marked. Pagefind
 * has already found the terms, including ones the palette's own substring pass
 * would miss, so its positions are kept rather than recomputed.
 */
function unmark(excerpt: string): {
  text: string;
  marks: [number, number][];
} {
  const marks: [number, number][] = [];
  let text = "";
  const pattern = /<mark>([\s\S]*?)<\/mark>|<[^>]*>|([^<]+)/g;
  for (const [, marked, plain] of excerpt.matchAll(pattern)) {
    if (marked !== undefined) {
      const decoded = decode(marked);
      marks.push([text.length, text.length + decoded.length]);
      text += decoded;
    } else if (plain !== undefined) {
      text += decode(plain);
    }
  }
  return { text, marks };
}

let rows: Row[] = [];
let active = 0;
/** The query the in-flight Pagefind search was issued for. */
let pending = "";
let pagefind: Pagefind | null = null;
let pagefindLoad: Promise<Pagefind | null> | null = null;

function loadPagefind(): Promise<Pagefind | null> {
  pagefindLoad ??= (async () => {
    try {
      // A template literal, so Vite leaves the specifier alone. Pagefind is
      // emitted by its own CLI step after the bundle exists.
      const module: Pagefind = await import(
        /* @vite-ignore */ `${bundlePath}pagefind.js`
      );
      await module.options({ excerptLength: 15 });
      pagefind = module;
      return module;
    } catch {
      // The index is missing in dev, where `pagefind` has never run. Static
      // results still answer, so the palette stays usable.
      return null;
    }
  })();
  return pagefindLoad;
}

function staticRows(query: string): Row[] {
  // Every word, in any order and any field: "virex bench" and "bench virex"
  // both name the same project, and "viclip ot" spans the title and the venue.
  const words = fold(query).split(/\s+/).filter(Boolean);
  const matched: Row[] = [];
  haystacks.forEach((haystack, i) => {
    if (!words.every(word => haystack.includes(word))) return;
    const entry = entries[i];
    matched.push({
      title: entry.t,
      detail: entry.d,
      group: entry.k,
      url: entry.u,
    });
  });
  return matched;
}

function render() {
  list?.replaceChildren();
  active = 0;

  if (rows.length === 0) {
    if (empty) {
      empty.textContent = labels.noResults.replace("%s", input?.value ?? "");
      empty.hidden = false;
    }
    input?.removeAttribute("aria-activedescendant");
    return;
  }
  if (empty) empty.hidden = true;

  // Grouped up front, then written back: the arrow keys index into `rows`, so
  // it has to hold the same order the reader sees.
  const grouped = GROUPS.map(group => ({
    group,
    inGroup: rows.filter(row => row.group === group),
  })).filter(({ inGroup }) => inGroup.length > 0);
  rows = grouped.flatMap(({ inGroup }) => inGroup);

  let index = 0;
  for (const { group, inGroup } of grouped) {
    const heading = document.createElement("li");
    heading.className =
      "px-4 pt-4 pb-1 font-mono text-xs tracking-wide text-ink-muted uppercase";
    heading.role = "presentation";
    heading.textContent = labels[group];
    list?.append(heading);

    for (const row of inGroup) {
      const item = document.createElement("li");
      item.id = `palette-row-${index}`;
      item.role = "option";
      item.dataset.index = String(index);
      item.className = "cursor-pointer px-4 py-2 aria-selected:bg-surface";
      item.ariaSelected = String(index === 0);

      const query = input?.value ?? "";
      const title = document.createElement("span");
      title.className = "block truncate";
      withMarks(title, row.title, findMarks(row.title, query));
      item.append(title);

      if (row.detail) {
        const detail = document.createElement("span");
        detail.className = "block truncate text-sm text-ink-muted";
        withMarks(
          detail,
          row.detail,
          row.detailMarks ?? findMarks(row.detail, query)
        );
        item.append(detail);
      }

      list?.append(item);
      index += 1;
    }
  }

  input?.setAttribute("aria-activedescendant", "palette-row-0");
  scrollActiveIntoView();
}

function mark(next: number) {
  const options = list?.querySelectorAll<HTMLLIElement>('[role="option"]');
  if (!options || options.length === 0) return;

  active = (next + options.length) % options.length;
  options.forEach((option, i) => {
    option.ariaSelected = String(i === active);
  });
  input?.setAttribute("aria-activedescendant", `palette-row-${active}`);
  scrollActiveIntoView();
}

function scrollActiveIntoView() {
  list
    ?.querySelector(`#palette-row-${active}`)
    ?.scrollIntoView({ block: "nearest" });
}

async function search(query: string) {
  rows = staticRows(query);
  render();

  if (query.length < FULLTEXT_MIN) return;

  pending = query;
  const module = pagefind ?? (await loadPagefind());
  // Another keystroke landed while the module or the index was loading.
  if (!module || pending !== query) return;

  const found = await module.debouncedSearch(query);
  if (!found || pending !== query) return;

  const seen = new Set(rows.map(row => row.url));
  const details = await Promise.all(
    found.results.slice(0, 5).map(r => r.data())
  );
  if (pending !== query) return;

  // Word by word, not the whole phrase: Pagefind matches terms wherever they
  // appear, so "dsu tree" is a fair hit on a page holding both, and requiring
  // the exact string would throw it away.
  const words = fold(query).split(/\s+/).filter(Boolean);
  for (const detail of details) {
    // Pagefind ranks by similarity, so "virex" comes back matched against "Vì"
    // and "bench" against "bên". That is reasonable for a full results page,
    // where a weak hit sits harmlessly at the bottom, but the palette shows the
    // top few and the noise lands in view. Keep a hit only where every word
    // really occurs. No score threshold: the number would need retuning every
    // time the corpus grows, and "virex" scored above several true matches.
    const haystack = fold(detail.raw_content ?? "");
    if (!words.every(word => haystack.includes(word))) continue;

    const found = new URL(detail.url, location.origin).pathname;
    const entry = canonical.get(found);
    const url = entry?.u ?? found;
    if (seen.has(url)) continue;
    seen.add(url);

    const { text, marks } = unmark(detail.excerpt);
    rows.push({
      title: entry?.t ?? detail.meta.title ?? url,
      detail: text,
      detailMarks: marks,
      group: "inPosts",
      url,
    });
  }
  render();
}

function close() {
  dialog?.close();
}

export function open(seed = "") {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  if (input) {
    input.value = seed;
    input.focus();
  }
  void search(seed);
}

input?.addEventListener("input", () => void search(input.value));

input?.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      mark(active + 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      mark(active - 1);
      break;
    case "Home":
      event.preventDefault();
      mark(0);
      break;
    case "End":
      event.preventDefault();
      mark(rows.length - 1);
      break;
    case "Enter": {
      event.preventDefault();
      const row = rows[active];
      if (row) location.href = row.url;
      break;
    }
  }
});

list?.addEventListener("click", event => {
  const item = (event.target as Element).closest<HTMLLIElement>(
    '[role="option"]'
  );
  const row = item && rows[Number(item.dataset.index)];
  if (row) location.href = row.url;
});

// A click outside the panel. The dialog fills the viewport, so its own box is
// the backdrop and the panel inside it is what the reader sees.
dialog?.addEventListener("click", event => {
  if (event.target === dialog) close();
});
