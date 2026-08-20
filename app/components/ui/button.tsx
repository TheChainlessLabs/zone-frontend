import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "press-down relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-transparent text-sm font-medium ring-offset-background transition-[color,background-color,transform] duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 before:absolute before:left-0 before:top-1/2 before:w-px before:h-[75%] before:-translate-y-1/2 before:transition-all before:duration-250 before:ease-out before:shadow-[0_0_0px_rgba(255,255,255,0)] after:absolute after:right-0 after:top-1/2 after:w-px after:h-[75%] after:-translate-y-1/2 after:transition-all after:duration-250 after:ease-out after:shadow-[0_0_0px_rgba(255,255,255,0)]",
  {
    variants: {
      variant: {
        default:
          "text-black bg-white before:hidden after:hidden rounded-none hover:bg-white/90 hover:text-black hover:scale-105",
        destructive:
          "text-destructive before:bg-destructive after:bg-destructive hover:bg-destructive/20 hover:text-destructive hover:scale-105 hover:before:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:after:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
        outline:
          "text-foreground before:bg-foreground after:bg-foreground hover:bg-foreground/12 hover:text-foreground hover:scale-105 hover:before:shadow-[0_0_20px_rgba(250,250,250,0.5)] hover:after:shadow-[0_0_20px_rgba(250,250,250,0.5)]",
        secondary:
          "text-secondary-foreground before:bg-secondary-foreground after:bg-secondary-foreground hover:bg-secondary/70 hover:text-secondary-foreground hover:scale-105 hover:before:shadow-[0_0_20px_rgba(128,128,128,0.5)] hover:after:shadow-[0_0_20px_rgba(128,128,128,0.5)]",
        ghost:
          "text-muted-foreground before:bg-muted-foreground after:bg-muted-foreground hover:bg-accent/50 hover:text-foreground hover:before:bg-foreground hover:after:bg-foreground hover:scale-105 hover:before:shadow-[0_0_20px_rgba(250,250,250,0.5)] hover:after:shadow-[0_0_20px_rgba(250,250,250,0.5)]",
        link: "border-0 px-0 text-primary underline-offset-4 hover:underline before:hidden after:hidden",
        // Glass variant — backed by the .glass-pill utility in globals.css
        // (16px blur, scaled component-level glass). Reserved for the order
        // form, modals, sheets, and small controls per
        // omega-docs/03-brand/visual-identity.md. Tasteful fallback for
        // prefers-reduced-transparency / @supports not (backdrop-filter).
        glass:
          "text-foreground before:bg-foreground after:bg-foreground hover:bg-[var(--glass-highlight)]/40 hover:text-foreground hover:scale-105 hover:before:shadow-[0_0_20px_rgba(250,250,250,0.5)] hover:after:shadow-[0_0_20px_rgba(250,250,250,0.5)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
