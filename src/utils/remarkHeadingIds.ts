import Slugger from "github-slugger";
import { toString } from "mdast-util-to-string";

type Node = {
  type: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: Node[];
};

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
 * The tree is walked by hand rather than with `unist-util-visit`, which this
 * project reaches only as a transitive dependency of `@astrojs/markdown-remark`.
 */
export function remarkHeadingIds() {
  const slugger = new Slugger();
  return (tree: Node) => {
    slugger.reset();
    const walk = (node: Node) => {
      if (node.type === "heading") {
        node.data ??= {};
        node.data.hProperties ??= {};
        node.data.hProperties.id = slugger.slug(
          toString(node, { includeImageAlt: false })
        );
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
