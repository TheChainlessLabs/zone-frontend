"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { OmegaMark } from "./OmegaMark";

type Item = { id: string; number: string; label: string };

export function SectionNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(it.id);
          });
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  return (
    <>
      {/* Desktop: sticky left rail */}
      <nav
        aria-label="Brand board sections"
        className="pointer-events-none fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <a
          href="#top"
          className="pointer-events-auto mb-4 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          aria-label="Top"
        >
          <OmegaMark size={18} />
        </a>
        <ul className="pointer-events-auto flex flex-col gap-1">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="group flex items-center gap-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="relative inline-block h-px w-8">
                    <span className="absolute inset-y-0 left-0 right-0 bg-[var(--border)]" />
                    <span
                      className={`absolute inset-y-0 left-0 right-0 origin-left bg-[var(--foreground)] transition-transform duration-150 ease-[var(--ease-standard)] ${
                        isActive ? "scale-x-100" : "scale-x-[0.25]"
                      }`}
                    />
                  </span>
                  <span className={isActive ? "text-[var(--foreground)]" : ""}>{it.number}</span>
                  <span className={isActive ? "text-[var(--foreground)]" : ""}>{it.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: top progress strip */}
      <nav
        aria-label="Brand board sections"
        className="sticky top-12 z-40 flex overflow-x-auto border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md lg:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <ul className="flex min-w-full gap-0">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id} className="flex-shrink-0">
                <a
                  href={`#${it.id}`}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span>{it.number}</span>
                  <span>{it.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-section-underline"
                      className="absolute inset-x-2 -bottom-px h-px bg-[var(--foreground)]"
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
