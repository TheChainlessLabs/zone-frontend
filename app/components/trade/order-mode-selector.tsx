"use client";

/**
 * OrderModeSelector — the design-kit glass-pill Market/Limit toggle.
 *
 * A single sliding indicator slides under the active segment. The indicator
 * is positioned via measured `left`/`width` (the same technique as the
 * shell Navbar) rather than a `transform: translateX` percentage, which
 * avoids a Chrome repaint bug with transformed children under
 * `backdrop-filter`. jsdom reports zero geometry, so tests render without a
 * positioned indicator — the tab roles + aria-selected (the asserted
 * surface) are unaffected.
 */

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
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const el = list.querySelector<HTMLElement>('[data-mode-active="true"]');
      if (!el) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Order mode"
      className={cn(
        "glass-pill relative inline-flex items-center rounded-full p-1",
        className,
      )}
    >
      {/* Sliding active indicator. Hidden until measured to avoid a flash at
          the origin before geometry is known. */}
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
      {SEGMENTS.map((seg) => {
        const active = value === seg.value;
        return (
          <button
            key={seg.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-mode-active={active}
            onClick={() => onChange(seg.value)}
            className={cn(
              "press-down relative z-[1] min-w-[5.5rem] rounded-full px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              active
                ? "text-[var(--background)]"
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
