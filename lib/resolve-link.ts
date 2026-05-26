import type { Doc } from "@/payload-types";
import type { HrefMap } from "./href-map";

export type LinkValue = {
  type?: "internal" | "external";
  doc?: Doc | string | number | null;
  url?: string | null;
  newTab?: boolean | null;
};

export function resolveLink(
  link: LinkValue | null | undefined,
  hrefMap: HrefMap,
): { href: string; newTab: boolean } | null {
  if (!link) return null;

  if (link.type === "external") {
    if (!link.url) return null;
    return { href: link.url, newTab: Boolean(link.newTab) };
  }

  if (!link.doc) return null;

  const docId =
    typeof link.doc === "object" && link.doc !== null
      ? String((link.doc as Doc).id)
      : String(link.doc);

  const summary = hrefMap.get(docId);
  if (!summary) return null;

  return { href: summary.href, newTab: false };
}
