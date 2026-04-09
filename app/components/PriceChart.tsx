"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTradePoints } from "@/lib/hooks/useTradePoints";
import { TIMEFRAMES, type Timeframe } from "@/lib/chartData";

// lightweight-charts touches `document` on construction, so NeonPriceChart
// must be client-only. next/dynamic with ssr:false also keeps the canvas
// library out of the server bundle.
const NeonPriceChart = dynamic(() => import("./NeonPriceChart"), {
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
  const { points, isLoading, isError } = useTradePoints(timeframe);

  const [base, quote] = pair.split("/");

  return (
    <div
      className="bg-bg-elevated rounded-lg overflow-hidden flex flex-col"
      data-testid="price-chart"
    >
      {/* Chart header with timeframe selector */}
      <div className="flex items-center justify-between h-[44px] px-4 border-b border-border-subtle">
        <span className="text-body-sm font-semibold text-text-primary">
          {base} / {quote}
        </span>
        <div className="flex gap-0.5 bg-bg-base rounded-md p-0.5">
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

      {/* Chart body */}
      <div className="aspect-video relative">
        {isError ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="text-error text-body-sm">
              Chart unavailable — could not fetch trades
            </span>
          </div>
        ) : points.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-muted text-body-sm">
              {isLoading ? "Loading chart…" : "Waiting for first trade…"}
            </span>
          </div>
        ) : (
          <NeonPriceChart points={points} />
        )}
      </div>
    </div>
  );
}
