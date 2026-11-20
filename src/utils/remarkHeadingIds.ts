import Slugger from "github-slugger";
import katex from "katex";
import { toString } from "mdast-util-to-string";

type Node = {
  type: string;
  depth?: number;
  value?: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: Node[];
};

type VFile = {
  data: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
};

function hasInlineMath(node: Node): boolean {
  if (node.type === "inlineMath") return true;
  return node.children?.some(hasInlineMath) ?? false;
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInlineHtml(node: Node): string {
  if (node.type === "inlineMath") {
    return katex.renderToString(node.value ?? "", { throwOnError: false });
  }
  if (node.type === "inlineCode") {
    return `<code>${escapeHtml(node.value ?? "")}</code>`;
  }
  if (node.type === "text") {
    return escapeHtml(node.value ?? "");
  }
  // Unwrap links and formatting into their children so TOC <a> tags never nest.
  return (node.children ?? []).map(renderInlineHtml).join("");
}

/**
 * remark-toc links to heading ids it slugs from the raw markdown text, but Astro
 * assigns heading ids from the rendered text, after rehype-katex has replaced
 * inline math with its HTML. The two disagree on any heading that contains math:
 * `\mathcal{O}(n^3 / \log{n})` slugs to `...-mathcalon3--logn`, the rendered
 * `O(n³/log n)\mathcal{O}(…)(…)` slugs to `...-on3lognmathcalon3--lognon3logn`,
 * so the TOC entry points nowhere.
 *
 * Pre-assign each heading the same slug remark-toc would compute. The plugin runs
 * before remark-toc, which then reuses the id (`mdast-util-toc` slugs `id || value`),
 * and Astro keeps an existing id (`rehype-collect-headings` only sets it when
 * absent). github-slugger maps its own output back to itself, so remark-toc
 * re-slugging the id is a no-op. Both run over the same heading sequence, so
 * duplicate headings get the same `-1` suffixes on either side.
 *
 * For h2/h3 headings containing inline math, also render KaTeX HTML into
 * `frontmatter.tocHtml[slug]` so `PostTOC.astro` shows formatted math instead of
 * the flattened MathML + annotation + HTML string Astro collects in `headings[].text`.
 *
 * The tree is walked by hand rather than with `unist-util-visit`, which this
 * project reaches only as a transitive dependency of `@astrojs/markdown-remark`.
 */
export function remarkHeadingIds() {
  const slugger = new Slugger();
  return (tree: Node, file: VFile) => {
    slugger.reset();
    const tocHtml: Record<string, string> = {};
    const walk = (node: Node) => {
      if (node.type === "heading") {
        const slug = slugger.slug(toString(node, { includeImageAlt: false }));
        node.data ??= {};
        node.data.hProperties ??= {};
        node.data.hProperties.id = slug;
        if ((node.depth === 2 || node.depth === 3) && hasInlineMath(node)) {
          tocHtml[slug] = (node.children ?? []).map(renderInlineHtml).join("");
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
    if (Object.keys(tocHtml).length > 0) {
      file.data.astro ??= {};
      file.data.astro.frontmatter ??= {};
      file.data.astro.frontmatter.tocHtml = tocHtml;
    }
  };
}
