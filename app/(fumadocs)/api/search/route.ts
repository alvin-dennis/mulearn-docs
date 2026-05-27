import { createSearchAPI } from "fumadocs-core/search/server";
import { unstable_cache } from "next/cache";
import { source } from "@/lib/source";

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] };

function extractTextFromLexical(content: { root?: LexicalNode } | null | undefined): string {
  if (!content?.root) return "";
  function fromNode(node: LexicalNode | null | undefined): string {
    if (!node) return "";
    if (node.type === "text") return node.text || "";
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(fromNode).join(" ");
    }
    return "";
  }
  return fromNode(content.root);
}

const buildSearchIndex = unstable_cache(
  async () => {
    const pages = await source.getPages();
    return pages.map((page) => ({
      title: page.data.title,
      description: page.data.description || "",
      url: page.url,
      id: page.url,
      structuredData: {
        headings: [],
        contents: [
          {
            heading: page.data.title,
            content: extractTextFromLexical(page.data.content),
          },
        ],
      },
    }));
  },
  ["docs-search-index-v1"],
  { tags: ["docs"], revalidate: 3600 },
);

let cachedServer: ReturnType<typeof createSearchAPI> | null = null;
let cachedIndexFingerprint: string | null = null;

export const GET = async (request: Request) => {
  const indexes = await buildSearchIndex();
  const fingerprint = `${indexes.length}:${indexes[0]?.id ?? ""}:${indexes[indexes.length - 1]?.id ?? ""}`;
  if (!cachedServer || cachedIndexFingerprint !== fingerprint) {
    cachedServer = createSearchAPI("advanced", { indexes });
    cachedIndexFingerprint = fingerprint;
  }
  return cachedServer.GET(request);
};

export const revalidate = 3600;
