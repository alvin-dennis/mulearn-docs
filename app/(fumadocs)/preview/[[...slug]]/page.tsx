import { RichText } from "@payloadcms/richtext-lexical/react";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import { cache } from "react";
import { LivePreview } from "@/components/LivePreview";
import { extractTableOfContents } from "@/lib/doc-paths";
import { getHrefMap } from "@/lib/href-map";
import { buildJSXConverters } from "@/lib/lexical-jsx-converters";
import { source } from "@/lib/source";
import config from "@/payload.config";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const getDraftDoc = cache(async (slugs: string[]) => {
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
    depth: 0,
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      slug: true,
      updatedAt: true,
    },
  });

  return docs[0] || null;
});

export default async function PreviewPage(props: PageProps) {
  const payload = await getPayload({ config });
  const user = await payload.auth({ headers: await headers() });
  const params = await props.params;
  const slugs = params.slug || [];

  if (!user.user) {
    const target = slugs.length > 0 ? `/${slugs.join("/")}` : "/";
    redirect(target);
  }

  const [docData, page, hrefMap] = await Promise.all([
    getDraftDoc(slugs),
    source.getPage(slugs),
    getHrefMap(),
  ]);

  if (!page && !docData) notFound();

  const title = docData?.title || page?.data.title;
  const description = docData?.description || page?.data.description;
  const content = docData?.content || page?.data.content;
  const toc = extractTableOfContents(content);

  return (
    <DocsPage
      footer={{ enabled: true }}
      tableOfContent={{ style: "clerk", single: true }}
      toc={toc}
    >
      <LivePreview />
      <DocsTitle className="font-bold font-display text-4xl md:text-5xl">{title}</DocsTitle>
      <DocsDescription>{description}</DocsDescription>
      <div className="flex flex-row items-center border-b" />
      <DocsBody>
        <RichText data={content} converters={buildJSXConverters(hrefMap)} />
      </DocsBody>
    </DocsPage>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
