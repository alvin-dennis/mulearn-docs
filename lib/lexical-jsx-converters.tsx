import { type JSXConvertersFunction, RichText } from "@payloadcms/richtext-lexical/react";
import type { Payload } from "payload";
import type { JSX } from "react";
import { Callout, Card, CardGrid, PersonaRoute, Steps, Tabs } from "@/components/docs/blocks";
import { isDoc, resolveCategorySlug, resolveDocHref, slugify } from "@/lib/doc-paths";
import { resolveLink } from "@/lib/resolve-link";
import type { Category, Doc } from "@/payload-types";

const headingClasses: Record<string, string> = {
  h1: "md:text-5xl text-4xl font-display font-bold",
  h2: "md:text-4xl text-3xl font-display font-bold",
  h3: "md:text-3xl text-2xl font-display font-light text-primary",
  h4: "md:text-2xl text-xl font-display font-bold",
  h5: "md:text-xl text-lg font-display font-light",
  h6: "md:text-lg text-base font-display font-bold",
};

function extractText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (Array.isArray(node.children)) return node.children.map(extractText).join("");
  return "";
}

export function buildJSXConverters(payload: Payload): JSXConvertersFunction {
  const headingSlugCounts = new Map<string, number>();
  const docCache = new Map<string, Doc>();
  const categoryCache = new Map<string, Category>();

  const getUniqueSlug = (base: string): string => {
    const baseSlug = base || "heading";
    if (headingSlugCounts.has(baseSlug)) {
      const next = (headingSlugCounts.get(baseSlug) ?? 0) + 1;
      headingSlugCounts.set(baseSlug, next);
      return `${baseSlug}-${next}`;
    }
    headingSlugCounts.set(baseSlug, 0);
    return baseSlug;
  };

  const Nested = ({ data }: { data: any }) =>
    data ? <RichText data={data} converters={buildJSXConverters(payload)} /> : null;

  return ({ defaultConverters }) => ({
    ...defaultConverters,

    heading: ({ node, nodesToJSX }) => {
      const Tag = (node.tag || "h2") as keyof JSX.IntrinsicElements;
      const slug = getUniqueSlug(slugify(extractText(node)));
      const className = headingClasses[node.tag as string] ?? "";
      return (
        <Tag id={slug} className={className}>
          {nodesToJSX({ nodes: node.children })}
        </Tag>
      );
    },

    relationship: async ({ node }) => {
      const n = node as any;
      if (n.relationTo !== "docs") return null;
      const raw = n.value;
      let doc: Doc | undefined;
      if (isDoc(raw)) {
        doc = raw;
      } else if (raw != null) {
        const id = String(raw);
        doc = docCache.get(id);
        if (!doc) {
          doc = (await payload.findByID({
            collection: "docs",
            depth: 2,
            id,
          })) as Doc;
          docCache.set(id, doc);
        }
      }
      if (!doc) return null;
      const href = await resolveDocHref({ doc, docCache, categoryCache, payload });
      const body = (
        <article className="lexical-relationship-card !mt-2 rounded-lg border border-border bg-card p-2 shadow-sm">
          <p className="text-sm font-semibold text-primary">{doc.title ?? "Related document"}</p>
          {doc.description ? (
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          ) : null}
        </article>
      );
      return href ? (
        <a
          href={href}
          className="block no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {body}
        </a>
      ) : (
        body
      );
    },

    table: ({ node, nodesToJSX }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          {nodesToJSX({ nodes: node.children })}
        </table>
      </div>
    ),
    tablerow: ({ node, nodesToJSX }) => (
      <tr className="border-b border-border">{nodesToJSX({ nodes: node.children })}</tr>
    ),
    tablecell: ({ node, nodesToJSX }) => {
      const isHeader = (node as any).header;
      const Tag = isHeader ? "th" : "td";
      const className = isHeader
        ? "bg-muted/50 px-4 py-2 text-left font-bold border border-border"
        : "px-4 py-2 border border-border";
      return <Tag className={className}>{nodesToJSX({ nodes: node.children })}</Tag>;
    },

    blocks: {
      callout: ({ node }: { node: any }) => {
        const f = (node as any).fields;
        return (
          <Callout type={f.type}>
            <Nested data={f.text} />
          </Callout>
        );
      },

      card: async ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const link = await resolveLink(f.link, payload);
        if (!link) return null;
        return (
          <Card
            title={f.title}
            description={f.description}
            icon={f.icon}
            href={link.href}
            newTab={link.newTab}
          />
        );
      },

      cardGrid: async ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const resolved = await Promise.all(
          (f.cards ?? []).map(async (c: any) => {
            const link = await resolveLink(c.link, payload);
            if (!link) return null;
            return (
              <Card
                key={c.id}
                title={c.title}
                description={c.description}
                icon={c.icon}
                href={link.href}
                newTab={link.newTab}
              />
            );
          }),
        );
        return <CardGrid columns={f.columns}>{resolved.filter(Boolean)}</CardGrid>;
      },

      steps: ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const items = (f.steps ?? []).map((s: any) => ({
          title: s.title,
          content: <Nested data={s.content} />,
        }));
        return <Steps steps={items} />;
      },

      tabs: ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const items = (f.items ?? []).map((it: any) => ({
          label: it.label,
          content: <Nested data={it.content} />,
        }));
        return <Tabs items={items} />;
      },

      personaRoute: async ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const routes = (
          await Promise.all(
            (f.routes ?? []).map(async (r: any) => {
              const link = await resolveLink(r.link, payload);
              if (!link) return null;
              return {
                persona: r.persona,
                destination: r.destination,
                href: link.href,
                newTab: link.newTab,
              };
            }),
          )
        ).filter((x): x is NonNullable<typeof x> => x != null);
        return <PersonaRoute heading={f.heading} routes={routes} />;
      },
    },
  });
}
