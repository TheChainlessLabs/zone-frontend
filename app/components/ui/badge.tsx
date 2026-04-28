import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — small inline label primitive.
 *
 * Generic, shape-only. The brand-lexicon-aware sibling is `Status`. Reach for
 * Badge directly for labels outside the Status lexicon (counts, tags, neutral
 * metadata). Coloured variants use the 10%/30% fill/border recipe per
 * `omega-docs/03-brand/visual-identity.md`. `warning` is intentionally absent
 * from v1 — `tokens.json` ships no `--warning`; add when upstream lands one.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-secondary text-secondary-foreground",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--foreground)]",
        success:
          "border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-[color-mix(in_oklab,var(--success)_10%,transparent)] text-[var(--success)]",
        destructive:
          "border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] text-[var(--destructive)]",
        // Glass — sits on the order form, modals, sheets per the M2.4 rules.
        // Falls back through .glass-pill (see globals.css) for
        // prefers-reduced-transparency / @supports not (backdrop-filter).
        glass:
          "glass-pill border-transparent text-[var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const BadgeRoot = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
);
BadgeRoot.displayName = "Badge";

/** BadgeDot — leading dot indicator, inherits currentColor from the parent
 *  variant so it matches success/destructive/glass automatically. */
const BadgeDot = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn(
      "inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current",
      className
    )}
    {...props}
  />
));
BadgeDot.displayName = "Badge.Dot";

type BadgeComponent = typeof BadgeRoot & { Dot: typeof BadgeDot };

const Badge = BadgeRoot as BadgeComponent;
Badge.Dot = BadgeDot;

export { Badge, badgeVariants };
