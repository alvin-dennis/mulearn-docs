import type { StructuredData } from "fumadocs-core/mdx-plugins";
import { loader, type MetaData, type Source, type VirtualFile } from "fumadocs-core/source";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { cache } from "react";
import config from "@/payload.config";
import type { Doc } from "@/payload-types";
import { extractTableOfContents, type TableOfContentsItem } from "./doc-paths";
import { buildDocPath } from "./utils";

type PayloadPageData = Doc & { description?: string; structuredData: StructuredData };

function computeStructuredData(doc: Doc): StructuredData {
  const toc = extractTableOfContents(doc.content);
  return {
    headings: toc.map((item: TableOfContentsItem) => ({
      content: item.title,
      id: item.url,
    })),
    contents: [
      {
        content: doc.description || "",
        heading: undefined,
      },
    ],
  };
}

const getSourceFiles = unstable_cache(
  async (): Promise<VirtualFile[]> => {
    const payload = await getPayload({ config });

    const [categoriesResult, docsResult] = await Promise.all([
      payload.find({
        collection: "categories",
        limit: 1000,
        pagination: false,
        sort: "order",
        depth: 0,
      }),
      payload.find({
        collection: "docs",
        limit: 5000,
        pagination: false,
        sort: "order",
        depth: 0,
        where: {
          or: [{ _status: { equals: "published" } }, { _status: { exists: false } }],
        },
      }),
    ]);

    const categories = categoriesResult.docs;
    const allDocs = docsResult.docs;

    // Group docs by category id for fast lookup.
    const docsByCategory = new Map<string, Doc[]>();
    for (const doc of allDocs) {
      const categoryId =
        typeof doc.category === "object" && doc.category !== null
          ? String((doc.category as { id: string | number }).id)
          : doc.category != null
            ? String(doc.category)
            : null;
      if (!categoryId) continue;
      const list = docsByCategory.get(categoryId) ?? [];
      list.push(doc);
      docsByCategory.set(categoryId, list);
    }

    const files: VirtualFile[] = [];

    files.push({
      path: "meta",
      data: {
        pages: categories.map((category) => category.slug),
      } as VirtualFile["data"],
      type: "meta",
    });

    for (const category of categories) {
      const categoryDocs = docsByCategory.get(String(category.id)) ?? [];

      const byId = new Map<string, Doc>();
      for (const doc of categoryDocs) {
        byId.set(String(doc.id), doc);
      }

      const pagesOrder: string[] = [];

      for (const doc of categoryDocs) {
        const docPath = buildDocPath(doc, byId);
        const slugs = docPath ? docPath.split("/") : [];
        const fullPath = slugs.length > 0 ? `${category.slug}/${slugs.join("/")}` : category.slug;

        const isTopLevel = !doc.parent || typeof doc.parent !== "object";
        if (isTopLevel) {
          pagesOrder.push(doc.slug);
        }

        const pageData: PayloadPageData = {
          ...doc,
          description: doc.description || undefined,
          structuredData: computeStructuredData(doc),
        };

        files.push({
          path: fullPath,
          slugs: [category.slug, ...slugs],
          data: pageData as VirtualFile["data"],
          type: "page",
        });
      }

      files.push({
        path: `${category.slug}/meta`,
        data: {
          title: category.title,
          description: category.description || undefined,
          root: true,
          pages: pagesOrder,
        } as VirtualFile["data"],
        type: "meta",
      });
    }

    return files;
  },
  ["docs-source-files-v1"],
  { tags: ["docs", "categories"], revalidate: 3600 },
);

export const getSource = cache(async () => {
  const files = await getSourceFiles();
  const payloadSource: Source<{
    metaData: MetaData;
    pageData: PayloadPageData;
  }> = { files } as Source<{ metaData: MetaData; pageData: PayloadPageData }>;
  return loader({ baseUrl: "/", source: payloadSource });
});

export const source = {
  async getPage(slugs?: string[]) {
    const src = await getSource();
    return src.getPage(slugs);
  },
  async getPages() {
    const src = await getSource();
    return src.getPages();
  },
  async generateParams() {
    const src = await getSource();
    return src.generateParams();
  },
};
