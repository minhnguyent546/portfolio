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
  /** Pagefind's whole-word ranges, used only where the substring pass finds none. */
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
 * Splits a Pagefind excerpt into plain text and the ranges it marked. The
 * excerpt arrives as markup: the matched terms in `<mark>`, the surrounding
 * page text escaped. Walked as a parsed tree rather than matched with a
 * pattern, so a tag nested inside `<mark>` and a bare `<` in the prose both
 * resolve the way the browser resolves them.
 *
 * The ranges are a fallback, not the first choice. Pagefind marks whole words,
 * so "pro" would highlight all of "problem" while every other row highlights
 * the three characters the visitor typed. They are used only where the
 * palette's own substring pass finds nothing, which is how a stemmed match
 * still shows why it is here.
 */
function unmark(excerpt: string): {
  text: string;
  marks: [number, number][];
} {
  const parsed = document.createElement("template");
  parsed.innerHTML = excerpt;

  const marks: [number, number][] = [];
  let text = "";
  const walk = (node: Node, marked: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue ?? "";
      if (marked && value)
        marks.push([text.length, text.length + value.length]);
      text += value;
      return;
    }
    const inMark =
      marked || (node as Element).tagName?.toLowerCase() === "mark";
    for (const child of node.childNodes) walk(child, inMark);
  };
  walk(parsed.content, false);

  // A `<mark>` holding more than one text node yields adjacent ranges.
  const merged: [number, number][] = [];
  for (const range of marks) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push(range);
  }
  return { text, marks: merged };
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
  const matched: { row: Row; rank: number }[] = [];
  haystacks.forEach((haystack, i) => {
    if (!words.every(word => haystack.includes(word))) return;
    const entry = entries[i];

    // A row can match on text it never shows: a project's stack chips, a
    // competition's summary, a paper's authors. Append that text so the row
    // says why it is here, but only for the words the shown fields miss, or
    // every project would trail its whole stack.
    const shown = fold(`${entry.t} ${entry.d}`);
    const unexplained = words.filter(word => !shown.includes(word));
    const reason =
      unexplained.length > 0 && entry.a ? pickReason(entry.a, unexplained) : "";

    matched.push({
      row: {
        title: entry.t,
        detail: reason ? `${entry.d} · ${reason}` : entry.d,
        group: entry.k,
        url: entry.u,
      },
      rank: rankOf(haystack, fold(entry.t), words),
    });
  });

  // Stable, so rows of equal rank keep their build order.
  matched.sort((a, c) => a.rank - c.rank);
  return matched.map(({ row }) => row);
}

/**
 * How well a row answers the query, lower being better. Matching inside a word
 * is what makes the list useful as the visitor types — "auxi" has to find
 * "Auxiliary", and "torch" has to find "PyTorch" — but it also means "ot" finds
 * "chatbot" and "is" finds "Advisory". Those stay findable and sink instead.
 */
function rankOf(haystack: string, title: string, words: string[]): number {
  const starts = (text: string, word: string) =>
    new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(word)}`, "u").test(text);

  const everyWordStarts = words.every(word => starts(haystack, word));
  const inTitle = words.every(word => title.includes(word));
  if (everyWordStarts) return inTitle ? 0 : 1;
  return inTitle ? 2 : 3;
}

/** The query is user text, so it cannot be spliced into a pattern unescaped. */
const escapeRe = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Longest reason shown, so one summary cannot crowd out the description. */
const CAP = 120;

/**
 * The one span of hidden text that explains the match. The field holds a whole
 * summary or author list, so a slice around the first unexplained word is
 * enough; the rest would push the match off the end of the line again.
 */
function pickReason(hidden: string, words: string[]): string {
  const folded = fold(hidden);
  const at = folded.indexOf(words[0]);
  if (at < 0) return "";

  // Widen to the sentence, but only when its start is near the match. The
  // field concatenates several values, and a title or author list holds no
  // period at all, so the sentence can begin hundreds of characters back and
  // the cap below would then cut the line before it ever reaches the match.
  const period = hidden.slice(0, at).search(/\.\s(?![\s\S]*\.\s)/);
  const sentence = period < 0 ? 0 : period + 2;
  const start =
    at - sentence <= CAP - 40 ? sentence : hidden.lastIndexOf(" ", at - 24) + 1;

  const rest = hidden.slice(at).search(/\.(\s|$)/);
  const stop = rest < 0 ? hidden.length : at + rest + 1;
  const slice = hidden.slice(start, stop).trim();
  // No leading ellipsis: the composed line is windowed again before it is
  // rendered, and that pass adds one when it slides.
  return slice.length > CAP ? slice.slice(0, CAP - 1).trimEnd() + "…" : slice;
}

/**
 * A one-line row shows roughly the first 90 characters, so a match later than
 * that is rendered but clipped past the ellipsis: "tpu" sits 456px beyond the
 * visible edge of the pre-training-gpt2 summary. Slide the text so the first
 * match is in view, the way Pagefind already builds its own excerpts.
 *
 * Ranges move with the text, so the marks still cover the same characters.
 */
const LEAD = 24;

function windowToMark(
  text: string,
  ranges: [number, number][]
): { text: string; ranges: [number, number][] } {
  const first = ranges[0]?.[0] ?? 0;
  if (first <= LEAD + 8) return { text, ranges };

  // Cut on a word boundary so the line does not open mid-word.
  const space = text.lastIndexOf(" ", first - LEAD);
  const cut = space > 0 ? space + 1 : first - LEAD;
  const ellipsis = "…";
  const shift = cut - ellipsis.length;
  return {
    text: ellipsis + text.slice(cut),
    ranges: ranges.map(([start, end]) => [start - shift, end - shift]),
  };
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
      const head = windowToMark(row.title, findMarks(row.title, query));
      withMarks(title, head.text, head.ranges);
      item.append(title);

      if (row.detail) {
        const detail = document.createElement("span");
        detail.className = "block truncate text-sm text-ink-muted";
        // The substring pass first, so the highlight is as wide as the query.
        // Pagefind's own ranges answer for a stemmed hit, where the query
        // never occurs literally and the row would otherwise look unexplained.
        const own = findMarks(row.detail, query);
        const shown = windowToMark(
          row.detail,
          own.length > 0 ? own : (row.detailMarks ?? [])
        );
        withMarks(detail, shown.text, shown.ranges);
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

/**
 * Close first, then navigate. A row pointing at a homepage section is only a
 * hash change when the visitor is already on the homepage, so nothing unloads
 * the document and the panel would otherwise stay open over the section it
 * just scrolled to.
 */
function go(url: string) {
  close();
  location.href = url;
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
      if (row) go(row.url);
      break;
    }
  }
});

list?.addEventListener("click", event => {
  const item = (event.target as Element).closest<HTMLLIElement>(
    '[role="option"]'
  );
  const row = item && rows[Number(item.dataset.index)];
  if (row) go(row.url);
});

// A click outside the panel. The dialog fills the viewport, so its own box is
// the backdrop and the panel inside it is what the reader sees.
dialog?.addEventListener("click", event => {
  if (event.target === dialog) close();
});
