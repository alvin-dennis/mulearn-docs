import type { Payload } from "payload";
import type { Category, Doc } from "@/payload-types";
import { isDoc, resolveDocHref } from "./doc-paths";

export type LinkValue = {
  type?: "internal" | "external";
  doc?: Doc | string | number | null;
  url?: string | null;
  newTab?: boolean | null;
};

export async function resolveLink(
  link: LinkValue | null | undefined,
  payload: Payload,
): Promise<{ href: string; newTab: boolean } | null> {
  if (!link) return null;

  if (link.type === "external") {
    if (!link.url) return null;
    return { href: link.url, newTab: Boolean(link.newTab) };
  }

  if (!link.doc) return null;

  const docCache = new Map<string, Doc>();
  const categoryCache = new Map<string, Category>();

  let doc: Doc | undefined;
  if (isDoc(link.doc)) {
    doc = link.doc;
  } else {
    doc = (await payload.findByID({
      collection: "docs",
      depth: 2,
      id: String(link.doc),
    })) as Doc;
  }

  if (!doc) return null;
  const href = await resolveDocHref({ doc, docCache, categoryCache, payload });
  return href ? { href, newTab: false } : null;
}
