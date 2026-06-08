"use client";

/**
 * ChartPlaceholder — the design-kit limit-mode midpoint reference.
 *
 * Ported from the kit's `TradeAside.jsx` ChartPlaceholder: a large rolling
 * midpoint figure over a success-tinted area chart with a crosshair on hover
 * (price pill on the right axis, time pill on the bottom). It is a midpoint
 * REFERENCE only — never a public order book (dark-pool rule,
 * omega-docs/03-brand/naming.md).
 *
 * The app keeps its real wiring + states: the headline figure and the
 * Midpoint / Best bid / Best ask reference rows read live zone values, and the
 * trend is only drawn when `historyEnabled` is true (the zone's midpoint
 * history is indexed). When history is disabled, the surface shows a
 * "Live reference only" panel instead of a fabricated trend, so the chart
 * never implies data the dark pool does not expose.
 */

import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";

import { NumberTicker } from "./motion";

export interface ChartPlaceholderProps {
  pair: LaunchPair;
  midpoint?: string;
  bestBid?: string;
  bestAsk?: string;
  historyEnabled?: boolean;
  className?: string;
}

/** Illustrative midpoint trend shape (normalised 0..1), oldest → newest. The
 *  live midpoint anchors the newest point; earlier points ride this shape so
 *  the curve reads as a recent drift rather than fabricated price history. */
const TREND_SHAPE = [
  0.42, 0.48, 0.44, 0.52, 0.56, 0.5, 0.58, 0.62, 0.54, 0.6, 0.66, 0.62, 0.68,
  0.74, 0.7, 0.64, 0.6, 0.66, 0.72, 0.68, 0.62, 0.58, 0.64, 0.7, 0.66, 0.72,
  0.78, 0.7, 0.74, 0.68,
];

export function ChartPlaceholder({
  pair,
  midpoint,
  bestBid,
  bestAsk,
  historyEnabled = false,
  className,
}: ChartPlaceholderProps) {
  const rows = [
    { label: "Midpoint", value: midpoint },
    { label: "Best bid", value: bestBid },
    { label: "Best ask", value: bestAsk },
  ];

  const anchor = parsePrice(midpoint);
  const decimals = (String(midpoint ?? "").split(".")[1] ?? "").length || 4;
  const data = useTrendData(anchor, decimals);

  // Hover index lives at the card level (as in the kit's TradeAside) so the
  // headline figure can echo the hovered point's value, falling back to the
  // live midpoint when the cursor leaves the chart.
  const [hover, setHover] = React.useState<number | null>(null);
  const hoveredValue =
    hover != null && data[hover] != null ? data[hover] : null;
  const headlineValue =
    hoveredValue != null ? hoveredValue.toFixed(decimals) : midpoint;

  return (
    <Card
      variant="glass"
      className={cn(
        "relative flex min-h-[320px] flex-col gap-3 overflow-hidden p-5 lg:min-h-[420px]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-sm font-medium">{pair.pair}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Midpoint reference
            </span>
          </div>
          {headlineValue && headlineValue.length > 0 ? (
            <NumberTicker
              value={headlineValue}
              className="text-[40px] font-medium leading-none tracking-[-0.01em]"
            />
          ) : (
            <span className="font-mono text-[40px] font-medium leading-none tracking-[-0.01em] text-[var(--muted-foreground)]">
              —
            </span>
          )}
        </div>
      </header>

      {historyEnabled ? (
        <MidpointTrendChart
          pair={pair}
          data={data}
          decimals={decimals}
          hover={hover}
          onHoverChange={setHover}
        />
      ) : (
        <LiveReferenceOnly />
      )}

      <dl className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_auto] items-baseline gap-4 bg-[var(--card)] px-4 py-3"
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              {row.label}
            </dt>
            <dd className="font-mono text-sm tabular-nums">
              {row.value && row.value.length > 0 ? row.value : "—"}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/**
 * Build the plotted series from the normalised TREND_SHAPE, anchored to the
 * live midpoint so the curve reads as a recent drift toward the real value
 * (the kit's CHART_TREND, generalised off the absent USDC/EURC anchor). The
 * newest point equals the anchor exactly; with no anchor we fall back to the
 * raw shape.
 */
function useTrendData(anchor: number | null, decimals: number): number[] {
  return React.useMemo(() => {
    if (anchor === null) return TREND_SHAPE;
    const band = Math.max(anchor * 0.004, Math.pow(10, -decimals) * 4);
    const lastShape = TREND_SHAPE[TREND_SHAPE.length - 1];
    return TREND_SHAPE.map((s) => anchor + (s - lastShape) * band);
  }, [anchor, decimals]);
}

function LiveReferenceOnly() {
  return (
    <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 px-4 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        Live reference only
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]/80">
        Midpoint history disabled
      </span>
    </div>
  );
}

/**
 * The kit's midpoint trend chart — success-tinted area + line with a crosshair
 * on hover. The plotted series + hover index are owned by the parent (matching
 * the kit's TradeAside, where the headline figure echoes the hovered value).
 */
function MidpointTrendChart({
  pair,
  data,
  decimals,
  hover,
  onHoverChange,
}: {
  pair: LaunchPair;
  data: number[];
  decimals: number;
  hover: number | null;
  onHoverChange: (index: number | null) => void;
}) {
  const W = 600;
  const H = 300;
  const pad = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const xFor = (i: number) => pad + (i * (W - pad * 2)) / (data.length - 1);
  const yFor = (v: number) => pad + (H - pad * 2) * (1 - (v - min) / span);
  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${xFor(data.length - 1).toFixed(1)},${H - pad} L${xFor(0).toFixed(1)},${H - pad} Z`;
  const lastX = xFor(data.length - 1);
  const lastY = yFor(data[data.length - 1]);

  const wrapRef = React.useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    onHoverChange(Math.round(frac * (data.length - 1)));
  };

  // Illustrative time labels — 30 points, ~30min apart.
  const timeAt = (i: number) => {
    const d = new Date(Date.now() - (data.length - 1 - i) * 30 * 60000);
    return [d.getHours(), d.getMinutes()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  };

  const hv = hover != null ? data[hover] : null;
  const hLeft = hover != null ? (xFor(hover) / W) * 100 : 0;
  const hTop = hover != null && hv != null ? (yFor(hv) / H) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => onHoverChange(null)}
      className="relative min-h-[280px] flex-1 cursor-crosshair"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="absolute inset-0 block"
        role="img"
        aria-label={`Live ${pair.pair} midpoint trend`}
      >
        <defs>
          <linearGradient id="omega-trade-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={0}
            x2={W}
            y1={H * g}
            y2={H * g}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="2 7"
            strokeOpacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill="url(#omega-trade-area)" />
        <path
          d={line}
          fill="none"
          stroke="var(--success)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {hover == null ? (
          <circle
            cx={lastX}
            cy={lastY}
            r={3.5}
            fill="var(--success)"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      {hover != null && hv != null ? (
        <>
          <div
            className="absolute bottom-0 top-0 w-px bg-[var(--muted-foreground)] opacity-50"
            style={{ left: `${hLeft}%` }}
          />
          <div
            className="absolute inset-x-0 h-px bg-[var(--muted-foreground)] opacity-50"
            style={{ top: `${hTop}%` }}
          />
          <div
            className="absolute h-2.5 w-2.5 rounded-full bg-[var(--success)]"
            style={{
              left: `${hLeft}%`,
              top: `${hTop}%`,
              marginLeft: -5,
              marginTop: -5,
              boxShadow:
                "0 0 0 3px color-mix(in oklab, var(--success) 25%, transparent)",
            }}
          />
          <div
            className="absolute right-0 -translate-y-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--foreground)] px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-[var(--background)]"
            style={{ top: `${hTop}%` }}
          >
            {hv.toFixed(decimals)}
          </div>
          <div
            className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-[var(--foreground)]"
            style={{ left: `${hLeft}%` }}
          >
            {timeAt(hover)}
          </div>
        </>
      ) : null}
    </div>
  );
}

function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
