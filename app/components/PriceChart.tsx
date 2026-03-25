"use client";

import TradingViewChart from "@/components/TradingViewChart";

interface PriceChartProps {
  pair?: string;
}

function toTvSymbol(pair: string): string {
  return `FX:${pair.replace("/", "")}`;
}

export default function PriceChart({ pair = "EUR/USD" }: PriceChartProps) {
  const [base, quote] = pair.split("/");

  return (
    <div className="bg-bg-elevated rounded-lg overflow-hidden flex flex-col">
      {/* Chart header */}
      <div className="flex items-center h-[44px] px-4 border-b border-border-subtle">
        <span className="text-body-sm font-semibold text-text-primary">
          {base} / {quote}
        </span>
      </div>

      {/* TradingView chart */}
      <div className="aspect-video">
        <TradingViewChart symbol={toTvSymbol(pair)} />
      </div>
    </div>
  );
}
