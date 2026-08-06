type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

/**
 * KaTeX renders every expression twice: `.katex-mathml` for assistive tech and
 * `.katex-html` for sight. Pagefind reads both, so one formula enters the index
 * as its LaTeX source and again as its rendered glyphs, and an excerpt around it
 * comes back as `O(NlogN)\mathcal{O}(N\log{N})O(NlogN)`. Marking the MathML copy
 * leaves the accessible tree untouched and cuts the duplicate from the index.
 *
 * The tree is walked by hand rather than with `unist-util-visit`, which this
 * project reaches only as a transitive dependency of `rehype-katex`.
 */
export function rehypeIgnoreMathml() {
  const walk = (node: Node) => {
    const className = node.properties?.className;
    if (Array.isArray(className) && className.includes("katex-mathml")) {
      node.properties!["data-pagefind-ignore"] = true;
    }
    node.children?.forEach(walk);
  };
  return walk;
}
