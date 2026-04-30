"use client";

import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// TODO: replace with @/components/ui/receipt once M4.16 merges

function ReceiptRoot({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <Card
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_70px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <section {...props}>{children}</section>
    </Card>
  );
}

function ReceiptHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-dashed border-[var(--border)] px-5 py-5 sm:px-7",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

function ReceiptBody({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col px-5 py-4 sm:px-7", className)} {...props}>
      {children}
    </div>
  );
}

function ReceiptSection({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("flex flex-col", className)} {...props}>
      {children}
    </section>
  );
}

function ReceiptLabel({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function ReceiptRow({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1.5 border-b border-dashed border-[var(--border)] py-3 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start sm:gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ReceiptRowLabel({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function ReceiptRowValue({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      {children}
    </div>
  );
}

function ReceiptFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "border-t border-dashed border-[var(--border)] px-5 py-4 sm:px-7",
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

export const Receipt = Object.assign(ReceiptRoot, {
  Body: ReceiptBody,
  Footer: ReceiptFooter,
  Header: ReceiptHeader,
  Label: ReceiptLabel,
  Row: ReceiptRow,
  RowLabel: ReceiptRowLabel,
  RowValue: ReceiptRowValue,
  Section: ReceiptSection,
});
