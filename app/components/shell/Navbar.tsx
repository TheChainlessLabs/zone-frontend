"use client";

/**
 * Navbar — production app header (desktop ≥ md).
 *
 * Distinct from `ReviewNav` (which serves only /brand and /system review
 * surfaces). This header ships with the v0 routes /trade, /portfolio,
 * /batches.
 *
 * Layout: wordmark left · primary-nav center · WalletStatus right.
 *
 * Primary nav is the design-kit segmented glass pill: every route label is
 * always visible, and a single sliding indicator slides under the active
 * tab. The indicator is positioned via `left`/`width` (measured from the
 * active button's box) rather than `transform`, which avoids a Chrome
 * repaint bug with transformed children under `backdrop-filter`. Active
 * label text sits on the indicator (`--background`); inactive labels read
 * as muted.
 *
 * Mobile (< md) hides the primary-nav center; MobileTabBar renders the same
 * tabs in a bottom pill instead and the wallet status collapses to the
 * right of the wordmark.
 */

import * as React from "react";
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

// Match against the first path segment so nested routes (e.g.
// /portfolio/orders) still light their parent tab.
function activeIndex(pathname: string): number {
  const idx = PRIMARY_TABS.findIndex((tab) => pathname.startsWith(tab.href));
  return idx === -1 ? 0 : idx;
}

export function Navbar() {
  const pathname = usePathname() ?? "";
  const active = activeIndex(pathname);

  const navRef = React.useRef<HTMLElement>(null);
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  } | null>(null);

  // Measure the active tab's box and slide the indicator under it. Runs on
  // mount and whenever the active route changes; a ResizeObserver keeps it
  // aligned through viewport/font reflow. jsdom reports zero geometry, so
  // tests simply render without a positioned indicator — labels and links
  // (the asserted surface) are unaffected.
  React.useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = () => {
      const el = nav.querySelector<HTMLElement>('[data-nav-active="true"]');
      if (!el) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="sticky top-3 z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
      <div>
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--foreground)] transition-opacity hover:opacity-80"
          aria-label="Omega Markets — home"
        >
          <OmegaMark size={20} />
          <span className="font-wordmark text-[15px] font-semibold uppercase tracking-[0.14em]">
            OMEGA MARKETS
          </span>
        </Link>
      </div>

      <div className="flex justify-center">
        {/* Primary nav (desktop only) — segmented glass pill with a sliding
            active indicator. All labels visible at all times. */}
        <nav
          ref={navRef}
          aria-label="Primary"
          className="glass-pill relative hidden w-[440px] items-center rounded-full p-1 md:inline-flex"
        >
          {/* Sliding active indicator. Hidden until measured to avoid a
              flash at the origin before geometry is known. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-[var(--foreground)]"
            style={{
              left: indicator?.left ?? 4,
              width: indicator?.width ?? 0,
              opacity: indicator ? 1 : 0,
              transition:
                "left var(--duration-medium) var(--ease-out), width var(--duration-medium) var(--ease-out), opacity var(--duration-small) var(--ease-out)",
            }}
          />
          {PRIMARY_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-nav-active={isActive}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "press-down relative z-[1] inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full px-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  isActive
                    ? "text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                <TabIcon size={16} aria-hidden />
                <span className="whitespace-nowrap">{tab.label}</span>
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
