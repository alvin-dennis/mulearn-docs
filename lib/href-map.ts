import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { cache } from "react";
import config from "@/payload.config";
import type { Category, Doc } from "@/payload-types";

export type DocSummary = {
  href: string;
  title: string;
  description?: string;
};

export type HrefMap = Map<string, DocSummary>;

type DocLite = Pick<Doc, "id" | "slug" | "parent" | "category" | "title" | "description">;

function buildHrefForDoc(
  doc: DocLite,
  docsById: Map<string, DocLite>,
  categorySlugById: Map<string, string>,
): string | null {
  const categoryId =
    typeof doc.category === "object" && doc.category !== null
      ? String((doc.category as Category).id)
      : doc.category != null
        ? String(doc.category)
        : null;

  if (!categoryId) return null;
  const categorySlug = categorySlugById.get(categoryId);
  if (!categorySlug) return null;

  const segments: string[] = [];
  const visited = new Set<string>();
  let current: DocLite | undefined = doc;

  while (current) {
    if (current.slug) segments.unshift(current.slug);
    const parent = current.parent;
    if (!parent) break;

    const parentId =
      typeof parent === "object" && parent !== null
        ? String((parent as DocLite).id)
        : String(parent);

    if (visited.has(parentId)) break;
    visited.add(parentId);

    const next = docsById.get(parentId);
    if (!next) break;
    current = next;
  }

  if (segments.length > 0 && segments[segments.length - 1] === "index") {
    segments.pop();
  }

  const path = segments.join("/");
  return path ? `/${categorySlug}/${path}` : `/${categorySlug}`;
}

const buildHrefMap = unstable_cache(
  async (): Promise<Array<[string, DocSummary]>> => {
    const payload = await getPayload({ config });

    const [cats, docs] = await Promise.all([
      payload.find({
        collection: "categories",
        limit: 1000,
        pagination: false,
        depth: 0,
        select: { id: true, slug: true },
      }),
      payload.find({
        collection: "docs",
        limit: 5000,
        pagination: false,
        depth: 0,
        where: {
          or: [{ _status: { equals: "published" } }, { _status: { exists: false } }],
        },
        select: {
          id: true,
          slug: true,
          parent: true,
          category: true,
          title: true,
          description: true,
        },
      }),
    ]);

    const categorySlugById = new Map<string, string>(cats.docs.map((c) => [String(c.id), c.slug]));
    const docsById = new Map<string, DocLite>(docs.docs.map((d) => [String(d.id), d as DocLite]));

    const entries: Array<[string, DocSummary]> = [];
    for (const d of docs.docs) {
      const href = buildHrefForDoc(d as DocLite, docsById, categorySlugById);
      if (!href) continue;
      entries.push([
        String(d.id),
        {
          href,
          title: d.title ?? "",
          description: d.description ?? undefined,
        },
      ]);
    }
    return entries;
  },
  ["docs-href-map-v2"],
  { tags: ["docs", "categories"], revalidate: 3600 },
);

export const getHrefMap = cache(async (): Promise<HrefMap> => {
  const entries = await buildHrefMap();
  return new Map(entries);
});
