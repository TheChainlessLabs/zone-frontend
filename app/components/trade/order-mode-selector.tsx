"use client";

/**
 * OrderModeSelector — the design-kit glass-pill Market/Limit toggle.
 *
 * A single indicator slides under the active segment. Motion is driven by
 * `useSlidingIndicator` (a JS rAF tween of `left`) rather than a CSS
 * transition or `transform`, because the pill lives inside `backdrop-filter`
 * ancestors that freeze CSS `left` transitions and hang `transform`
 * animations. Segments are equal width, so the pill keeps a constant shape and
 * literally just slides. jsdom reports zero geometry, so tests render with the
 * indicator at the origin — the tab roles + aria-selected (the asserted
 * surface) are unaffected.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { useSlidingIndicator } from "@/lib/use-sliding-indicator";

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
  const { trackRef, pillRef, snap, slideFrom, currentLeft } =
    useSlidingIndicator('[data-mode-active="true"]');
  const firstRef = React.useRef(true);

  // Place on mount (no motion), slide on a real toggle.
  React.useLayoutEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      snap();
      return;
    }
    slideFrom(currentLeft());
  }, [value, snap, slideFrom, currentLeft]);

  // Keep the indicator aligned through viewport/font reflow (no motion).
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => snap());
    ro.observe(track);
    return () => ro.disconnect();
  }, [trackRef, snap]);

  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label="Order mode"
      className={cn(
        "glass-pill relative inline-flex items-center rounded-full p-1",
        className,
      )}
    >
      {/* Sliding active indicator — position + width are driven imperatively by
          useSlidingIndicator (starts hidden until first placed). */}
      <span
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-[var(--foreground)]"
        style={{ left: 0, width: 0, opacity: 0 }}
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
              // Equal-width segments (min-width pins both to the wider label's
              // box) so the indicator keeps a constant shape and only ever
              // slides — never resizes between "Market" and "Limit".
              "press-down relative z-[1] min-w-[6.5rem] rounded-full px-5 py-2 text-center font-mono text-xs uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
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
