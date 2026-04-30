"use client";

/**
 * ReviewNav — top bar for the design-review surfaces (/brand, /system).
 *
 * Production routes (/trade, /portfolio, etc.) get their own product navbar
 * later in M3+. This component is for the review/showcase pages only.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { OmegaMark } from "./OmegaMark";
import { ThemeToggle } from "./ThemeToggle";

const TABS = [
  { href: "/brand", label: "Brand" },
  { href: "/system", label: "System" },
] as const;

export function ReviewNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/55 px-4 backdrop-blur-xl backdrop-saturate-[1.4] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] md:px-8 relative">
      {/* Wordmark */}
      <Link
        href="/brand"
        className="flex items-center gap-2 text-[var(--foreground)] transition-opacity hover:opacity-80"
        aria-label="Omega Markets — Brand"
      >
        <OmegaMark size={20} />
        <span className="font-mono text-[11px] uppercase tracking-[0.24em]">Omega</span>
      </Link>

      {/* Tabs */}
      <nav aria-label="Design review surfaces" className="flex items-center gap-1">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative inline-flex h-8 items-center rounded-[var(--radius-md)] px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="review-nav-active"
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--muted)]"
                />
              )}
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <ThemeToggle />
    </header>
  );
}
