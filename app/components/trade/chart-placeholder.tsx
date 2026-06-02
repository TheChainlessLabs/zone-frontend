/**
 * ChartPlaceholder — limit-mode market reference.
 *
 * Historical midpoint ticks are not indexed yet, so the alpha surface shows
 * only live aggregate reference values from the zone.
 */

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";

export interface ChartPlaceholderProps {
  pair: LaunchPair;
  midpoint?: string;
  bestBid?: string;
  bestAsk?: string;
  historyEnabled?: boolean;
  className?: string;
}

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
  const chartPoints = [
    { label: "Bid", value: parsePrice(bestBid) },
    { label: "Mid", value: parsePrice(midpoint) },
    { label: "Ask", value: parsePrice(bestAsk) },
  ].filter((point): point is { label: string; value: number } => point.value !== null);

  return (
    <Card
      variant="default"
      className={cn(
        "relative flex min-h-[320px] flex-col gap-5 overflow-hidden p-5 lg:min-h-[420px]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-medium">{pair.pair}</span>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Market reference
          </span>
        </div>
        <span className="font-mono text-base tabular-nums">
          {midpoint && midpoint.length > 0 ? midpoint : "—"}
        </span>
      </div>

      {historyEnabled ? (
        <PriceChart points={chartPoints} />
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

      <div className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
        <ReferenceCell label="Base" value={pair.base} />
        <ReferenceCell label="Quote" value={pair.quote} />
      </div>
    </Card>
  );
}

function LiveReferenceOnly() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 px-4 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        Live reference only
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]/80">
        Midpoint history disabled
      </span>
    </div>
  );
}

function PriceChart({
  points,
}: {
  points: Array<{ label: string; value: number }>;
}) {
  if (points.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Waiting for zone price
        </span>
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const minValue = Math.min(...points.map((point) => point.value));
  const maxValue = Math.max(...points.map((point) => point.value));
  const pad = Math.max((maxValue - minValue) * 0.2, maxValue * 0.002, 0.002);
  const min = minValue - pad;
  const max = maxValue + pad;
  const range = max - min || 1;
  const xFor = (index: number) =>
    points.length === 1 ? width / 2 : 72 + index * ((width - 144) / (points.length - 1));
  const yFor = (value: number) =>
    height - 36 - ((value - min) / range) * (height - 72);
  const plotted = points.map((point, index) => ({
    ...point,
    x: xFor(index),
    y: yFor(point.value),
  }));
  const path = plotted
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20">
      <svg
        role="img"
        aria-label="Live OALPHA/PATH.USD price chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={24}
            x2={width - 24}
            y1={height * ratio}
            y2={height * ratio}
            stroke="var(--border)"
            strokeDasharray="2 8"
            strokeOpacity={0.7}
          />
        ))}
        <path
          d={path}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        {plotted.map((point) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="var(--foreground)"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
        {plotted.map((point) => (
          <div key={point.label} className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {point.label}
            </span>
            <span className="truncate font-mono text-xs tabular-nums">
              {point.value.toFixed(6)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferenceCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--card)] px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
