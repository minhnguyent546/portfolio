# AGENTS.md

Personal portfolio. Static Astro site, deployed to GitHub Pages.

## Where things live

- Plan at `.plans/portfolio-plan.md`: The plan. Stack, content inventory, phases, rejected options. **Read this first.**
- Research at `.research/`: Index of the research reports. Read a full report only when you need it.

Keep the plan current. When a decision changes during implementation, edit
`.plans/portfolio-plan.md` in the same change.

Keep the plan short. It is a reference for a future reader, not a log of the work. It
must stay readable at the end of the project, so every edit competes for space with
everything already there.

- **Record the decision, not the path to it.** Write what was chosen and the one fact
  that makes it hard to rediscover. Leave out the options you rejected on the way, the
  measurements that led you there, and the argument you made in chat.
- **Match the length of the entries beside it.** Most are 3 to 8 lines. A new entry that
  runs longer needs a reason.
- **Edit the entry that exists.** Add a new bullet only for a new decision. Two bullets
  on one topic must become one.
- **Leave out the things that other files hold.** Skip anything that is already in the
  code, the config, the commit message, or the response to the user. Version numbers,
  timings, download counts, and command output all go stale, so cite them only when a
  number is the reason for the decision.
- **Write in Simplified Technical English** (the `ste` skill): short sentences, active
  voice, plain words, one topic per entry.

Say what you cut from the plan in your response, so the user can ask for it back.

## Commands

The project uses `pnpm` and `Node 22`:

```
pnpm install
pnpm dev            # local dev server on port 4321
pnpm build          # astro check && astro build (Pagefind runs in this step)
pnpm lint           # ESLint
pnpm format         # Prettier
```

For serving for testing, use the port range `4330-4340`, e.g., `python3 -m http.server 4331 --directory dist`.

## Locked stack decisions

These are decided. Raise a question before you change one.

- **Astro 7**, not 5 or 6. Static output only (`output: 'static'`). No SSR.
- **Tailwind v4** through `@tailwindcss/vite`, with CSS-first `@theme` config.
  `@astrojs/tailwind` is dead. Do not install it.
- **Content Layer API** with `glob()` loaders in `src/content.config.ts`.
  Legacy collections were removed in Astro 6.
- Fonts load through Astro's top-level `fonts` config. No Google Fonts CDN.
- Blog posts declare English or Vietnamese. The site shell stays English, and routes have no locale prefix.
- Rejected, with reasons in the plan §8: `astro-icon`, `cmdk`, `ClientRouter`,
  Biome, husky, Fontshare fonts (Satoshi, General Sans, Switzer),
  Cloudflare Web Analytics.

## Code rules

Listed most important first.

- **Choose the simplest implementation that meets the current requirements.** Write what the site needs now. Do not build for a requirement that nobody asked for.
- **Avoid premature abstraction.** Write concrete code until a real pattern appears. Two similar blocks are not a pattern.
- **Avoid unnecessary fallbacks.** A fallback that nobody needs hides the real failure.
  Add one only for a failure that you can name.
- **Decide for the long term.** A simple solution is not the same as a temporary one. Do not accept a stopgap that you plan to replace later. This matters most for the choices that are hard to reverse: the content schemas, the design token names, and the URLs.
- **Prefer established, well-maintained libraries over custom code.** Write custom code only when the performance bar forces it. The plan permits three hand-rolled parts: the ⌘K palette, the BibTeX cite toggle, and the tty3 shell. Use a library for everything else.
- **Compose small modules with explicit interfaces.** Do not build a central system that every other file imports. A component that takes props is the default unit.
- **Keep each module to one job.** Content collections hold the data. Layouts and
  components render it. Build scripts transform it. Do not mix these three.
- **Comment only when necessary.** A comment must explain something the code cannot:
  a non-obvious constraint, a version trap, a reason for an unusual choice. Never
  narrate what an edit did, why you chose it, or what is missing. Those belong in the
  response or the plan, not the file.

## Design rules

The `hallmark` skill governs all visual work. Two rules matter most here:

- **No invented content.** Every metric, date, rank, and link must come from the
  content inventory in plan §3. A portfolio that fabricates numbers is worthless.
  The fictional tty3 hardware is the only exception. Each hardware field must say
  `simulated` so it cannot read as a portfolio claim.
- **No slop tells.** Inter, purple or blue gradients, bento grids, glassmorphism,
  centred heroes, emoji icons, italic headings, fake browser chrome, `transition: all`.

Design direction is "quiet craft": Swiss typography, light default with banded
sections, restrained motion. Dark mode is a token re-point, not a second design.
Tokens, type scale, and the band mechanism are specified in plan §2.5.

**Other UI rules:**

- Do not add subtitles, helper text, or descriptive copy beneath headings, labels, cards,
  or settings by default. Prefer one concise, self-explanatory heading
  or label. Only add supporting copy when the user explicitly asks for it or when it is
  necessary to prevent misunderstanding or error, and never use it to restate the heading.

## Performance bar

Near 0 bytes of JavaScript on page load. Everything runs at build time or loads on
interaction. The ⌘K palette loads on the first keypress. Math renders with KaTeX at
build time. Keep Lighthouse near 100 on all four scores.

## Verifying

**Never skip verification.** Do not bypass a required check, a test, or a quality gate.
The lefthook pre-commit hook runs Prettier and `astro check` on staged files. Do not pass
`--no-verify` to `git commit`.

Give the smallest sufficient proof. Run `astro check` and a scoped lint, not a
repository-wide sweep. For visual changes, take a screenshot at 1440, 768, and 375 px
and check the browser console.

## Git

- **Work in place.** If the current directory is inside the repository, work there.
  Do not use `git worktree` unless the user asks for one.
- **Ask before you branch.** Do not create or switch branches on your own.
- **Name branches by type.** Use a Conventional Commit prefix, such as `feat/tty` or
  `fix/boot`.
- **Safe by default.** `git status`, `git diff`, and `git log` are always fine. Run
  `reset --hard`, `clean`, `restore`, `checkout <file>`, or `rm` only when the user asks.
  Each of these commands can destroy uncommitted work.
- **Commit and push only when asked.** A narrow instruction such as "pull and push"
  permits that action only. It does not permit an amend or a branch change.
  A push to `main` starts the GitHub Actions deploy and publishes the site.
  Keep each commit thin and focused, do not commit a large batch of changes at once.
- **Follow Conventional Commits**:
  `feat | fix | refactor | build | ci | chore | docs | style | perf | test`.
- **Keep edits small.** Do not run repository-wide search-and-replace scripts. Keep each
  change scoped and easy to review.
- **Expect concurrent changes.** If you see edits that you did not make, assume that
  another agent or the user made them. Stay inside your own scope. Stop and ask if there
  is a conflict.
