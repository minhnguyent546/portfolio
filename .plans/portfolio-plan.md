# Portfolio Plan — minhnguyent546.io.vn

> High-level structure and stack for Minh-Thien Nguyen's personal portfolio
> (AI Research Engineer — NLP & Deep Learning).
> Status: **approved direction, pre-implementation**. Written 2026-08-01.

---

## 1. Concept

A **research-engineer hybrid** portfolio (Raschka/Dettmers pattern): the same work
presented in two vocabularies — papers/preprints for academic readers, systems &
scale framing for industry readers.

Design direction: **"quiet craft"** — Swiss typography, minimal, **light default,
single-column academic layout**, restrained motion. Explicitly avoid: Inter +
purple-gradient "AI-slop" look, terminal cosplay, 3D/WebGL hero scenes.

> **Override 2026-08-06:** `/photon-sphere` overrides the "no 3D/WebGL hero scenes"
> rule for one hidden route. The rule protects the homepage from decoration that costs
> load time. Nothing links to this page, it is `noindex`, and the sitemap filter drops
> it, so it adds 0 bytes to every other route. See §4.

> **Changed 2026-08-01:** was "dark-mode default." All five studied references are
> light, the user's own chosen reference (jimfan.me) is light, and dark-SaaS-by-default
> is a documented slop tell. Dark mode still ships — it is a token re-point, not a
> separate design. See §2.5.

- **Language:** Blog posts declare English or Vietnamese. The site shell stays English.
  Vietnamese posts localize post controls, dates, and metadata. Routes have no locale
  prefix. A `translationOf` reference pairs the two languages of one article. Set it on
  one post; the site reads the link from either side. Every listing shows one row per
  article and prefers the English side. The post page links the pair from the meta row,
  and prev/next stays inside one language. The link names the destination language in
  that language, so it speaks to the reader who cannot read the current page.
- **Signature flourish:** ⌘K command palette (search + quick actions).
- **Performance bar:** ~0 bytes of JS on cold page load; everything build-time or
  lazy-loaded on interaction. Lighthouse ~100 across the board.

## 2. Architecture

**Hybrid single-page + routed long-form:**

- `/` — compact single-column homepage with one sticky header.
  Section order: **Hero → News → Publications → Experience → Competitions → Projects → Education & Honors**.
- `/blog/…` — routed blog posts (Markdown/MDX, math + code support) and VNOI Magazine list
- **No `/about` route (2026-08-08).** It held the same prose as section 01 under a
  second URL, which showed as two About rows in the palette. Section 01 renders
  `src/content/pages/about.md`, so the prose has one home and tty3 keeps reading the
  same entry for `about.txt`.
- `/papers/viclip-ot`, `/papers/soups` — per-paper Nerfies-style project pages
  (based on eliahuhorwitz/Academic-project-page-template design, rebuilt in Astro)
- `/cv` or direct PDF link — CV as PDF (no HTML CV page for v1)
- 404 page

**Base theme:** [AstroPaper](https://github.com/satnaing/astro-paper) v6.1.0
(4.9k★, actively maintained, ships Astro 7) — used as structural base; visual
identity fully replaced by our design system. Layout inspiration:
tovacinni/research-website-template (publication rows — design only, repo is stale).

## 2.5 Design system — single-column academic layout ("quiet craft")

Single-column academic dossier (`58rem` container, hairline-ruled top headings, shared
`11rem` left gutter across every section). Keeps the warm-paper palette, desaturated
slate-blue accent, dark mode, and near-0 JS bar.

### Colour — warm neutral paper, desaturated blue accent

Light is the **default**. All five studied references are light; report 3 found
dark-SaaS-by-default is itself a slop tell. Dark mode is a token re-point, not a
separate design.

The theme toggle has three states: light, dark, and system. `system` is the
default and follows `prefers-color-scheme` live. A stored `light` or `dark` is a
manual choice; the OS-change listener applies only in `system` mode. The inline
FOUC script and `theme.ts` share the same mode/effective split.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#fdfcfa` | `#16161a` | odd sections |
| `--paper-alt` | `#f8f7f3` | `#1c1c21` | even sections (band) |
| `--ink` | `#1a1a18` | `#eceae6` | body text |
| `--ink-heading` | `#312f2b` | `#eceae6` | headings |
| `--ink-muted` | `#57544d` | `#a8a49c` | subtitles, metadata |
| `--accent` | `#2c5f8a` | `#7fb0d4` | links |
| `--accent-ink` | `#ffffff` | `#16161a` | text on an accent fill |
| `--ink-warn` | `#a3382a` | `#e08c74` | failure states, search marks |
| `--ink-ok` | `#24603a` | `#7fc79b` | success states |
| `--surface` | `#eeece5` | `#26262d` | code blocks, table stripes, chips |
| `--rule` | `#e6e3dc` | `#2a2a30` | hairlines |

`--surface` sits at ~2× the band delta (1.15 vs `--paper`), so a code block still reads
as a distinct box when it lands on `--paper-alt`. Accent stays AA on it (5.71 / 6.49).

Warm-neutral paper rather than pure white — report 5 found `#f8f6ef`-family warm
off-white across the field, and it's kinder for long reading. **`--accent` is a
desaturated slate blue** (hue 207, sat 52%) — it keeps the calm blue register the user
liked while stepping away from `#1565c0` Material Blue (sat 80%), which is the
AI-slop hue family. **Footprint ≤5%:** links, the active nav item, and the award pill.
Never a button flood, never a gradient. The ⌘K palette marks matches in `--ink-warn` at
600 weight, not accent: accent blue is too near the body ink to find at a glance in
light mode. That gives the token two jobs, which is accepted because a failure state and
a search mark never share a screen (5.63 light / 5.85 dark on the selected row).

**Contrast verified** (WCAG AA needs 4.5 body / 3.0 large), computed both bands:

| Pair | on `--paper` | on `--paper-alt` |
|---|---|---|
| `--ink` | 17.00 | 16.26 |
| `--ink-muted` | 7.37 | 7.05 |
| `--accent` | 6.58 | 6.30 |
| `--ink-warn` | 6.49 | 6.21 |
| `--ink-ok` | 7.29 | 8.52 |

Band pair itself: 1.045 light, 1.063 dark.

These names replace AstroPaper's `--background` / `--foreground` / `--border`
(decided 2026-08-02). Tailwind derives the utilities from `@theme inline`, so the
rename is one block in `theme.css` plus a sweep of the class names.

Each theme block must also set `color-scheme`. Without it the canvas behind `<html>`
stays white, which shows as a flash during the cross-document view transition when the
site theme and the OS theme disagree.

### Type scale — Newsreader display + IBM Plex Sans body

UI and homepage body use **IBM Plex Sans** (16 px floor, tabular figures for dates).
Headings and blog article bodies use **Newsreader** (preserving its optical match with
KaTeX). **JetBrains Mono** stays limited to code blocks, BibTeX, and project names.

| Role | 375 px | 1440 px | `clamp()` |
|---|---|---|---|
| h1 | 30 | 38 | `clamp(1.875rem, 1.7342rem + 0.6009vw, 2.375rem)` |
| h2 | 22 | 26 | `clamp(1.375rem, 1.3046rem + 0.3005vw, 1.625rem)` |
| h3 | 18 | 20 | `clamp(1.125rem, 1.0898rem + 0.1502vw, 1.25rem)` |
| body | 16 | 17 | `clamp(1rem, 0.9824rem + 0.0751vw, 1.0625rem)` |
| meta | 14 | 15 | `clamp(0.875rem, 0.8574rem + 0.0751vw, 0.9375rem)` |

Fluid via `clamp()`. Base body leading is **1.6** with a **65ch** prose measure;
headings use weight **600** (article headings in `.app-prose` use **700** so titles
stay heavier than `<strong>` at 600). `.app-prose` must set its own `font-size` and
h1–h3 rules because the typography plugin otherwise resets reading pages to 16 px.
Blog articles render **17 px Newsreader** in a **45.5rem** column (`font-display` on
`#article`), with inline code at **0.8em** to match Newsreader optically.

### Layout

- **Single column with top headings.** Container is `58rem` on `/` via `--app-width`
  and `48rem` on reading pages. Each section uses a hairline-ruled `<h2>` and
  `py-5 sm:py-6` padding, aligned to one `11rem` left gutter.
- **Sticky `Header.astro`.** Solid `bg-paper` bar. On `/` it shows desktop section anchors
  (`News`, `Publications`, `Experience`, `Competitions`, `Projects`) with active-section
  scroll highlighting on the left, a collapsible mobile section menu below `md` (with
  `minhnguyent546` on the left so the author's name does not repeat above the hero `h1`),
  and `Blog`, search, and the theme toggle on the right. Subpages show a monospace `~/`
  home link that expands to `/home/minhnguyent546/` on hover (with a 10% chance of
  `/root/`). `scroll-padding-top` clears the header height.


## 3. Content inventory (from GitHub README)

- **Hero/About:** `about.md` prose (`65ch`) on the left (so tty3 `about.txt` and JSON-LD
  share one source); centered identity rail (`15.5rem`) on the right with square portrait,
  single-line name (`h1`), **AI Researcher** role, `Curriculum vitae` link, and centered
  contact links (`Email`, `X`, `LinkedIn`, `Scholar`, `HackMD`, `GitHub`). Outbound links
  carry borderless domain-matched monochrome SVG icons (`ExternalLink.astro`).
- **News:** Curated list in `news.yml` using `MMM YYYY` dates. Shows the latest 5 rows
  with older entries behind a `<details>` toggle (0 JS).
- **Publications:** Desktop thumbnails (`11rem`, `object-contain` on white, hidden on
  mobile), bold self-author, verbatim venue + date line, and one link row (`DOI`,
  `arXiv`, `Code`, `Hugging Face`, expandable `Abstract` via `<details>`; `bibtex` stays
  in frontmatter for `tty3`):
  - **ViCLIP-OT** — Vietnamese image–text retrieval w/ Optimal Transport. Accepted at Machine Vision and Applications. arXiv 2602.22678 · code · Hugging Face collection.
  - **CoTu @ EXACT 2026** — neuro-symbolic Program-of-Thought for explainable educational QA. Accepted at CSoNet 2026, Special Session: EXACT Competition, Springer LNCS. Camera-ready revisions pending. arXiv 2607.14735 · code · Hugging Face collection.
  - **soups** — model soups for Mekong Delta intangible-cultural-heritage image classification. Published in Journal on Information Technologies and Communications. arXiv 2603.02181 · code.
  - CoTu and ViCLIP-OT are **co-first-authored**; the site footnotes `* Equal contribution`.
- **Experience:** `src/content/experience/` rendered as flat two-column rows (`period`
  left, `role · organization` and full-ink highlights right).
- **Education & Honors:** `#education` section below Projects. Lists Can Tho University
  (GPA 3.91/4.0, TOEIC 845, thesis 9.6/10) and `src/data/awards.ts` grouped by year;
  the ⌘K palette routes award queries to `#education`.
- **Project summaries** state what each project does and the result it produced, with one
  number and the decision behind it (GPT-2 perplexity ~21.02, SEAS MRR 0.18→0.70, MCQA
  91.2%/4×, medical-llama2 QLoRA).
- **Competitions** (flat two-column rows; extended write-ups and diagrams expand behind `<details>`):
  - **Zalo AI Challenge 2026, DataMate Track** — Agentic QA over business data (DuckDB + SQL/Python,
    LoRA-tuned MiMo-V2.6-Distill-Qwen-9B, W8A16 INT8). Month-only date (2026-11);
    0.856 Penalized Accuracy on the 1,000-question public leaderboard. HF model;
    optional `venueUrl` links the challenge portal while the contest is live.
  - **VLSP 2026, Numerical Reasoning QA** — Numerical reasoning QA over Vietnamese financial reports (DSPy,
    LoRA rejection-sampling SFT on GRM-2.5 4B, self-consistency). Month-only date
    (2026-10); 67.13% program accuracy on the private test. `venueUrl` links the
    shared-task page.
  - **EXACT 2026** (IEEE IJCNN) — *highest technical score 13.44/15, 3rd overall*,
    announced 2026-06-25. Code · tech report (arXiv 2607.14735) · HF collection ·
    leaderboard. The leaderboard is on free Vercel hosting and may disappear; the
    claim must stand on the tech report alone.
  - **Viettel AI Race 2025** — MCQA pipeline for complex technical documents. Code.
    Month-only date (2025-10); top 3 on the public leaderboard, 91.2% round-3 accuracy.
- **Projects** (framed around engineering decisions & scale):
  ViREx-Bench (inference-time scaling, Vietnamese reasoning) · seas (async
  FastAPI/SQLAlchemy/Qdrant) · medical-llama2 (LLaMA-2 7B fine-tune + HF Spaces demo) ·
  pre-training-gpt2 (PyTorch/XLA, CUDA + TPU).
- **Blog taxonomy** (2026-08-11; ledger redesigned 2026-08-21): every post declares one
  `topic` from a closed enum — `algorithms`, `llm`, `nlp`, `systems` — in
  `src/data/topics.ts`, beside the free `tags`. The field is required with no default,
  so the build stops until a new post picks one. `/blog` lists posts as a year-grouped
  ledger of three-column rows: date, reading time, and topic pill in a left meta column,
  title plus two-line description in the middle, card image on the right; the whole row
  is one link. Reading time is computed at build from the Markdown body (200 wpm, code
  fences excluded). A row's card image comes from optional `thumbnail` frontmatter and
  falls back to the generated OG card. Topic filters render as pills; each populated
  topic also gets `/blog/topic/<name>/`. A topic joins `BlogNav` and gets a page once it
  has a post, so the row never offers an empty list. `BlogNav` also carries Tags and
  Archives on the right, as the secondary axes. Filters are real routes, which keeps
  the page at 0 bytes of JavaScript. Pagination is gone: `/archives` already holds the
  full history, and a year heading split across pages stops grouping. Sorting is on
  `pubDatetime` alone, not the `modDatetime` that `getSortedPosts` prefers, or an
  edited old post would head the list while sitting in an older year group.
- **Writing:** Moved off `/` onto `/blog` (2026-11-19). `/blog` lists on-site posts
  plus a **VNOI Magazine** sub-list ("Virtual Tree / Cây ảo", 2024; "Kỹ thuật tinh tế
  về phép Xor", 2023). HackMD `:::spoiler` containers port to `<details><summary>`.
- **Contact:** Inline labelled links in the Hero (email, GitHub, LinkedIn, X, Google Scholar, HackMD).

## 4. Stack (verified current, 2026-08)

### Core
| Slot | Pick | Notes |
|---|---|---|
| Framework | **Astro 7** (7.1.6 installed) | AstroPaper's `v6.1.0` **tag** ships Astro 6; only its unreleased `main` targets 7. Scaffolded from the tag, then upgraded (2026-08-01) with `@astrojs/mdx@7`. Pin `@shikijs/transformers` to match the `shiki` version Astro bundles (4.1.0) — a newer minor duplicates `@shikijs/types` and breaks `astro check`. |
| Runtime / PM | **Node ≥ 22.15.1 + pnpm 11.13.1** | Pinned via `packageManager` + `engines` (user decision, 2026-08-01). Bun rejected: Astro declares no `bun` engine, docs still warn about integration rough edges. |
| CSS | **Tailwind v4** via `@tailwindcss/vite` (4.3.x) + `@tailwindcss/typography` | CSS-first config (`@theme` block). `@astrojs/tailwind` is dead — do not use. |
| TypeScript | 7.x, `astro/tsconfigs/strict` + `astro check` in build | |
| Content | **Content Layer API** in `src/content.config.ts` | Seven collections. `glob()` for prose: `blog`, `publications`, `competitions`, `projects`, `pages`. `file()` for pure data: `news.yml`, `articles.yml` — it parses YAML natively and takes `id` as the entry key, so `id` must not appear in the schema. Legacy collections removed in Astro 6. |

### Typography

| Role | Font | CSS variable |
|---|---|---|
| Headings / display / blog body | **Newsreader** (wght 400–700, roman + italic) | `--font-display` |
| Homepage body / UI | **IBM Plex Sans** (wght 400–700, roman + italic) | `--font-app` |
| Code / dates / metadata | **JetBrains Mono** (wght 400–600) | `--font-mono` |

All OFL. Astro's top-level `fonts` config loads all three browser families with Latin
and Vietnamese subsets. Newsreader keeps blog prose optically matched to KaTeX (x-height
0.426 vs KaTeX 0.431), while IBM Plex Sans gives dense homepage metadata crisp scanning.
A separate build-only Archivo TTF family supplies Satori Vietnamese glyphs for OG images.

- **The `opsz` axis is omitted on purpose.** It doubles the file, from 57 KB to 129 KB,
  and the type scale runs only 14–38 px.
- **`styles` defaults to `["normal", "italic"]`.** Italic is a second file. Only
  Newsreader declares it.
- **satori cannot read woff2**, so the OG routes use a separate build-only family,
  `--font-archivo-og`. Do not add `ttf` to a browser family: that puts static
  `@font-face` blocks in the browser stylesheet, and a heading at weight 500 then pulls
  a 112 KB TrueType file.
- **KaTeX must be imported into `layer(base)`.** Unlayered CSS outranks every layer, so
  an unlayered `katex.min.css` keeps its `font: 1.21em` and renders math a fifth larger
  than the prose. Math is levelled to `1em`.
- **Pin `katex` to `^0.16.0`, matching rehype-katex's renderer.** rehype-katex@7.0.1
  renders with katex 0.16.x (DOM classes `.sizing`); a 0.18.x CSS sizes `.katex-sizing`
  instead, so the sub/sup sizing rules never match and scripts render at full size and
  overlap. The CSS must come from the same katex the HTML was rendered with.
- **Fontshare fonts stay out** (Satoshi, General Sans, Switzer). The FFL bars
  subsetting and self-hosted redistribution.
- No Google Fonts CDN. In dark mode, set `-webkit-font-smoothing: antialiased` and drop
  about 50 weight units, because light text on a dark ground looks heavier.

### Features
| Feature | Pick | Notes |
|---|---|---|
| Icons | **unplugin-icons** + `@iconify-json/lucide` (UI) + `@iconify-json/simple-icons` (brands) | Simple Icons covers most brand marks. The Google Scholar mark is a vendored Academicons SVG under SIL OFL 1.1. Native `.svg` imports load custom marks. **`astro-icon` is abandoned — do not use.** |
| Tooltips | **CSS-only, local to the first use** | Keep the social tooltip in `Socials.astro` while it is the only use. When a second use appears, extract `Tooltip.astro` with start, center, and end alignment. Keep it free of runtime JavaScript. Add Floating UI only if automatic collision handling or portals become necessary. |
| Search | **Pagefind 1.5** via `astro-pagefind` | Static, indexes built HTML, lazy chunked index. `data-pagefind-body` on articles. |
| ⌘K palette | **Hand-rolled vanilla island** over a build-time index, with Pagefind for post bodies | **Done (2026-08-06).** `data-pagefind-body` sat on the post route alone (Pagefind saw 2 pages of 12) until 2026-08-09, when it moved onto the homepage `<main>` (Pagefind saw 3 pages). Homepage full-text was reverted the same day: it surfaced snippets in the palette whose URL was `/`, so selecting them jumped to the page top. The build-time index now carries every homepage section — including the Awards, which share `src/data/awards.ts` — so full-text stays on post bodies. The palette therefore carries its own JSON index (23 rows, 1.6KB gz), inlined as `application/json` on every page, and loads Pagefind core (12.8KB gz, not the 29.6KB UI) only when a query reaches 3 characters. Each row also indexes the fields it does not display — a paper's full title, authors, and abstract, a competition's summary, a project's stack, a post's tags — because searching only the two shown fields missed "CoTu", which appears in the summary alone. A row that matches on one of those appends the matched span to its detail line, so it always shows why it is listed, and a match late in a long line slides into view rather than sitting past the ellipsis. Matching runs inside words, since "auxi" has to find "Auxiliary" as the visitor types; word-start matches are ranked above interior ones so "ot" finds ViCLIP-OT before "chatbot". A translated pair contributes one row; the dropped title rides along in the same hidden field so a Vietnamese query still matches. The bootstrap costs 2 eager requests (1.1KB gz) because Astro externalizes any `<script>` that holds an import, and Vite adds its preload helper. `<dialog>` + `showModal()` gives the focus trap, the top layer, and Escape. Escape needs three parts, because the native path alone did not hold. The keydown handler on the input calls `close()` itself: the `cancel` event never arrived in one real Chrome session, although the keydown did, which is what an extension that binds Escape at the browser level does. `closedby="any"` states the intent to the browser. The bootstrap holds a cancel flag, since Escape in the gap between the shortcut and the lazy chunk reaches no dialog and the panel would open after the visitor dismissed it. A footer names the four keys, because a palette that opens on a shortcut has to say how to leave. Rejected: cmdk (drags React), ninja-keys/astro-command-palette (dead). |
| Code blocks | **Astro Shiki + `@shikijs/transformers` + custom copy button** | Build-time dual themes, filename labels, line and word highlights, and diffs. Expressive Code stays deferred because this pipeline already meets the requirement. |
| Math | **KaTeX** (`remark-math` + `rehype-katex`) | Fully build-time, 0 runtime JS. Self-host KaTeX fonts. Serif body solves size harmony; MathJax only if exotic LaTeX needed. A `remarkHeadingIds` plugin (2026-08-11) pre-slugs every heading from the raw markdown text, so a heading that contains inline math still gets a TOC anchor that resolves — remark-toc and Astro otherwise slug it differently. |
| Page transitions | **Native CSS `@view-transition`** (Chrome/Edge 126+, Safari 18.2+; **not Firefox**) + CSS micro-interactions (`@starting-style`, 150–250ms, `prefers-reduced-motion` guarded) | **Done (2026-08-01).** `ClientRouter` removed from `Layout.astro`; `@view-transition { navigation: auto }` in `global.css`. Homepage went from a 16KB blocking module fetch to **0 external JS / 1.9KB inline** (2.8KB since the boot intro). Removing it makes every `astro:page-load` / `after-swap` / `before-swap` listener dead — 7 files had to be rewired (see §6 gotcha 9). **Correction:** an earlier draft of this row said "cross-browser now" — that was wrong. MDN rates the at-rule "Limited availability" (lowest Baseline tier); Gecko meta bug 1860854 is still NEW, unassigned, no milestone, 14 open deps. Firefox therefore gets a plain hard navigation, and since `ClientRouter` used the *same-document* API it **would** have animated there — a real if small regression, accepted because 16KB on 100% of loads against the §1 perf bar outweighs animation for ~3–5% of visitors on a site where most visits are 1–2 pages deep. Revisit if Firefox ships. Add `motion/mini` (2.6KB) only if a real need appears. |
| OG images | **satori** pipeline (ships with AstroPaper) | Alternative if friction: `astro-og-canvas` 0.13 (Astro 7 ready, simpler). |
| BibTeX / citations | **Hand-rolled**: publication frontmatter + `<details>` Cite toggle + copy button | Optional: single `publications.bib` as source of truth parsed at build with `@citation-js/plugin-bibtex`. Revisit tooling at ~15 papers. |
| RSS | `@astrojs/rss` — full post bodies in `content:encoded` | The body must reach the feed as a string, but `render()` returns a `<Content />` component, so the route renders each post through `astro/container`. The container export still carries an `experimental_` prefix in Astro 7: check it on an Astro major upgrade. No sanitizer — the posts are the site's own content, so a filter guards a failure that cannot happen here. Feed readers load none of the site CSS, so KaTeX and Shiki markup arrives unstyled. |
| Sitemap | `@astrojs/sitemap` (+ `site` set in config) | |
| Comments | **Skip for v1** | If wanted later: giscus via lazy plain `<script>` (audience has GitHub accounts). |
| Section nav | **Sticky `Header.astro` anchors** | Desktop `/` shows four section links (`Publications`, `Experience`, `Competitions`, `Projects`) beside `Blog`, search, and theme toggle with 0 JS. |
| Post TOC | **`PostTOC.astro`** — fixed "On this page" rail in the gutter right of the article column, current heading marked | **Done (2026-08-21).** Headings come build-time from `render()` (h2–h3); the script only scroll-spies, same contract as `SectionNav` (reading line at 35% of viewport, clicked link pinned, last heading at page bottom). Hidden below `xl`: the 48 rem container leaves no gutter before that, and the inline remark-toc block stays the TOC there. At `xl` and up the roles flip: the rail is 14 rem wide (fits most headings on one line) and a style built in the component from the `TOC_HEADING` slugs hides the inline block — its heading ids plus every `details:not(.spoiler)`, since spoilers are the only other `<details>` and carry the class by convention (`typography.css`). For math-bearing headings, `remarkHeadingIds` renders inline KaTeX HTML into `remarkPluginFrontmatter.tocHtml` before `rehype-katex` flattens `headings[].text`. The inline TOC's own heading is excluded from the rail through `TOC_HEADING`, moved to `src/utils/tocHeading.ts` so `astro.config.ts` and the filter share one source. Label is `post.onThisPage` ("On this page" / "Mục lục"). Rail hrefs are percent-decoded before `getElementById`, since github-slugger keeps Vietnamese diacritics. |
| Analytics | **GoatCounter** (hosted, free, no cookies/banner) | **Done (2026-08-08).** `GoatCounter.astro` sits behind `import.meta.env.PROD` in `Layout.astro`, so dev sessions do not count, and GoatCounter ignores `localhost`. Both `<script>` tags use `is:inline` so Astro does not bundle them and the browser reads `data-goatcounter`. The first script strips `ref`, `src`, `source`, `campaign`, and `utm_*` via `history.replaceState` inside `window.goatcounter.referrer` after `count.js` copies `location.search` (including background tabs), with a fallback when `count.js` is blocked or filtered. **Not** Cloudflare Web Analytics — free tier being wound down. Umami self-hosted as alt. |
| Boot intro | **`BootSequence.astro`** — systemd-style boot log on `/`, once per session | Overrides §1's "no terminal cosplay" for this one component. It uses the site tokens and JetBrains Mono on `--paper`, not a black-and-green tty. `index.astro` passes the entry ids of the publications, competitions, and projects collections. Each section prints at most 5 `Started <id>.service` lines and then counts the rest, so a long collection cannot flood the log. A section with no entries prints nothing. Joke lines follow. The sequence has a fixed length near 4.1 s: a cap on the log compresses the row gaps as content grows, and the last 2 s hold on the login prompt to let the visitor read the log. The log clips at the height of the screen and follows the printing line down, so a long list cannot push a row off the top. Any key ends it early. A press of `t` opens `/tty3` instead. Pointer and scroll input do not end it. A session gate on `<html data-boot>` stops a replay and also skips the overlay under `prefers-reduced-motion: reduce`. Cost against the §1 bar: homepage inline JS goes from 1.9 KB to 2.8 KB, and external JS on `/` stays at 0. |
| tty3 shell | **`src/pages/tty3/`** + `src/scripts/tty.ts` — a simulated shell over the site content | The sequel to the boot intro: the log is tty1 and its login prompt is tty2, so the shell is tty3. Hand-rolled, which makes it the third exception to §1. xterm.js was rejected: it is 117 KB gz and supplies only VT rendering, so every command is hand-written either way. `_utils/buildFs.ts` turns the collections into a flat `path -> body` map at build time, so a directory is any path prefix and new content appears in the shell with no code change. The map ships as a JSON `<script>` (4 KB gz), which is HTML rather than JS; the shell itself is 2.8 KB gz and loads only on this route. `buildFs` keys the content at `/home/visitor`, and the login renames that home to the name the visitor typed, so `pwd`, `ls /home/<name>`, and the prompt all agree. Login accepts each name that has a non-whitespace character. A blank name produces no output and keeps the login prompt. A blank password shows the same error as a locked account. Any non-whitespace password opens an account that is not locked. `root` and `minhnguyent546` are the exception: no password logs in as either, and the two homes `/root` and `/home/minhnguyent546` refuse `ls`, `cd`, and `cat`. They are listed by their parent but hold nothing, so the door exists and stays shut. 17 command names, Tab completion, and history. `fastfetch` and `neofetch` are two names for one built-in summary of the simulated host. The summary has a fixed CPU and GPU profile with no telemetry. `open` uses a new tab, which leaves the session running behind it. All output goes through `textContent`, since `echo` reflects what the visitor typed. A reload restores the screen, the working directory, and the history from `sessionStorage`: the lines are stored as text and re-printed through the same path, so the guard holds. `exit` and `Ctrl+D` use the same logout path. `Ctrl+D` replaces the browser bookmark shortcut while the tty input has focus. Logout removes the tty3 session and replaces its history entry. A direct return starts at login, and Back cannot restore the logged-in tty. The store is the visitor's to edit, so a restored name is checked against the locked accounts again. The last 500 lines are kept, which is 30 KB and 0.13 ms to write. |
| Photon sphere | **`src/pages/photon-sphere.astro`** + `src/scripts/photon-sphere.ts` + `photon-sphere.frag.glsl` — a ray-traced Schwarzschild black hole on a hidden route | The first easter egg: no menu links here. Overrides §1's "no 3D/WebGL hero scenes" and is the fourth hand-rolled exception. Hidden is not the same as unfindable, so three hints lead here: the 404 page names one of the two eggs, picked at random on each load; the tty3 shell carries `/dev/photon_sphere` for `ls` and `cat`, and `open photon`; and a comment in every page head names both. The 404 pick is the one place the near-zero-JS rule bends — the site is static, so only the browser can vary it. The first route still renders server-side, so the hint works without JavaScript. Raw WebGL2, no three.js: the feature is one full-screen fragment shader, and a scene graph, camera rig, and material system are the parts it does not use. WebGL2 is required, not preferred — GLSL ES 1.00 forbids the non-constant `break` that stops the integrator at the horizon, and `highp` in a fragment shader is optional there. Every null geodesic in Schwarzschild lies in a plane through the origin, so each pixel integrates one 2D ODE, `d²u/dφ² = -u + 1.5u²`, for 520 leapfrog steps at `dφ = 0.02`, about 596°: the n=1 lensing ring is light that made one extra half-loop, so it needs ~540 before it can form and a shorter sweep forces a renderer to fake the bright rim. Leapfrog, not RK4: one force evaluation per step buys four times the steps, and step count is what resolves the disk crossings. The shadow, the Einstein ring, and the photon sphere are not drawn — they fall out of the integration. Zeroing the `1.5u²` term shrinks the shadow by 24%, which is the check that the lensing is real. Disk emission combines Doppler and gravitational redshift into one factor `g`, with intensity `g⁴` and temperature `T·g` through the Helland–Bartlett blackbody fit; the measured limb ratio is 2.6. Equatorial crossings composite front to back at low opacity, which shows the disk over and under the hole and lets the lensed higher-order images form the rim at the shadow edge; a drawn rim there is the standard fake. The crossing is solved in closed form, not interpolated, so its error does not depend on the step size. Seen edge-on one pixel covers many noise cells, so the disk texture drops the octaves finer than the pixel and renormalizes the rest; fading them all toward the mean instead lowers the contrast of the whole texture, which is the same operation as deleting it. The footprint comes from the distance and the grazing angle, because `dFdx` is undefined where the disk is sampled in a divergent branch. The noise tiles over 32 cells per turn: `atan` jumps by 2π across its branch cut, and the two sides otherwise read unrelated cells and join as a wedge running out from the hole. Octaves double and offset rather than rotate, since a rotation mixes the two axes and destroys that period. Half a code of dither goes in before the 8-bit write, or the shallow disk gradient bands into contour lines. `devicePixelRatio` caps at 1.5 and the buffer at 1.6 M pixels: at 520 steps per pixel the fragment count is the whole budget. The draw rate is capped at 30 fps, since a 90 s orbit does not need display-rate updates; the frame budget carries a 2 ms margin so a 120 Hz display does not miss the deadline every frame and halve the rate again. `visibilitychange` stops the loop and rebases the clock, so the disk resumes instead of jumping. `webglcontextrestored` rebuilds every GL object and forces the resize, since the canvas keeps its size and would otherwise never re-upload `uResolution` to the new context. `prefers-reduced-motion: reduce` draws one frame and starts no rAF. No WebGL2 reveals one line of text; a canvas-2D version of a per-pixel integrator is a different feature, not a fallback. `noindex` through a new `Layout` prop, and the `astro.config.ts` sitemap filter drops this route and `/tty3/`. Full-bleed with no Header or Footer, `role="img"`, and an English label kept out of the i18n contract: the route has no locale prefix and will not be translated. |

### SEO / metadata
- `schema.org/Person` JSON-LD, canonical URLs, OG/Twitter cards (generated OG images),
  Google Scholar + ORCID links, semantic HTML, sane `robots.txt`.
- Skip: `llms.txt` (no consumers, Google confirmed no effect), webmentions (effort/return).

### Quality tooling
- **ESLint 10** + `eslint-plugin-astro` + typescript-eslint; **Prettier** +
  `prettier-plugin-astro` (pin exact — 0.14.1) + `prettier-plugin-tailwindcss`.
  Biome rejected: `.astro` support still experimental.
- **Import sorting** (added 2026-08-01): `@ianvs/prettier-plugin-sort-imports`.
  Core Prettier never sorts imports, so `pnpm format` left order untouched. The
  plugin must come **first** in `plugins:` — `prettier-plugin-tailwindcss` must load
  last or it stops sorting classes. Groups: builtins → `astro`/`astro:*` → npm →
  `@/` → relative. Side-effect imports (`import "@/styles/global.css"`) are treated
  as barriers and never move, which is what keeps CSS import order correct.
- **`tailwindStylesheet`** (added 2026-08-01): points at `src/styles/global.css`.
  Without it the Tailwind plugin cannot resolve the `@utility` definitions
  (`max-w-app`, `app-layout`, `active-nav`) and sorts them as unknown classes.
  Compiled CSS is byte-identical before and after — the reordering is cosmetic.
- **`.prettierignore`** used an allowlist (`/*` then `!`-exceptions) that silently
  excluded `astro-paper.config.ts`. Any new root-level file needs an explicit
  `!` entry or Prettier skips it with no error. It bit again on 2026-08-01:
  `AGENTS.md`, `lefthook.yml`, and `pnpm-workspace.yaml` were all unformatted and
  invisible. `prettier --check <file>` on an ignored path prints "All matched files use
  Prettier code style!" and exits 0 — a **false green**; `prettier --file-info <file>`
  is the only reliable check. All three now have `!` entries. `CLAUDE.md` stays ignored
  deliberately: it is a symlink to `AGENTS.md`, so listing both formats one file twice.
- **lefthook** pre-commit (wired 2026-08-01): three sequential jobs — `prettier --check`,
  `eslint`, then `astro check`. Three notes. Prettier **checks and does not write**: a
  hook that rewrites a partially staged file can make lefthook lose the unstaged changes
  that it hid. `astro check` **takes no file list**: it type-checks the whole project,
  so its `glob:` only gates
  whether the job runs, and the `{staged_files}` idiom does not apply. And lefthook's own
  install script needs `allowBuilds: lefthook: true` in `pnpm-workspace.yaml` — `pnpm add`
  writes a literal `lefthook: set this to true or false` placeholder that must be
  resolved by hand or the install fails. Verified end-to-end: a staged type error
  exits 1 and blocks `git commit`.
- **`astro check` glob** (narrowed 2026-08-01): `md` and `css` are out, `mdx` stays.
  Markdown and CSS cannot cause a type error, so they made a docs-only commit wait 7.8s
  for a check it could never fail. MDX holds typed JSX, and `@astrojs/mdx` is active.
  Build-time checks in CI still catch content-schema errors. The job stays on pre-commit,
  not pre-push: this repo commits in batches, so a pre-push failure names the batch and
  not the commit. To commit a part-finished refactor, use `LEFTHOOK=0 git commit`. This is
  lefthook's own skip variable, not `--no-verify`.
- **Editor config** (added 2026-08-01): `.vscode/settings.json` +
  `extensions.json` committed. `prettier.documentSelectors` and an `[astro]`
  formatter override are both **required** — VS Code has no built-in `astro`
  language for Prettier, and the Astro extension bundles its own Prettier that
  cannot see `prettier-plugin-tailwindcss` (language-tools#458). `.editorconfig`
  aligned to AstroPaper's Prettier settings (2-space, 80 cols) so the two cannot drift.
  `source.organizeImports` is set to **`"never"`** for `[typescript]`, with
  **`source.removeUnusedImports: "explicit"`** alongside it. `organizeImports` runs in
  mode `All` (sort + merge + remove-unused); its sort groups `astro:*` with npm
  specifiers, while the sort-imports plugin gives `astro:*` its own group ahead of
  `@/`, so enabling both made format-on-save flip-flop between two orderings and never
  converge (7 files in `src/` span that boundary). `removeUnusedImports` is the
  mode `RemoveUnused` half — verified a no-op when nothing is unused, so it cannot
  fight Prettier. Side-effect imports (`import "@/styles/global.css"`) and used
  type-only imports both survive it. `.astro` files were never affected either way:
  their VS Code language ID is `astro`, not `typescript`.
  Removal is **editor-only**. No CLI script strips unused imports — `pnpm format`,
  `pnpm lint`, and `pnpm build` all leave them in place. `astro check` reports
  `ts(6133)` as a *hint* and still **exits 0**, so an unused import never fails the
  build. ESLint has no `no-unused-vars` rule configured.
- **pnpm build allowlist** (2026-08-01): `sharp` and `esbuild` need install scripts,
  or Astro's image pipeline fails. The key differs by major version: pnpm 10 uses
  `onlyBuiltDependencies:` (a list), pnpm 11 **removed** it in favour of
  `allowBuilds:` (a map). Project pins pnpm 11.13.1, so `allowBuilds:` is correct.
  A mismatched key is silently ignored — no error, sharp just never builds.
- **Visual verification** (added 2026-08-01): **Playwright MCP**, user-installed via
  `claude mcp add playwright -- npx @playwright/mcp@latest`. This is what makes
  AGENTS.md's "screenshot at 1440/768/375 and check the console" requirement actually
  executable. Two rules learned the hard way:
  **(1) Test the production build, never the dev server.** A dev server injects
  `@vite/client` and the Astro toolbar, so an "external scripts" count there is
  meaningless — the near-zero-JS bar can only be measured against `dist/`.
  Serve it with `python3 -m http.server <port> --directory dist`.
  **(2) Pick a port other than 4321.** `astro dev` may already own it; the second
  bind fails silently and Playwright then tests the wrong server. Confirm with
  `ss -ltnp | grep <port>`, and check the served HTML for `@vite/client` before
  trusting any measurement. Screenshots land in the repo root; root-level images
  and `/.playwright-mcp/` are both already gitignored.

## 5. Deployment

- **Host:** **GitHub Pages** (user decision; also the research's primary pick for a
  pure-static site — free, zero vendor sprawl, automatic HTTPS).
- **Domain:** **`minhnguyent546.io.vn`** (apex). Briefly changed to a `portfolio.`
  subdomain on 2026-08-01 and changed back the same day — shorter is better, and the
  apex is the stronger identity for a personal site. Apex has real consequences:
  - DNS is **four `A` records** (`185.199.108–111.153`) **plus four `AAAA`**
    (`2606:50c0:800{0,1,2,3}::153`) at `@`. Keep the `A` set even with `AAAA` present —
    GitHub recommends both, citing slow global IPv6 adoption. A plain `CNAME` is
    **not** legal at the apex.
  - **Cloudflare alternative:** the zone is on Cloudflare (`scott`/`zariyah.ns.
    cloudflare.com`), which supports **CNAME flattening** at the root — a single
    `CNAME @ → minhnguyent546.github.io` that Cloudflare resolves and serves as `A`/
    `AAAA` data. Preferred over the eight hard-coded records because it tracks GitHub's
    IPs automatically if they ever change. Either approach works; flattening is one
    record instead of eight.
  - The record must be **DNS-only (grey cloud)**. Proxying hides the true target behind
    Cloudflare's anycast IPs, fails GitHub's DNS check, and blocks Let's Encrypt
    issuance. If ever proxied, Cloudflare SSL/TLS must be **Full (strict)** — Flexible
    against a Pages origin that redirects to HTTPS causes an `ERR_TOO_MANY_REDIRECTS`
    loop.
  - **Add `www` as a `CNAME` → `minhnguyent546.github.io`.** Apex + `www` is the one
    supported pairing (apex + a custom subdomain is not), and GitHub auto-creates the
    redirect between them.
  - **No `CNAME` file in `public/`.** Earlier drafts of this section called for one.
    That is correct only for *branch*-based publishing. With a custom Actions workflow
    GitHub's docs state the file "is ignored and is not required"; the domain lives in
    Settings → Pages instead. (The widely-cited counter-examples are all
    `peaceiris/actions-gh-pages`, which publishes to a branch — a different mechanism
    from our `deploy-pages@v5` artifact upload.)
  - Set the custom domain in repo settings **before** adding DNS records, to claim the
    name against takeover. Enable "Enforce HTTPS" once the cert issues. Any CAA records
    must include `letsencrypt.org`; the zone currently has none, which is fine.
- **`site`** is `https://minhnguyent546.io.vn` in `astro-paper.config.ts` (feeds
  `astro.config.ts`). It drives canonical URLs, the sitemap, RSS, and the OG image
  hostname — verified all of them emit the apex. No `base` needed.
- **CI:** GitHub Actions, two workflows (added 2026-08-01). **Manual steps chosen over
  `withastro/action@v6`** — the wrapper defaults to Node 24 and takes its version as a
  literal string, which would have made the YAML a *third* copy of the version after
  `.nvmrc` and `engines`. The manual form reads `node-version-file: .nvmrc` and lets
  `pnpm/action-setup` read `packageManager`, so **no version appears in either
  workflow**, and both share identical setup steps so they cannot drift.
  - `ci.yml` — push to `main`/`dev` + all PRs: `format:check` → `lint` → `build`.
    Concurrency `cancel-in-progress: true`.
  - `deploy.yml` — push to `main` only: build job → `upload-pages-artifact@v5`, then a
    separate deploy job on the `github-pages` environment via `deploy-pages@v5`.
    Concurrency group `pages` with `cancel-in-progress: **false**` — cancelling a
    half-finished deploy can leave the live site inconsistent.
  - `pnpm build` already runs `astro check` *and* Pagefind, so CI needs no extra step
    for either. Verified end-to-end from a clean clone (install → format → lint →
    build, exit 0, `dist/` carries `index.html` + Pagefind index).
  - Pinned to current majors: `checkout@v7`, `setup-node@v7`, `pnpm/action-setup@v6`,
    `upload-pages-artifact@v5`, `deploy-pages@v5`.
  - **Blocked until two repo settings change** (neither is doable from the workflow
    file): Settings → Pages → Source must be set to **GitHub Actions**, and the repo is
    currently **private**, so Pages needs either a public repo or a paid plan.
- `site: 'https://minhnguyent546.io.vn'` — set in `astro-paper.config.ts`; no `base`
  needed (custom domain, not a project subpath).
- Output: fully static (`output: 'static'`). No SSR, no server islands.

## 6. Astro 7 gotchas (carry into implementation)

1. Default markdown pipeline is now **Sätteri**; any remark/rehype plugin (remark-toc,
   rehype-katex, …) requires `@astrojs/markdown-remark` + `markdown.processor: 'unified'`
   (AstroPaper already does this). remark-toc runs with `maxDepth: 3` — h4+ (problem
   titles, sub-subsections) clutter the collapsible and are reachable by scroll (2026-08-11).
2. `compressHTML` default is `'jsx'` — watch for eaten inline whitespace; use `{" "}`.
3. Rust compiler is strict: unclosed tags/invalid nesting are errors now.
4. `src/fetch.ts` is a reserved filename.
5. Responsive-image style emission changed in v6 — re-check any custom img CSS.
6. Node ≥ 22.12 in CI, `engines`, `.nvmrc`.
7. Put images in `src/` (hashed + optimized via sharp), not `public/`.
8. Astro bundles its own `shiki`. Any `@shikijs/*` package installed directly must
   match that version or `astro check` fails on duplicate `@shikijs/types`.
9. **Removing `ClientRouter` silently breaks every transition lifecycle listener.**
   `astro:page-load`, `astro:after-swap`, and `astro:before-swap` never fire without it,
   so any handler wrapped in one becomes dead code with **no error and no type failure** —
   `astro check` stayed green through the whole removal. AstroPaper puts real behaviour in
   those handlers (theme reflect, mobile-nav binding, `backUrl` persistence, lightbox
   teardown, Pagefind re-init), so each needed unwrapping to run at parse time. Two
   further traps: `transition:name` / `transition:persist` emit **no markup at all**
   without the router (verified: 0 `data-astro-transition-scope` attributes) while still
   injecting ~687 bytes of unused keyframe CSS per page, and `window.__closeLightbox`
   existed only to bridge scopes for a swap handler, becoming a write-only global.
   Plain `style={{ viewTransitionName }}` is the router-free equivalent and works with
   native cross-document transitions — in the engines that support them (see §4:
   not Firefox). Where they are unsupported the name is simply inert, which is why
   this degrades to a hard navigation rather than breaking.

## 7. Implementation phases

1. **Scaffold** — AstroPaper base on Astro 7, pnpm, strip demo content, wire Tailwind v4
   theme tokens (**light default + band pair, per §2.5**), fonts via Fonts API,
   lint/format/lefthook, repo hygiene.
   *Status (2026-08-01): AstroPaper copied in via `degit` (no upstream git history),
   then upgraded from the tag's Astro 6 to **Astro 7.1.6**. Demo posts, Docker/compose,
   cz.yaml, CHANGELOG, theme LICENSE/README, and theme `.github/` removed; homepage
   demo copy replaced. Site identity, timezone `Asia/Ho_Chi_Minh`, `editPost: false`,
   and all six socials set. **lefthook wired** (`lefthook.yml`: prettier → eslint →
   `astro check`, verified to block a commit carrying a type error). **`ClientRouter`
   removed** for native `@view-transition` — homepage now ships **0 external JS,
   1.9KB inline**, down from a 16KB blocking module fetch (§6 gotcha 9). The boot
   intro later took the inline figure to 2.8KB.
   `astro check`, `eslint`, `prettier --check`, and a full `pnpm build` (7 pages) pass.
   **Browser-verified (Playwright MCP, 2026-08-01)** against the production build, not
   the dev server: 0 external scripts on `/`, `@view-transition { navigation: auto }`
   parsed and live, theme toggle drives `data-theme` + `.dark` + computed colours +
   `theme-color` + `localStorage`, dark theme **survives a real cross-document
   navigation** (the behaviour `astro:after-swap` used to provide), `backUrl` persists,
   Pagefind initialises and returns results with `?q=` sync, mobile nav opens at 375px
   with correct aria state. Screenshots at 1440/768/375, console clean.
   **Fixed during verification:** `favicon.ico` 404'd on every page load — AstroPaper
   ships both `.ico` and `.svg`, and the `.ico` was lost when the theme's assets were
   stripped. Removed the `.ico` `<link>` rather than adding the file: the `.svg` line
   already covers every target browser, so it was a fallback for a failure that cannot
   happen here. **Only caught in the browser** — the build emits the tag happily and no
   gate inspects runtime network requests.
   **Still open:** Tailwind colour tokens per §2.5 — deferred to Phase 2 on purpose,
   since they are design-system decisions the `hallmark` skill should govern. Fonts are
   now wired (§4).*
2. **Design system** — colors, type scale, spacing, nav/footer, theme toggle.
3. **Content collections** — schemas for publications / competitions / projects / news /
   articles / blog; port all README content.
   *Status (2026-08-02): done. All README content ported, with paper metadata taken from
   the arXiv API rather than the README, which gives verified author lists and venues.
   Two schema choices worth keeping: a competition `figure` is one object `{src, alt}`,
   so Zod makes alt text impossible to omit; and `datePrecision: "day" | "month"` exists
   because a YAML date always materialises a day, which would print a fabricated day for
   the month-only Viettel entry.
   Contact email is `minhnguyent546@gmail.com` — the config had a domain that does not
   exist. **Done since:** the CV, avatar, and both publication thumbnails.*
4. **Homepage** — all sections in order, publication rows w/ Cite toggle, competition
   entries w/ leaderboard links.
   *Status (2026-08-03): done. Eight sections built from the collections; no copy is
   typed into the page except the About and Contact prose.
   Three §2.5 items became code. **`max-w-app` is now `var(--app-width, 48rem)`**, not a
   fixed utility — the header, main, and footer are siblings, so a second wide utility
   would have left a 48rem header over 80rem content. `Layout` takes a `class` prop; the
   homepage passes `app-wide` (80rem). **The band alternates on
   `main > .band:nth-of-type(even)`**, one rule in `Section.astro`, so the sections must
   stay direct DOM siblings of `main`. **`scroll-padding-top: 3.5rem`** matches the
   sticky index nav; measured clearance after a `#projects` jump is 16px.
   `html`/`body` carry `overflow-x: clip`, never `hidden`, which would make the root a
   scroll container and kill `position: sticky`.
   **Verified** at 320/375/414/768/1440: 0px horizontal overflow, exact 0px band gaps,
   no clickable text over one line, console clean, dark mode re-points both bands.
   **Revised 2026-08-03** after a review of the built page: the type scale is resized
   for Newsreader (§2.5), the index nav marks the current section, and the two image
   components had opposite faults — the publication box over-constrained a wide
   diagram to 158px, and the competition figure had no cap at all, so a 1039×1350
   source rendered 819×1063. Both now size from the real source ratios. The masthead
   and the index nav are not two sticky bars: `Header` is `position: static` and
   scrolls away, so `scroll-padding-top` stays at the height of the index nav alone.*
5. **Long-form** — existing Shiki and custom copy controls, build-time KaTeX, and
   per-post English/Vietnamese support. A translated pair shares one figure folder and
   splits by slug suffix: English holds `/blog/auxiliary-tree/` and Vietnamese takes
   `-vi`. `remark-collapse` gets **one** registration whose `summary` reads the matched
   heading. `unified` keys plugins by function identity, so a second registration merges
   its options into the first and only the last language collapses. A post's own
   `translationOf` wins over an inbound one, and two posts that claim one target stop the
   build; `reference()` does not check that the target exists. A helper that
   `getStaticPaths` calls must be declared inside it: Astro extracts the function into
   its own chunk, and `astro check` passes because the failure is a runtime scope error.
   The blog index became a ledger with a topic axis on 2026-08-11 (see §3). `blog/topic/`
   is now a reserved segment: a static path outranks the `[...slug]` rest param, so a
   post folder of that name would be unreachable.
6. **Per-paper pages** — ViCLIP-OT and soups Nerfies-style pages. A paper page needs a
   preprint, so ViREx-Bench stays a project until one exists.
7. **Features** — Pagefind, view transitions, OG images, and sitemap are done. The ⌘K
   palette landed 2026-08-06 (see §4). `Person` JSON-LD ships on the homepage alone
   (2026-08-08): `PersonSchema.astro` builds it from the config, so `sameAs` and `email`
   track the socials with no second source. The RSS feed carries full post bodies
   (2026-08-08). GoatCounter is wired (2026-08-08).
8. **Ship** — GitHub Pages deploy (Actions + custom domain DNS), Lighthouse/a11y pass,
   cross-device QA. *Done 2026-08-06.* The site serves on the apex, `www` redirects to
   it, and HTTPS is enforced. Lighthouse scores 98–100 across all four categories, and
   axe reports no WCAG violation on nine routes in both themes. Two theme colours needed
   an override to reach AA: the Shiki comment token, which the theme writes as an inline
   custom property that only `color` can outrank, and display KaTeX, which sits outside
   a `<p>` and so missed the prose colour rule.

### Pending investigations

- Test an almost-white semantic surface token when a component needs a white-on-white
  boundary. Start with the `zinc-25` technique (`oklch(99.2% 0 0)`). Keep
  `--paper-alt` for bands, and define a matching dark value.

## 8. Explicitly rejected (with reasons)

- **Bun** (no declared Astro support), **Biome** (experimental `.astro`), **husky**
  (stale: last release 2024-11-18. It also needs lint-staged to scope work to staged
  files, which lefthook does alone.) Checked 2026-08-01: lefthook is much less popular
  (3.4M weekly downloads against husky's 34.3M) but it is the maintained one, and it
  releases often. Risk: one person writes almost all of it. Husky is worse on that same
  point. `lefthook.yml` is 20 lines that wrap existing pnpm scripts, so a later change
  to another runner is cheap.
- **oxc / oxlint / oxfmt** (evaluated 2026-08-01, rejected for now): fastest tools
  available and type-aware linting went stable 2026-07-22, but **oxfmt cannot format
  `.astro` at all** (oxc#19715 — Svelte shipped, Astro still unchecked; maintainer:
  "might take a little while") and oxlint lints only the `<script>` block, with an
  open unused-import false-positive bug on `.astro` (oxc#18878). Revisit when
  oxc#19715 lands Astro — likely, now that Astro and oxc are both under VoidZero.
- **Satoshi / General Sans / Switzer** (Fontshare FFL forbids subsetting; not OFL)
- **astro-icon**, **ninja-keys**, **astro-command-palette** (abandoned) · **cmdk** (React tax)
- **Astro Sphere / astro-nano / research-website-template** as base (stale repos)
- **Hugo Blox** (breaking-rename history) · **Nextfolio (1msirius)** (namespace appears hijacked — security)
- **Cloudflare Web Analytics** (free tier winding down) · **Cloudflare hosting** (user
  chose GitHub Pages for simplicity; Workers Static Assets was the runner-up)
- **`@astrojs/tailwind`** (dead) · **ClientRouter** (16KB on every page load against the
  §1 near-zero-JS bar; native CSS view transitions cover Chrome/Safari and Firefox
  degrades to a hard navigation — see §4 for the accepted trade-off)
- **llms.txt**, **webmentions**, **contact forms**, **GSAP** (overkill)
