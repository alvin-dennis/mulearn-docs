import { ArrowRight } from "lucide-react";

export type RouteItem = { persona: string; destination: string; href: string; newTab?: boolean };

const DEFAULT_HEADING = "Already know what you're looking for?";

export function PersonaRoute({ heading, routes }: { heading?: string; routes: RouteItem[] }) {
  return (
    <section className="my-6 rounded-lg border border-fd-border bg-fd-card p-5">
      <h3 className="mb-3 font-semibold text-fd-card-foreground">{heading || DEFAULT_HEADING}</h3>
      <ul className="flex flex-col divide-y divide-fd-border">
        {routes.map((r, i) => {
          const external = r.newTab || /^https?:\/\//.test(r.href);
          return (
            <li key={`${i}-${r.persona}`}>
              <a
                href={r.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-3 py-2 no-underline hover:text-fd-primary"
              >
                <ArrowRight className="size-4 text-fd-muted-foreground" aria-hidden />
                <span className="min-w-[10rem] font-medium">{r.persona}</span>
                <span className="text-fd-muted-foreground group-hover:text-fd-primary">
                  {r.destination}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
