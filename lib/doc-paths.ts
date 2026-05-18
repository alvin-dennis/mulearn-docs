import type { Payload } from "payload";
import type { Category, Doc } from "@/payload-types";

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

export function isDoc(value: unknown): value is Doc {
  return Boolean(value && typeof value === "object" && "id" in (value as Record<string, unknown>));
}

export function isCategory(value: unknown): value is Category {
  return Boolean(
    value && typeof value === "object" && "slug" in (value as Record<string, unknown>),
  );
}

export async function resolveCategorySlug({
  category,
  categoryCache,
  payload,
}: {
  category: Doc["category"];
  categoryCache: Map<string, Category>;
  payload: Payload;
}): Promise<string | undefined> {
  if (!category) return;
  if (isCategory(category)) return category.slug;

  const categoryId = String(category);
  if (categoryCache.has(categoryId)) return categoryCache.get(categoryId)?.slug;

  const fetched = (await payload.findByID({
    collection: "categories",
    depth: 0,
    id: categoryId,
  })) as Category;
  categoryCache.set(categoryId, fetched);
  return fetched.slug;
}

export async function resolveDocHref({
  doc,
  docCache,
  categoryCache,
  payload,
}: {
  doc: Doc;
  docCache: Map<string, Doc>;
  categoryCache: Map<string, Category>;
  payload: Payload;
}): Promise<string | undefined> {
  const categorySlug = await resolveCategorySlug({
    category: doc.category,
    categoryCache,
    payload,
  });
  if (!categorySlug) return;

  const segments: string[] = [];
  const visited = new Set<string>();
  let current: Doc | undefined = doc;

  while (current) {
    if (current.slug) segments.unshift(current.slug);
    const parent: Doc | string | number | null | undefined = current.parent;
    if (!parent) break;

    if (isDoc(parent)) {
      current = parent;
      continue;
    }

    const parentId = String(parent);
    if (visited.has(parentId)) break;
    visited.add(parentId);

    const cachedParent = docCache.get(parentId);
    if (cachedParent) {
      current = cachedParent;
      continue;
    }

    const fetchedParent = (await payload.findByID({
      collection: "docs",
      depth: 1,
      id: parentId,
    })) as Doc;
    docCache.set(parentId, fetchedParent);
    current = fetchedParent;
  }

  const normalized = segments.filter(Boolean);
  if (normalized.length > 0 && normalized[normalized.length - 1] === "index") {
    normalized.pop();
  }

  const path = normalized.join("/");
  return path ? `/${categorySlug}/${path}` : `/${categorySlug}`;
}
