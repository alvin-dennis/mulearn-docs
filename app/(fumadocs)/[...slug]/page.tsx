import { RichText } from "@payloadcms/richtext-lexical/react";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { LivePreview } from "@/components/LivePreview";
import { extractTableOfContents } from "@/lib/doc-paths";
import { buildJSXConverters } from "@/lib/lexical-jsx-converters";
import { source } from "@/lib/source";
import config from "@/payload.config";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getDoc(slugs: string[]) {
  const payload = await getPayload({ config });
  const isHome = slugs.length === 0;
  const lastSlug = isHome ? "home" : slugs[slugs.length - 1];
  const categorySlug = slugs.length > 1 ? slugs[slugs.length - 2] : null;

  const { docs } = await payload.find({
    collection: "docs",
    draft: true,
    where: {
      and: [
        { slug: { equals: lastSlug } },
        ...(categorySlug ? [{ "category.slug": { equals: categorySlug } }] : []),
      ],
    },
    depth: 2,
  });

  return docs[0] || null;
}

function parseUpdatedAt(raw: string): string | undefined {
  const d = new Date(raw.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default async function Page(props: PageProps) {
  const payload = await getPayload({ config });
  const params = await props.params;
  const slugs = params.slug || [];
  const user = await payload.auth({ headers: await headers() });

  const docData = await getDoc(slugs);
  const page = await source.getPage(slugs);

  if (!page && !docData) notFound();

  const title = docData?.title || page?.data.title;
  const description = docData?.description || page?.data.description;
  const content = docData?.content || page?.data.content;
  const updatedAt = docData?.updatedAt ? parseUpdatedAt(docData.updatedAt as string) : undefined;

  const toc = extractTableOfContents(content);

  return (
    <DocsPage
      footer={{ enabled: true }}
      tableOfContent={{ style: "clerk", single: true }}
      toc={toc}
    >
      {user && <LivePreview />}
      <DocsTitle className="font-bold font-display text-4xl md:text-5xl">{title}</DocsTitle>
      <DocsDescription>{description}</DocsDescription>
      <div className="flex flex-row items-center border-b" />
      <DocsBody>
        <RichText data={content} converters={buildJSXConverters(payload)} />
      </DocsBody>
      {updatedAt && (
        <p className="text-sm text-fd-muted-foreground -mt-2 mb-4">Last updated on {updatedAt}</p>
      )}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return await source.generateParams();
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const slugs = params.slug || [];

  const doc = await getDoc(slugs);

  if (doc) {
    return {
      title: doc.title,
      description: doc.description || undefined,
    };
  }

  const page = await source.getPage(slugs);
  if (!page) return { title: "Not Found" };

  const image = `/og/${[...slugs, "image.png"].join("/")}`;

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: { images: image },
    twitter: { card: "summary_large_image", images: image },
  };
}

export const revalidate = 30;
