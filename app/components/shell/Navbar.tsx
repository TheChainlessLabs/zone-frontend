"use client";

/**
 * Navbar — production app header (desktop ≥ md).
 *
 * Distinct from `ReviewNav` (which serves only /brand and /system review
 * surfaces). This header ships with the v0 routes /trade, /portfolio,
 * /batches.
 *
 * Layout: wordmark left · primary-nav center · WalletStatus right.
 * The primary-nav shares the liquid-glass segmented-pill register used by
 * OrderModeSelector on /trade.
 *
 * Mobile (< md) hides the primary-nav center; MobileTabBar renders below
 * instead and the wallet status collapses to the right of the wordmark.
 */

import { usePathname } from "next/navigation";
import { OmegaMark } from "@/components/OmegaMark";
import { TransitionLink as Link } from "@/components/shell/transition-link";
import { WalletStatus } from "@/components/shell/WalletStatus";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const PRIMARY_TABS = [
  { href: "/trade", label: "Trade", icon: Icon.Trade },
  { href: "/portfolio", label: "Portfolio", icon: Icon.Wallet },
  { href: "/batches", label: "Batches", icon: Icon.Batches },
] as const;

export function Navbar() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-3 z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
      <div>
        {/* Wordmark */}
        <Link
          href="/trade"
          className="flex items-center gap-2 text-[var(--foreground)] transition-opacity hover:opacity-80"
          aria-label="Omega Markets — Trade"
        >
          <OmegaMark size={20} />
          <span className="font-wordmark text-[15px] font-semibold uppercase tracking-[0.14em]">
            OMEGA MARKETS
          </span>
        </Link>
      </div>

      <div className="flex justify-center">
        {/* Primary nav (desktop only) */}
        <nav
          aria-label="Primary"
          className="glass-pill hidden w-[440px] items-center gap-1 rounded-full p-1 md:inline-flex"
        >
          {PRIMARY_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "press-down inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full px-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                <TabIcon size={16} aria-hidden />
                {isActive && (
                  <span className="overflow-hidden whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex justify-end">
        {/* Right rail — wallet status */}
        <WalletStatus />
      </div>
    </header>
  );
}
