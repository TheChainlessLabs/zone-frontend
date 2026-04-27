"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMidpointHistory } from "@/lib/hooks/useMidpointHistory";
import { TIMEFRAMES, type Timeframe } from "@/lib/chartData";

// lightweight-charts touches `document` on construction, so the chart
// must be client-only. next/dynamic with ssr:false also keeps the canvas
// library out of the server bundle.
const LightweightChart = dynamic(() => import("./LightweightChart"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <span className="text-text-muted text-body-sm">Loading chart…</span>
    </div>
  ),
});

interface PriceChartProps {
  pair?: string;
}

export default function PriceChart({ pair = "EUR/USD" }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const { points, isLoading, isError } = useMidpointHistory(timeframe);

  const [base, quote] = pair.split("/");

  return (
    <div className="flex flex-col" data-testid="price-chart">
      {/* Chart header with timeframe selector. The chart now sits flat on
          the page background (no card wrapper), so the header is aligned
          to the chart body via padding/margin alone. */}
      <div className="flex items-center justify-between h-[32px] mb-2">
        <span className="text-body-sm font-semibold text-text-primary">
          {base} / {quote}
        </span>
        <div className="flex gap-0.5 bg-bg-surface rounded-md p-0.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2 md:px-3 h-[26px] text-[11px] md:text-body-sm font-medium rounded-sm transition-fast ${
                timeframe === tf
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              aria-pressed={timeframe === tf}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body
          Priority:
            1. Render the chart whenever we have cached points — even if
               the latest refetch errored — so a transient backend hiccup
               doesn't blank out the user's price history. StaleDataOverlay
               (wrapping this component on /trade) handles the "data may
               be stale" surface.
            2. Show the hard error state only when there is nothing to draw.
            3. Fall back to the empty/loading state otherwise.
      */}
      <div className="aspect-video relative">
        {points.length > 0 ? (
          <LightweightChart points={points} />
        ) : isError ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="text-error text-body-sm">
              Chart unavailable — could not fetch the order book
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-muted text-body-sm">
              {isLoading ? "Loading chart…" : "Collecting midpoint history…"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
