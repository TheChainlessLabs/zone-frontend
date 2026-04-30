"use client";

/**
 * MobileTabBar — bottom-of-viewport primary nav for ≤ md.
 *
 * Three tabs: Trade · Portfolio · Batches. Tap targets ≥ 44 × 44 to satisfy
 * the iOS HIG and Material guidelines. Safe-area inset bottom keeps the bar
 * above the home indicator on iOS.
 *
 * Hidden on ≥ md; the desktop Navbar renders the same tabs in its center
 * slot. AppShell adds `pb-[calc(60px+env(safe-area-inset-bottom)+16px)]
 * md:pb-0` to the page wrapper so route content clears the bar (and the
 * iOS home-indicator safe-area inset) on every authenticated route.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/lib/icons";

const MOBILE_TABS = [
  { href: "/trade", label: "Trade", icon: Icon.Buy },
  { href: "/portfolio", label: "Portfolio", icon: Icon.Wallet },
  { href: "/batches", label: "Batches", icon: Icon.Proof },
] as const;

export function MobileTabBar() {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion() ?? false;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-[60px] max-w-md items-stretch justify-around">
        {MOBILE_TABS.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const TabIcon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-full min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-3 transition-colors ${
                  isActive
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-tab-active"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
                    }
                    aria-hidden
                    className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-[var(--foreground)]"
                  />
                )}
                <TabIcon size={18} aria-hidden />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
