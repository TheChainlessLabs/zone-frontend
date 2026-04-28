"use client";

/**
 * Navbar — production app header (desktop ≥ md).
 *
 * Distinct from `ReviewNav` (which serves only /brand and /system review
 * surfaces). This header ships with the v0 routes /trade, /portfolio,
 * /batches, /account.
 *
 * Layout: wordmark left · primary-nav center · WalletStatus right.
 * The primary-nav active indicator uses a shared `motion` `layoutId` so
 * tab switches glide between targets — same pattern as ReviewNav.
 *
 * Mobile (< md) hides the primary-nav center; MobileTabBar renders below
 * instead and the wallet status collapses to the right of the wordmark.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { OmegaMark } from "@/components/OmegaMark";
import { WalletStatus } from "@/components/shell/WalletStatus";

const PRIMARY_TABS = [
  { href: "/trade", label: "Trade" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/batches", label: "Batches" },
] as const;

export function Navbar() {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion() ?? false;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 backdrop-blur-md md:px-8">
      {/* Wordmark */}
      <Link
        href="/trade"
        className="flex items-center gap-2 text-[var(--foreground)] transition-opacity hover:opacity-80"
        aria-label="Omega Markets — Trade"
      >
        <OmegaMark size={20} />
        <span className="font-mono text-[11px] uppercase tracking-[0.24em]">
          OMEGA
        </span>
      </Link>

      {/* Primary nav (desktop only) */}
      <nav
        aria-label="Primary"
        className="hidden items-center gap-1 md:flex"
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
                  layoutId="navbar-active"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
                  }
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--muted)]"
                />
              )}
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right rail — wallet status */}
      <WalletStatus />
    </header>
  );
}
