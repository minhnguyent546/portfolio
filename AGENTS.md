# AGENTS.md

Personal portfolio for Minh-Thien Nguyen (AI Research Engineer), to be published at
`minhnguyent546.io.vn`. Static Astro site, deployed to GitHub Pages.

## Where things live

| Path | Contents |
|---|---|
| `.plans/portfolio-plan.md` | The plan. Stack, content inventory, phases, rejected options. **Read this first.** |
| `.research/…synthesis-and-action-plan.md` | Index of the five research reports. Read a full report only when you need it. |
| `.agents/skills/hallmark/` | Design skill. `.claude/skills` is a symlink to `.agents/skills`. |

Keep the plan current. When a decision changes during implementation, edit
`.plans/portfolio-plan.md` in the same change.

## Commands

The project uses **pnpm** and **Node 22 LTS** (`>= 22.12`):

```
pnpm install
pnpm dev            # local dev server
pnpm build          # astro check && astro build (Pagefind runs in this step)
pnpm lint           # ESLint
pnpm format         # Prettier
```

## Locked stack decisions

These are decided. Raise a question before you change one.

- **Astro 7**, not 5 or 6. Static output only (`output: 'static'`). No SSR.
- **Tailwind v4** through `@tailwindcss/vite`, with CSS-first `@theme` config.
  `@astrojs/tailwind` is dead. Do not install it.
- **Content Layer API** with `glob()` loaders in `src/content.config.ts`.
  Legacy collections were removed in Astro 6.
- Fonts load through Astro's top-level `fonts` config. No Google Fonts CDN.
- **English only.** Vietnamese glyph coverage is a later phase.
- Rejected, with reasons in the plan §8: `astro-icon`, `cmdk`, `ClientRouter`,
  Biome, husky, Fontshare fonts (Satoshi, General Sans, Switzer),
  Cloudflare Web Analytics.

## Design rules

The `hallmark` skill governs all visual work. Two rules matter most here:

- **No invented content.** Every metric, date, rank, and link must come from the
  content inventory in plan §3. A portfolio that fabricates numbers is worthless.
- **No slop tells.** Inter, purple or blue gradients, bento grids, glassmorphism,
  centred heroes, emoji icons, italic headings, fake browser chrome, `transition: all`.

Design direction is "quiet craft": Swiss typography, dark default, restrained motion.

## Performance bar

Near 0 bytes of JavaScript on page load. Everything runs at build time or loads on
interaction. The ⌘K palette loads on the first keypress. Math renders with KaTeX at
build time. Keep Lighthouse near 100 on all four scores.

## Verifying

Give the smallest sufficient proof. Run `astro check` and a scoped lint, not a
repository-wide sweep. For visual changes, take a screenshot at 1440, 768, and 375 px
and check the browser console.

## Git

- **Work in place.** If the current directory is inside the repository, work there. Do not
  create sibling checkouts. Do not use `git worktree` unless the user asks for one.
- **Ask before you branch.** Do not create or switch branches on your own. End every
  session on the branch that the user expects.
- **Safe by default.** `git status`, `git diff`, and `git log` are always fine. Run
  `reset --hard`, `clean`, `restore`, `checkout <file>`, or `rm` only when the user asks.
  Each of these commands can destroy uncommitted work.
- **Commit and push only when asked.** A narrow instruction such as "pull and push"
  permits that action only. It does not permit an amend or a branch change.
  A push to `main` starts the GitHub Actions deploy and publishes the site.
- **Write new commits.** Use `--amend` only when the user asks for it.
- **Follow Conventional Commits**: `feat | fix | refactor | build | ci | chore | docs |
  style | perf | test`.
- **Keep edits small.** Do not run repository-wide search-and-replace scripts. Keep each
  change scoped and easy to review.
- **Expect concurrent changes.** If you see edits that you did not make, assume that
  another agent or the user made them. Stay inside your own scope. Stop and ask if there
  is a conflict.
