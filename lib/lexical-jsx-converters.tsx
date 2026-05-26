import { type JSXConvertersFunction, RichText } from "@payloadcms/richtext-lexical/react";
import type { JSX } from "react";
import { Callout, Card, CardGrid, PersonaRoute, Steps, Tabs } from "@/components/docs/blocks";
import { slugify } from "@/lib/doc-paths";
import type { HrefMap } from "@/lib/href-map";
import { resolveLink } from "@/lib/resolve-link";

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

export function buildJSXConverters(hrefMap: HrefMap): JSXConvertersFunction {
  const headingSlugCounts = new Map<string, number>();

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
    data ? <RichText data={data} converters={buildJSXConverters(hrefMap)} /> : null;

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

    relationship: ({ node }) => {
      const n = node as any;
      if (n.relationTo !== "docs") return null;
      const raw = n.value;
      const docId =
        typeof raw === "object" && raw !== null ? String(raw.id) : raw != null ? String(raw) : null;
      if (!docId) return null;
      const summary = hrefMap.get(docId);
      if (!summary) return null;

      const body = (
        <article className="lexical-relationship-card !mt-2 rounded-lg border border-border bg-card p-2 shadow-sm">
          <p className="text-sm font-semibold text-primary">
            {summary.title || "Related document"}
          </p>
          {summary.description ? (
            <p className="text-sm text-muted-foreground">{summary.description}</p>
          ) : null}
        </article>
      );

      return (
        <a
          href={summary.href}
          className="block no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {body}
        </a>
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

      card: ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const link = resolveLink(f.link, hrefMap);
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

      cardGrid: ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const cards = (f.cards ?? [])
          .map((c: any) => {
            const link = resolveLink(c.link, hrefMap);
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
          })
          .filter(Boolean);
        return <CardGrid columns={f.columns}>{cards}</CardGrid>;
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
        const items = (f.items ?? []) as Array<{ label: string; content: any }>;
        const labels = items.map((it) => it.label);
        return (
          <Tabs labels={labels}>
            {items.map((it, idx) => (
              <Nested key={`${idx}-${it.label}`} data={it.content} />
            ))}
          </Tabs>
        );
      },

      personaRoute: ({ node }: { node: any }) => {
        const f = (node as any).fields;
        const routes = (f.routes ?? [])
          .map((r: any) => {
            const link = resolveLink(r.link, hrefMap);
            if (!link) return null;
            return {
              persona: r.persona,
              destination: r.destination,
              href: link.href,
              newTab: link.newTab,
            };
          })
          .filter((x: unknown): x is NonNullable<typeof x> => x != null);
        return <PersonaRoute heading={f.heading} routes={routes} />;
      },
    },
  });
}
