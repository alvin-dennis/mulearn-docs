import { AlertTriangle, Ban, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warn" | "danger" | "success";

const VARIANTS: Record<CalloutType, { wrapper: string; icon: ReactNode; label: string }> = {
  info: {
    wrapper: "border-fd-primary/30 bg-fd-primary/5 text-fd-foreground",
    icon: <Info className="size-5 text-fd-primary" aria-hidden />,
    label: "Info",
  },
  warn: {
    wrapper: "border-amber-500/30 bg-amber-500/5 text-fd-foreground",
    icon: <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" aria-hidden />,
    label: "Warning",
  },
  danger: {
    wrapper: "border-red-500/30 bg-red-500/5 text-fd-foreground",
    icon: <Ban className="size-5 text-red-600 dark:text-red-400" aria-hidden />,
    label: "Danger",
  },
  success: {
    wrapper: "border-emerald-500/30 bg-emerald-500/5 text-fd-foreground",
    icon: <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />,
    label: "Success",
  },
};

export function Callout({ type, children }: { type: CalloutType; children: ReactNode }) {
  const v = VARIANTS[type] ?? VARIANTS.info;
  return (
    <div
      role="note"
      aria-label={v.label}
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4 text-sm leading-relaxed  items-start justify-center",
        v.wrapper,
      )}
    >
      <div className="mt-0.5 shrink-0">{v.icon}</div>
      <div className="min-w-0 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}
