"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { slugify } from "@/lib/doc-paths";
import { cn } from "@/lib/utils";

export type TabItem = { label: string; content: ReactNode };

const HASH_KEY = "tab";

function readHashTab(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get(HASH_KEY);
}

function writeHashTab(slug: string) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  params.set(HASH_KEY, slug);
  const newHash = `#${params.toString()}`;
  window.history.replaceState(null, "", newHash);
}

export function Tabs({ items }: { items: TabItem[] }) {
  const id = useId();
  const slugs = useMemo(() => items.map((it, idx) => slugify(it.label) || `tab-${idx}`), [items]);
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const hashSlug = readHashTab();
    if (!hashSlug) return;
    const idx = slugs.indexOf(hashSlug);
    if (idx >= 0) setActive(idx);
  }, [slugs]);

  const select = useCallback(
    (idx: number) => {
      setActive(idx);
      writeHashTab(slugs[idx]);
      tabRefs.current[idx]?.focus();
    },
    [slugs],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      select((active + 1) % items.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      select((active - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0);
    } else if (e.key === "End") {
      e.preventDefault();
      select(items.length - 1);
    }
  };

  return (
    <div className="my-6">
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex border-fd-border border-b"
      >
        {items.map((it, i) => {
          const selected = i === active;
          return (
            <button
              key={slugs[i]}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${id}-tab-${slugs[i]}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${slugs[i]}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-fd-primary text-fd-primary"
                  : "border-transparent text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      {items.map((it, i) => (
        <div
          key={slugs[i]}
          role="tabpanel"
          id={`${id}-panel-${slugs[i]}`}
          aria-labelledby={`${id}-tab-${slugs[i]}`}
          hidden={i !== active}
          className="pt-4 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
        >
          {it.content}
        </div>
      ))}
    </div>
  );
}
