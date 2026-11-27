type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

/**
 * Wraps each Markdown `<table>` in a horizontal scroll container so wide
 * benchmark tables stay flush (`width: 100%`) with the prose column on desktop
 * and scroll cleanly inside the box on narrow screens without pushing the page.
 */
export function rehypeWrapTables() {
  const walk = (node: Node) => {
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === "element" && child.tagName === "table") {
        node.children[i] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"], tabIndex: 0 },
          children: [child],
        };
      } else {
        walk(child);
      }
    }
  };
  return walk;
}
