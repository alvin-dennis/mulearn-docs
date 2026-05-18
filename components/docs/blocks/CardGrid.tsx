import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CardGrid({ columns, children }: { columns: "2" | "3"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "my-6 grid gap-4",
        "grid-cols-1 sm:grid-cols-2",
        columns === "3" && "lg:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}
