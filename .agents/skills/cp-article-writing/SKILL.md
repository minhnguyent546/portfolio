---
name: cp-article-writing
description: >-
  Translate Vietnamese competitive programming and algorithm articles into
  English, or draft and edit English CP articles in src/content/blog/. Use
  when translating a *-vi.md blog post, fixing translation tone or drift, or
  writing a new algorithms/data-structures tutorial in standard Codeforces,
  USACO Guide, and CP-Algorithms style.
---

# Competitive Programming Article Writing & Translation

Write and translate competitive programming (CP) articles for `src/content/blog/`
in the direct, natural register of Codeforces tutorials, USACO Guide, and
CP-Algorithms.

Before translating or editing, read [references/examples.md](./references/examples.md)
for concrete `Vietnamese → Avoid → Preferred` calibration pairs from this blog.

## Faithfulness Rules (VI → EN Translation)

1. **Preserve structure.** Keep the same headings, paragraph breaks, bullet
   lists, and logical progression as the Vietnamese original. Do not skip
   sections or compress multiple paragraphs into one summary.
2. **Preserve logic, qualifiers, and author voice.** Keep conditionals ("in
   problems where..."), qualifiers ("after optimization", "relatively few"),
   frontmatter `description` nuances (do not just copy the title), and personal
   or casual voice ("I have noticed...", "don't worry...", playful CP remarks
   like `:))`). Never silently drop transition sentences or turn a conditional
   into an unconditional claim.
3. **Do not invent content.** Never add extra explanations, analogies, or
   complexity remarks that are not in the source.
4. **Keep code, math, and links exact.** Keep all executable code in fenced
   blocks identical to the Vietnamese source (unless fixing a compile-blocking
   typo, which must be reported). Translate any Vietnamese `//` comments inside
   code blocks into concise English. Keep constraints and math notation exact
   (fix unambiguous LaTeX typos like `Wlog{W}` → `W\log{W}` and report them),
   put math operators inside `$...$` (`$\text{span}(S)$`, `$\text{dim}(V)$`,
   `$\text{msb}(x)$`, `$\max\{a_i\}$`, not `span$(S)$`), and localize
   `vi.wikipedia.org` links to their `en.wikipedia.org` equivalents.
5. **Preserve blog conventions and clean up bilingual artifacts.** Keep
   `## Table of contents`, `translationOf: <slug>-vi`, `<details class="spoiler">`,
   and lone-form `$$` display math blocks (`$$` alone on opening and closing
   lines). Pull multi-line `$$` blocks (matrices, `\begin{cases}`) out of
   bullet-list indentation so Prettier does not collapse `\\` or `\{`. Omit dead
   commented-out Vietnamese HTML blocks. Drop redundant Vietnamese parenthetical
   glosses (`transitive closure (bao đóng bắc cầu)` → `transitive closure`),
   remove backticks that only marked English loanwords in Vietnamese prose or
   headings (keep backticks for code identifiers), and translate `Chú thích:`
   by context (`Legend:` for figures, `Notation:` for variable/function lists).

## Tone & Anti-Patterns

Use clean, natural "we" voice with active verbs ("we split", "we reduce",
"let's walk through"). Avoid **both** common LLM failure modes:

- **Over-rewriting / AI-editorial tone:** rhetorical hooks (*"Where is the waste?"*),
  dramatic em-dashes, hyperbolic phrasing (*"far beyond the limits"*), or
  paraphrasing the author's explanation into a different argument.
- **Choppy / STE-literal tone:** stiff one-clause sentences (*"It means that...
  The value $l_i$ can be greater than $r_i$ because..."*), textbook filler
  (*"The appropriate implementation depends on..."*, *"Suppose that we only need to..."*),
  or non-idiomatic wording (*"binary-search the answer"* with a hyphen, *"has not met it yet"*).

## Standard CP Terminology (VI → EN)

| Vietnamese | Preferred CP English | Avoid |
| --- | --- | --- |
| tìm kiếm nhị phân trên đáp án | binary search on the answer | binary-search the answer |
| sẽ TLE | results in TLE / will TLE | usually times out (unless source says timeout) |
| thành phần liên thông | connected component | — |
| khoảng tìm kiếm | search range | — |
| giới hạn đề bài | the given constraints | the limits |
| trường hợp (input/constraints) | test cases | cases |
| đoạn con (liên tiếp / không liên tiếp) | subarrays or subsequences / subsets | subarrays (when non-contiguous) |
| chia lấy dư cho $m$ | taken modulo $m$ / modulo $m$ | divide by $m$ (wrong math!) |
| phép xor / tổng xor | XOR / bitwise XOR / XOR sum | mixed lowercase `xor` in prose |
| tổng xor của $i$ phần tử đầu tiên | prefix XOR of the first $i$ elements | — |
| độ phức tạp thời gian | time complexity | time cost |
| độ phức tạp bộ nhớ | space complexity | memory complexity |
| quy hoạch động bitmask | bitmask DP | — |
| số chính phương | perfect square | square number (less standard) |
| phép nhân với một vô hướng | scalar multiplication | multiplication by a scalar |
| được trang bị hai phép toán | equipped with two operations | carries two operations |
| độc lập / phụ thuộc tuyến tính | linearly independent / dependent | — |
| bao tuyến tính / cơ sở | linear span / basis | — |
| không gian hàng / cột / hạch | row space / column space / null space | — |
| hạng / số vô hiệu | rank / nullity | — |
| định lý về hạng và số vô hiệu | rank-nullity theorem | — |
| DSU | DSU (Disjoint Set Union) | — |
| BIT / SegmentTree | BIT (Fenwick tree) / Segment Tree | binary indexed tree (BIT) only |
| không thể đảo ngược thao tác | cannot undo / does not support rollback | cannot reverse |
| thứ tự thời gian | chronological order / timestamp | time index |
| bộ bốn số | 4-tuple | tuple (drops arity) |
| cài đặt mẫu | Sample implementation | Example code |
| Tóm tắt đề bài / Đề bài | Problem summary / Problem statement | — |
| Phân tích / Lời giải | Analysis / Solution | — |
| Bài tập luyện tập / áp dụng | Practice problems | — |
| Chú thích: | Legend: (figures) / Notation: (variables) | — |
| tiền bối / tổ tiên / hậu duệ | ancestor / descendant | predecessor / successor (in trees) |
| thứ tự thăm trong phép duyệt DFS | DFS visit order / DFS entry time | — |
| cây con gốc $u$ | subtree rooted at $u$ | — |
| bảng thưa / nhảy nhị phân | sparse table / binary lifting | — |
| quy hoạch động trên cây | tree DP | — |
| lượng đóng góp (của cạnh) | contribution (of an edge) | — |
| truy vết (đáp án) | reconstruct (the answer) / trace back | — |
| đồ thị có hướng / cung | directed graph / directed edge | — |
| bao đóng bắc cầu | transitive closure | — |
| bài toán cái túi | knapsack problem | — |
| định thức / phép khử Gauss | determinant / Gaussian elimination | — |
| phần bù của tập | complement of a set | — |
| dịch trái / dịch phải bit | left shift / right shift | — |
| độ dài của machine word | machine word size | — |

## Workflow

1. **Read the full source** (`src/content/blog/<slug>-vi.md`) and
   [references/examples.md](./references/examples.md).
2. **Check references when unsure.** If the article links to a Codeforces blog,
   USACO Guide page, or problem statement, skim it to match established English
   phrasing for that problem/technique.
3. **Translate or draft in full.** Never truncate remaining sections or leave
   TODOs unless the user explicitly asks for a partial draft.
4. **Reread side-by-side.** Compare each paragraph against `*-vi.md` to catch
   dropped qualifiers, shifted conditionals, math mistranslations, over-rewrites,
   or stiff phrasing.
5. **Verify:**
   - Confirm all executable code blocks match `*-vi.md` (ignoring translated `//` comments):
     ```bash
     python3 -c '
     import re, sys
     vi, en = open(sys.argv[1]).read(), open(sys.argv[2]).read()
     strip = lambda b: "\n".join(re.sub(r"//.*", "", l).rstrip() for l in b.splitlines() if re.sub(r"//.*", "", l).strip())
     vb, eb = re.findall(r"```.*?```", vi, re.S), re.findall(r"```.*?```", en, re.S)
     assert len(vb) == len(eb) and all(strip(a) == strip(b) for a, b in zip(vb, eb))
     print(f"All {len(eb)} code blocks match executable code.")
     ' src/content/blog/<slug>-vi.md src/content/blog/<slug>.md
     ```
   - Run Prettier twice to confirm idempotency (especially around `$$` blocks):
     `pnpm exec prettier --check src/content/blog/<slug>.md`
   - Run `pnpm build` (runs `astro check && astro build`) and verify `0`
     `katex-error` occurrences in `dist/blog/<slug>/index.html`.

## Drafting New English CP Articles

When writing a new English post without a Vietnamese source, keep the same
voice and typical section layout:

`Introduction` → `Example problems` (`Problem statement`, `Constraints`,
`Analysis` or `Solution`, `Sample implementation` inside `<details class="spoiler">`,
`Complexity`) → `References` → `Practice problems`.
