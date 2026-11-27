# AGENTS.md

Personal website and blog for Minh-Thien Nguyen (`minhnguyent546.io.vn`). Static Astro site, deployed to GitHub Pages.

## Where things live

- `.plans/portfolio-plan.md`: architecture, stack, content inventory, and rejected options. **Read this first.**
- `.research/`: background research reports (`2026-08-01-*.md`). Read a report only when you need it.
- `.agents/skills/`: repo-local skills (`hallmark`, `cp-article-writing`, `hackmd-blog-port`, `generate-release-notes`, `web-design-guidelines`).

Keep `.plans/portfolio-plan.md` current. When a decision changes during implementation, update the plan in the same change.

Keep the plan short. It is a reference for future work, not a work log.

- **Record the decision, not the path to it.** State what was chosen and the one fact that is hard to rediscover. Omit rejected paths, intermediate measurements, and chat discussion.
- **Match nearby entry length.** Most entries are 3 to 8 lines. Longer entries need a reason.
- **Edit the existing entry.** Add a new bullet only for a new decision. Merge duplicate bullets on the same topic.
- **Omit facts held in other files.** Skip details already in code, config, commit messages, or chat. Cite version numbers, timings, or command output only when a number drives the decision.
- **Write in Simplified Technical English** (the `ste` skill): short sentences, active voice, plain words, one topic per entry.

List what you cut from the plan in your response so the user can restore it if needed.

## Commands

Requires Node (`22.23.4+`, `24.22.1+`, or `26.12.1+`; `.nvmrc` pins `22.23.4`) and `pnpm` (`11.13.1+`).

```sh
pnpm install        # install dependencies
pnpm dev            # local dev server on port 4321
pnpm build          # astro check, astro build, and Pagefind indexing
pnpm preview        # preview dist/ via Astro
pnpm lint           # ESLint
pnpm format         # Prettier write
pnpm format:check   # Prettier check without editing files
```

For browser testing, serve `dist/` on a port in `4330-4340`, such as `python3 -m http.server 4331 --directory dist`. Never test the performance bar against `pnpm dev`.

Do not use `nohup`.

## Locked stack decisions

Raise a question before changing any of these.

- **Astro 7** with static output only. No SSR or server islands.
- **Tailwind v4** through `@tailwindcss/vite`, with CSS-first `@theme` tokens in `src/styles/theme.css`. Do not install `@astrojs/tailwind`.
- **Content Layer API** with `glob()` and `file()` loaders in `src/content.config.ts`. Legacy collections were removed in Astro 6.
- **Astro Fonts API** in `astro.config.ts`. Fonts load at build time. Do not add runtime Google Fonts CDN links.
- **Bilingual blog posts (`en` or `vi`).** The site shell stays English, and routes have no locale prefix. Vietnamese posts localize post controls, dates, and metadata via `src/i18n/`. A `translationOf` reference pairs the two versions, and listings show the English side.
- **Rejected tools** (reasons in plan §8): `astro-icon`, `cmdk`, `ClientRouter`, Biome, husky, oxc/oxlint/oxfmt, Fontshare fonts (`Satoshi`, `General Sans`, `Switzer`), Cloudflare Web Analytics.

## Code rules

Listed most important first.

- **Pick the simplest solution that fits current requirements.** Build what the site needs now. Do not add hooks or options for unrequested features.
- **Avoid premature abstraction.** Write concrete code until a real pattern repeats. Two similar blocks are not a pattern.
- **Avoid unnecessary fallbacks.** Unused fallbacks hide real failures. Add a fallback only for a failure you can name.
- **Decide for the long term on choices that are hard to reverse.** Keep content schemas, design token names, and URLs clean from the start instead of shipping stopgaps.
- **Prefer maintained libraries over custom code.** Write custom code only when performance or scope requires it. The four custom interactive parts are the ⌘K palette, the boot sequence, the tty3 shell, and the `/photon-sphere` shader.
- **Compose small modules with explicit interfaces.** Default to components that take props rather than shared central hubs.
- **Keep each module to one job.** Content collections hold data. Layouts and components render it. Utilities and build scripts transform it.
- **Comment only when necessary.** Explain non-obvious constraints, version traps, or unusual trade-offs. Do not narrate what an edit did or what is missing.

## Design rules

The `hallmark` skill governs visual work.

- **No invented content.** Every metric, date, rank, and link must come from the verified content inventory in plan §3. The simulated `tty3` hardware is the sole exception, and each hardware field must include `[simulated]` so it cannot read as a real claim.
- **No slop tells.** Avoid Inter, purple or blue gradients, bento grids, glassmorphism, centered heroes, emoji icons, italic headings, fake browser chrome, and `transition: all`.
- **Quiet craft layout.** Single-column academic layout (`58rem` on `/`, `48rem` on reading pages, `42rem` article column with a centered `32px` post header and deck on blog posts; hairline-ruled `<h2>` headings and `11rem` left gutter on `/`). Light mode is the default; dark mode re-points tokens in `src/styles/theme.css`. Newsreader renders headings and blog prose, IBM Plex Sans renders homepage body and UI, and Source Code Pro renders code and metadata. See plan §2.5 for the full scale and tokens.
- **No redundant helper copy.** Do not add subtitles, helper text, or descriptions beneath headings, labels, cards, or settings by default. Use one concise, self-explanatory label. Add supporting copy only when requested or needed to prevent user error, and never restate the heading.

## Performance bar

Keep initial JavaScript minimal. Render math (KaTeX), code highlighting (Shiki), and static pages at build time. Lazy-load heavier features on interaction: the ⌘K palette module loads on first `⌘K` or search click, and Pagefind loads on query. Keep Lighthouse near 100 across all four categories.

## Verifying

**Never skip verification.** Do not bypass checks or pass `--no-verify` to `git commit`.

The `lefthook.yml` pre-commit hook runs three sequential checks:

1. `prettier --check --ignore-unknown` on staged non-symlink files.
2. `eslint --no-warn-ignored` on staged Astro, TypeScript, and JavaScript files.
3. `astro check` across the whole project when code, JSON, or MDX files are staged.

Give the smallest sufficient proof for your edit. Run `astro check` and a scoped lint rather than a repository-wide sweep when possible. For visual changes, serve `dist/`, capture screenshots at 1440, 768, and 375 px, and check the browser console.

## Git

- **Work in place.** Stay in the current repository directory. Do not use `git worktree` unless asked.
- **Ask before branching.** Do not create or switch branches on your own.
- **Name branches by type.** Use a Conventional Commit prefix such as `feat/tty` or `fix/boot`.
- **Stay safe by default.** `git status`, `git diff`, and `git log` are always fine. Run destructive commands (`reset --hard`, `clean`, `restore`, `checkout <file>`, `rm`) only when asked.
- **Commit and push only when asked.** A narrow instruction like "pull and push" permits only that action, not amends or branch switches. Keep each commit thin and focused.
- **Use Conventional Commits:** `feat`, `fix`, `refactor`, `build`, `ci`, `chore`, `docs`, `style`, `perf`, `test`.
- **Keep edits small.** Avoid repository-wide search-and-replace scripts.
- **Expect concurrent changes.** Treat edits you did not make as belonging to the user or another agent. Stay in your scope, and stop to ask if there is a conflict.
