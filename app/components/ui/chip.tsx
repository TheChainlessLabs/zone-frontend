"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Chip — small badge-with-icon, used for filter pills and inline status. The
// active state shows a leading check glyph and tightens the foreground
// colour. Glass variant follows the same rules as the rest of the M2.4 set
// (see omega-docs/03-brand/visual-identity.md): rare and purposeful, with
// the .glass-pill substrate handling fallback for prefers-reduced-
// transparency / @supports not (backdrop-filter).

const chipVariants = cva(
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-muted text-muted-foreground hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-foreground",
        glass:
          "glass-pill text-muted-foreground hover:text-foreground data-[active=true]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  active?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, active = false, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={active}
      aria-pressed={active}
      className={cn(chipVariants({ variant, className }))}
      {...props}
    >
      {active ? (
        <Check size={12} className="text-[var(--success)]" aria-hidden />
      ) : null}
      {children}
    </button>
  )
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
