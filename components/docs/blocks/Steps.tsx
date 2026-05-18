import type { ReactNode } from "react";

export type StepItem = { title: string; content: ReactNode };

export function Steps({ steps }: { steps: StepItem[] }) {
  return (
    <ol className="my-6 flex flex-col gap-6 border-fd-border border-l pl-6">
      {steps.map((step, i) => (
        <li key={`${i}-${step.title}`} className="relative">
          <span
            aria-hidden
            className="-left-[2.125rem] absolute top-0 flex size-7 items-center justify-center rounded-full border border-fd-border bg-fd-background text-xs font-semibold text-fd-foreground"
          >
            {i + 1}
          </span>
          <h4 className="font-semibold text-fd-foreground">{step.title}</h4>
          <div className="mt-1 text-sm text-fd-muted-foreground [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            {step.content}
          </div>
        </li>
      ))}
    </ol>
  );
}
