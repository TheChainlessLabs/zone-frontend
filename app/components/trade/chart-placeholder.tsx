/**
 * ChartPlaceholder — Limit-mode-only chart slot.
 *
 * Renders a branded container with a stylised midpoint baseline + sample
 * candles drawn in SVG. The substrate stays at low contrast — it's a
 * supporting surface, not the primary action target.
 *
 * Brand stance (omega-docs/03-brand/visual-identity.md): no public order
 * book ever. The chart shows the midpoint reference only.
 */

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";

export interface ChartPlaceholderProps {
  pair: LaunchPair;
  midpoint?: string;
  className?: string;
}

export function ChartPlaceholder({
  pair,
  midpoint,
  className,
}: ChartPlaceholderProps) {
  return (
    <Card
      variant="default"
      className={cn(
        "relative flex min-h-[320px] flex-col gap-3 overflow-hidden p-5 lg:min-h-[420px]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-medium">{pair.pair}</span>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Midpoint reference
          </span>
        </div>
        <span className="font-mono text-base tabular-nums">
          {midpoint && midpoint.length > 0 ? midpoint : "—"}
        </span>
      </div>

      {/* Decorative midpoint chart — not data-bearing. */}
      <div
        aria-hidden
        className="relative flex-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30"
      >
        <svg
          viewBox="0 0 600 240"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {/* Grid */}
          {[0.2, 0.4, 0.6, 0.8].map((y) => (
            <line
              key={y}
              x1={0}
              x2={600}
              y1={240 * y}
              y2={240 * y}
              stroke="var(--border)"
              strokeDasharray="2 6"
              strokeOpacity={0.5}
            />
          ))}
          {/* Midpoint baseline */}
          <line
            x1={0}
            x2={600}
            y1={120}
            y2={120}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.4}
            strokeDasharray="4 4"
          />
          {/* Candle glyphs */}
          {SAMPLE_CANDLES.map((c, i) => {
            const x = 18 + i * 28;
            const isUp = c.close < c.open; // SVG y inverted
            const top = Math.min(c.open, c.close);
            const bottom = Math.max(c.open, c.close);
            const tone = isUp ? "var(--success)" : "var(--destructive)";
            return (
              <g key={i} opacity={0.55}>
                <line
                  x1={x}
                  x2={x}
                  y1={c.high}
                  y2={c.low}
                  stroke={tone}
                  strokeWidth={1}
                />
                <rect
                  x={x - 5}
                  y={top}
                  width={10}
                  height={Math.max(2, bottom - top)}
                  fill={tone}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

// Stable hand-drawn sample candles — visual only. SVG y-coords (top = small).
const SAMPLE_CANDLES: Candle[] = [
  { open: 130, close: 118, high: 110, low: 138 },
  { open: 118, close: 124, high: 112, low: 132 },
  { open: 124, close: 116, high: 108, low: 130 },
  { open: 116, close: 110, high: 102, low: 124 },
  { open: 110, close: 118, high: 104, low: 126 },
  { open: 118, close: 112, high: 106, low: 128 },
  { open: 112, close: 120, high: 104, low: 132 },
  { open: 120, close: 126, high: 112, low: 138 },
  { open: 126, close: 116, high: 110, low: 134 },
  { open: 116, close: 122, high: 108, low: 132 },
  { open: 122, close: 114, high: 106, low: 128 },
  { open: 114, close: 124, high: 104, low: 134 },
  { open: 124, close: 130, high: 116, low: 142 },
  { open: 130, close: 122, high: 114, low: 138 },
  { open: 122, close: 118, high: 110, low: 132 },
  { open: 118, close: 124, high: 112, low: 134 },
  { open: 124, close: 116, high: 106, low: 132 },
  { open: 116, close: 122, high: 108, low: 134 },
  { open: 122, close: 130, high: 116, low: 140 },
  { open: 130, close: 120, high: 112, low: 136 },
];
