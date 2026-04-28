/**
 * PageLayout — shared container + responsive surface for every v0 production
 * route (`/trade`, `/portfolio`, `/batches`, `/account`).
 *
 * Goals:
 * - One container pattern. All pages share max-width, padding, vertical
 *   rhythm. Drift-resistant: reach for a different layout only with an ADR.
 * - Mobile-first responsive. Padding tightens at sm; loosens at md/lg.
 * - Soft surface treatment via a single `width` prop:
 *     `narrow`  ~ 480px  — Market-mode `/trade`, single-column flows
 *     `default` ~ 1024px — most surfaces (`/portfolio`, `/account`)
 *     `wide`    ~ 1280px — `/batches` table, Limit-mode `/trade` split layout
 *     `full`              — edge-to-edge (rare; chart pages, etc.)
 * - The global background dot grid lives in `app/app/layout.tsx`; PageLayout
 *   does not duplicate it.
 *
 * Consumers:
 *
 *   <PageLayout
 *     title="Portfolio"
 *     description="Your positions, balances, fills."
 *     width="default"
 *   >
 *     {children}
 *   </PageLayout>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const WIDTHS = {
  narrow: "max-w-[480px]",
  default: "max-w-[1024px]",
  wide: "max-w-[1280px]",
  full: "max-w-none",
} as const;

export type PageLayoutWidth = keyof typeof WIDTHS;

interface PageLayoutProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Right-side header slot — actions, filters, mode-switchers. */
  actions?: ReactNode;
  width?: PageLayoutWidth;
  /** Drops the title/description block, useful when the page owns its own hero. */
  bare?: boolean;
  className?: string;
  children: ReactNode;
}

export function PageLayout({
  title,
  description,
  actions,
  width = "default",
  bare = false,
  className,
  children,
}: PageLayoutProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:py-12",
        WIDTHS[width],
        className
      )}
    >
      {!bare && (title || description || actions) ? (
        <header className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex flex-col gap-2">
            {title ? (
              <h1 className="text-2xl font-medium tracking-tight md:text-3xl">{title}</h1>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </main>
  );
}

/**
 * PageSection — vertical-rhythm wrapper inside a PageLayout. Use for grouped
 * content sections like "Open positions" + "Fill history" + "Deposits".
 */
export function PageSection({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-4 py-6 md:py-8", className)}>
      {title || description || actions ? (
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title ? (
              <h2 className="text-base font-medium md:text-lg">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs text-[var(--muted-foreground)] md:text-sm">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
