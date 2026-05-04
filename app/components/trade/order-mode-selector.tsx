"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import type { OrderMode } from "./order-form";

export interface OrderModeSelectorProps {
  value: OrderMode;
  onChange: (mode: OrderMode) => void;
  className?: string;
}

const SEGMENTS: { value: OrderMode; label: string }[] = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
];

export function OrderModeSelector({
  value,
  onChange,
  className,
}: OrderModeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Order mode"
      className={cn(
        "glass-pill inline-flex items-center gap-1 rounded-full p-1",
        className,
      )}
    >
      {SEGMENTS.map((seg) => {
        const active = value === seg.value;
        return (
          <button
            key={seg.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(seg.value)}
            className={cn(
              "press-down min-w-[5rem] rounded-full px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              active
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
