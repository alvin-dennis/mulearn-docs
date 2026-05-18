import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardProps = {
  title: string;
  description?: string;
  icon?: string;
  href: string;
  newTab?: boolean;
};

export function Card({ title, description, icon, href, newTab }: CardProps) {
  const external = newTab || /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-fd-border bg-fd-card p-4",
        "no-underline transition-colors hover:border-fd-primary/50 hover:bg-fd-accent",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
      )}
    >
      <div className="flex items-center gap-2 font-semibold text-fd-card-foreground">
        {icon ? <span aria-hidden>{icon}</span> : null}
        <span>{title}</span>
      </div>
      {description ? <p className="text-sm text-fd-muted-foreground">{description}</p> : null}
      <ArrowRight
        className="mt-auto size-4 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  );
}
