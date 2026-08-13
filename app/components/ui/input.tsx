import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full px-3 py-1 text-base transition-[background-color,border-color,box-shadow,color] duration-200 ease-[var(--ease-standard)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "rounded-[var(--radius-md)] border border-input bg-background/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-[var(--foreground)]/25 focus-visible:border-[var(--ring)] focus-visible:ring-1 focus-visible:ring-ring aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:focus-visible:ring-[var(--destructive)]",
        // Glass variant — uses .glass-pill substrate. Border collapses into
        // the glass edge token; focus ring uses the highlight token for the
        // refraction-feel. See omega-docs/03-brand/visual-identity.md.
        glass:
          "glass-pill rounded-[var(--radius-lg)] border-transparent text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-[var(--glass-highlight)] aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:focus-visible:ring-[var(--destructive)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
