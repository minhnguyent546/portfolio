---
name: generate-release-notes
description: Generate grouped, user-facing release notes from a range of git commits.
disable-model-invocation: true
version: 0.1.0
---

# Generate Release Notes

Turn a range of git commits into concise, grouped release notes for the site. Commits
follow Conventional Commits (`type(scope): subject`); the notes reorganize them into
visitor-facing sections, drop internal noise, and cite each commit hash.

## Phase 1: Resolve the Commit Range

Figure out which commits to summarize:

- If the user names a range (`abc123..def456`, `main..dev`), use it directly.
- If the user names a starting point only, use `<ref>..HEAD`.
- For "since the last release" or "since the last deploy": this repository has no tags.
  `main` is what is live — a push to `main` triggers the Pages deploy — so the release
  boundary is `origin/main..HEAD` (fetch first). If tags exist by then, resolve the
  latest with `git describe --tags --abbrev=0` and use `<tag>..HEAD` instead.
- If nothing is specified, ask which range to cover before proceeding — don't guess.

Then read the commits **oldest to newest** so the notes track the order changes landed:

```bash
git log --reverse --no-merges --pretty=format:'%h %s' <range>
```

Use `--pretty=format:'%h %s%n%b'` if you need commit bodies to disambiguate what a
change actually does. Prefer reading the diff (`git show <hash>`) for any commit whose
subject is vague — especially one that touches `src/content/`, where the subject rarely
says what the post or entry is actually about.

## Phase 2: Categorize Commits

Map each commit to a section by what it changes, then by its Conventional Commit type.
Section order and rules:

1. **Content** — any commit that adds or changes site content under `src/content/`
   (posts, publications, projects, news), regardless of type. A new post or paper is the
   headline change for a visitor, so this section leads.
2. **Features** — `feat:` commits outside `src/content/`. New visitor-facing capability.
3. **Fixes** — `fix:` commits outside `src/content/`.
4. **Docs** — reader-facing documentation only.

Omit a section entirely if it has no commits. Additional sections (e.g. **Design**,
**Build**, **CI**) may be added only if the range contains commits the user cares about
there. By default, fold **out** of the notes:

- routine `chore:`, `build:`, `ci:`, `test:`, and dependency bumps;
- `docs(agents)`, `docs(skills)`, and `.plans/` edits — those are instructions to agents,
  not documentation for a reader;
- `refactor:`, `style:`, and `perf:` commits, unless the change is visible on the site —
  a redesigned section, a font swap, a measurable payload cut — in which case it belongs
  under **Features**.

Merge commits are always dropped.

## Phase 3: Write the Notes

For each commit, write one bullet describing the change from a **visitor's perspective**,
not a restatement of the commit subject. Guidelines:

- Lead with the concrete change and, where it adds clarity, the mechanism — e.g. a route,
  component, or design token — using `inline code` for identifiers, paths, and flags.
- End every bullet with the short commit hash in parentheses: `(d940208)`.
- **Group related commits into a single bullet** when they form one logical change (e.g.
  three commits that build the publications section → one bullet), and cite every hash:
  `(b5a8931, b09a304, d9c2662)`.
- Keep bullets tight — one line each where possible. Don't pad with "This commit…".
- Preserve oldest-to-newest ordering within each section.

### Format

Sections are bold labels followed by a bulleted list, in the order given in Phase 2:

```
**Content:**
- <what a visitor can now read> (<hash>)

**Features:**
- <user-facing description with `identifiers`> (<hash>)
- <grouped description> (<hash>, <hash>, <hash>)

**Fixes:**
- <description> (<hash>)

**Docs:**
- <description> (<hash>)
```

## Phase 4: Deliver

Output the release notes directly in the response as a single markdown block the user can
copy. Do **not** write a file unless the user explicitly asks for one. If the range was
ambiguous or you dropped commits you were unsure about, note that briefly after the notes.
