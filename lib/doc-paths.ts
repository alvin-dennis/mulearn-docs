export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TableOfContentsItem {
  title: string;
  url: string;
  depth: number;
}

function extractTextFromNode(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join("");
  }
  return "";
}

export function extractTableOfContents(content: any): TableOfContentsItem[] {
  if (!content?.root?.children) return [];

  const toc: TableOfContentsItem[] = [];
  const usedSlugs = new Map<string, number>();

  function extractHeadings(node: any): void {
    if (!node) return;

    if (node.type === "heading") {
      const tag = node.tag || "h2";
      const depth = Number.parseInt(tag.substring(1));
      const text = extractTextFromNode(node);

      if (text) {
        let slug = slugify(text);
        if (usedSlugs.has(slug)) {
          const count = usedSlugs.get(slug)! + 1;
          usedSlugs.set(slug, count);
          slug = `${slug}-${count}`;
        } else {
          usedSlugs.set(slug, 0);
        }

        toc.push({ title: text, url: `#${slug}`, depth });
      }
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) extractHeadings(child);
    }
  }

  extractHeadings(content.root);
  return toc;
}
