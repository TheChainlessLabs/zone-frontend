"use client";

/**
 * MobileTabBar — bottom-of-viewport primary nav for ≤ md.
 *
 * Three tabs: Trade · Portfolio · Batches. Tap targets ≥ 44 × 44
 * satisfy the iOS HIG and Material guidelines. Safe-area inset bottom keeps
 * the bar above the home indicator on iOS.
 *
 * Hidden on ≥ md; the desktop Navbar renders the same tabs in its center
 * slot. AppShell adds `pb-[calc(60px+env(safe-area-inset-bottom)+16px)]
 * md:pb-0` to the page wrapper so route content clears the bar (and the
 * iOS home-indicator safe-area inset) on every authenticated route.
 */

import { usePathname } from "next/navigation";
import { Icon } from "@/lib/icons";
import { TransitionLink as Link } from "@/components/shell/transition-link";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { href: "/trade", label: "Trade", icon: Icon.Trade },
  { href: "/portfolio", label: "Portfolio", icon: Icon.Wallet },
  { href: "/batches", label: "Batches", icon: Icon.Batches },
] as const;

export function MobileTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-4 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
    >
      {/* Single floating glass pill — the same register as the desktop
          Navbar, no surrounding bar/hairline competing with the material. */}
      <ul className="glass-pill mx-auto flex h-[52px] max-w-md items-center justify-center gap-1 rounded-full p-1">
        {MOBILE_TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const TabIcon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "press-down inline-flex h-11 w-full min-w-[44px] items-center justify-center gap-2 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                <TabIcon size={18} aria-hidden />
                {isActive && (
                  <span className="overflow-hidden whitespace-nowrap truncate">
                    {tab.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
