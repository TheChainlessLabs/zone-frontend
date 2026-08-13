"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

// Glass propagation: TabsList is the variant carrier; TabsTrigger inherits via
// context so callers don't have to thread the prop down twice. Per
// omega-docs/03-brand/visual-identity.md, glass is for the order form, modals,
// sheets, settlement status, and small selection controls — never tables.
type TabsVariant = "default" | "glass";
const TabsVariantContext = React.createContext<TabsVariant>("default");

const Tabs = TabsPrimitive.Root;

const tabsListVariants = {
  default:
    "inline-flex min-h-10 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-muted/70 p-1 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  glass:
    "glass-pill inline-flex min-h-10 items-center justify-center rounded-[var(--radius-xl)] p-1 text-muted-foreground shadow-[inset_0_1px_0_0_var(--glass-highlight)]",
} as const;

const tabsTriggerVariants = {
  default:
    "press-down inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] px-3 py-1 text-sm font-medium ring-offset-background transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_8px_22px_-18px_var(--foreground)]",
  glass:
    "press-down inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-[var(--radius-lg)] px-4 py-1 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--glass-highlight)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--glass-highlight)] data-[state=active]:text-foreground",
} as const;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants[variant], className)}
      {...props}
    />
  </TabsVariantContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants[variant], className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
