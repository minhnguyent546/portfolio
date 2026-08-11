---
name: hackmd-blog-port
description: Port a HackMD article into a bilingual blog post in src/content/blog/. The input is a HackMD link or a file already downloaded to tmp/. Use when asked to migrate or "port" an article from HackMD to the blog.
disable-model-invocation: true
version: 1.2.0
---

# HackMD → Blog port

The user gives a **HackMD link or a file already downloaded to `tmp/`**. Port the
article into `src/content/blog/`. Two files per article: `<slug>-vi.md` (full
original) and `<slug>.md` (English partial draft — translate only the first sections;
the user finishes the rest later). The EN file carries `translationOf: <slug>-vi`.

## Steps

0. **Get the source.** With a local `tmp/` file, start at step 1. With a link,
   `curl -sL '<url>/download'` returns the raw markdown (this endpoint is robust to
   `@username/` and bare-slug URLs; strip any trailing slash or query first). Save the
   body to `tmp/<slug>.md`. If the response starts with `<!DOCTYPE` instead of `---`,
   the note is not publicly downloadable — extract the markdown manually (paste or
   `export`) rather than scraping the rendered HTML.
1. **Frontmatter.** Rewrite it. `date:` becomes `pubDatetime:`, add `lang:`, and set
   `translationOf` on the EN side. Tags become a YAML list. When the download has no
   date, grep the live HackMD page for `"createTime":<ms>` — that is the publish date
   (it is the note's creation time, not the "last updated" time). The VI title is
   `<EN title> (<Vietnamese title>)`.
2. **Drop the `# H1` and any `###### :paperclip: tags:` line.** The frontmatter title
   replaces both.
3. **`[TOC]` becomes a `## Mục lục` heading** (EN: `## Table of contents`). remark-toc
   matches either, and remark-collapse turns it into a collapsible.
4. **Images.** The original points at `https://hackmd.io/_uploads/<id>.<ext>`.
   Download each with `curl -sL` (the upload URL redirects to S3; `-L` follows it) into
   `src/content/blog/<slug>/` under a descriptive name, and reference it as
   `![alt](./<slug>/name.svg)`. Drop `width=` and inline `style=`; CSS sizes figures.
5. **`<center>` figures.** Drop the wrapper. Two side-by-side figures become a
   `<div class="figure-pair">`; a single figure is a plain `<figure>`, each with
   `<figcaption><em>…</em></figcaption>`.
6. **`:::spoiler Label` → `<details class="spoiler"><summary>Label</summary>`** with a
   code fence inside. A fence inside a raw HTML block still parses, so no plugin is
   needed. The `.spoiler` class is required: the base `details:not(.callout)` rule is
   `inline-block`, which lets a wide `<pre>` grow to content width and clip at the page
   edge. (Override lives in `src/styles/typography.css`.)
7. **Code.** Copy verbatim, but silently fix compile-blocking typos (`paralle_bs` →
   `parallel_bs`, `PBS` → `parallel_bs`) and list them in your response. HackMD writes
   some fences as ` ```cpp! ` — strip the trailing `!` (→ ` ```cpp `); Shiki does not
   recognize the accented language.
8. **Format.** `pnpm exec prettier --write` both posts — the pre-commit hook checks it,
   and ported prose is long-line. **Math must be in lone form**: `$$` alone on its line,
   content tight (no blank lines inside), closing `$$` alone on its line.
   - HackMD glues `$$` to content (`$$M =`, `\end{bmatrix}$$`). Prettier's parser loses
     track of glued blocks and emits a stray `$$` at the end of the file. Rewrite to
     lone form.
   - `\\` on the first content line of a glued-opener block collapses to `\` under
     prettier. Lone form preserves it.
   - HackMD renders `$$…$$` as display math even when it sits mid-sentence
     (`…the equation $$x = 1$$ has…`). remark-math only parses `$$` as display when it
     starts its own line. So break an inline `$$…$$` out into a lone-form display block
     (its own lines) rather than downgrading to `$…$` — that matches HackMD's rendering.
   - One-line `$$…$$` blocks and inline `$…$` are fine as written.
   - A multi-line `$$` block nested under a list bullet is reflowed as markdown
     (`\{` → `{`, `\\` → `\`). Pull it out of the list, or keep it a one-liner.
   - Run `prettier --check` twice. A file that needs a second write is not stable.
9. **Verify.** Whitespace-normalized diff against `tmp/` (compare code fences and prose
   separately; prettier reflow hides line alignment). Then `pnpm build` and a browser
   check at 375/768/1440 with a clean console.

## Known limits

This covers the cases seen so far (auxiliary tree, parallel binary search, xor basis).
HackMD articles vary; check the source for anything new — unusual containers, embeds,
other syntax — and adapt. Do not assume this recipe is complete.

An HTML comment with a blank line inside leaks its tail as visible text (micromark
ends comments at the first blank line). Drop commented-out content rather than
preserving it in a comment.
