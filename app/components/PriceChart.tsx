"use client";

import { useState } from "react";
import { stats } from "@/lib/mockData";

const timeframes = ["1H", "4H", "1D", "1W", "1M"] as const;

interface PriceChartProps {
  pair?: string;
}

export default function PriceChart({ pair = "EUR/USD" }: PriceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1D");
  const [base, quote] = pair.split("/");
  const changeSign = stats.change >= 0 ? "+" : "";
  const changeAbs = (stats.price * stats.change / 100).toFixed(4);

  return (
    <div className="bg-bg-elevated rounded-lg overflow-hidden flex flex-col">
      {/* Chart header */}
      <div className="flex items-center justify-between h-[44px] px-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="text-body-sm font-semibold text-text-primary">
            {base} / {quote}
          </span>
          <span className="text-body-sm font-mono font-tabular text-text-primary">
            {stats.price.toFixed(4)}
          </span>
          <span className={`text-body-sm font-mono font-tabular ${stats.change >= 0 ? "text-success" : "text-error"}`}>
            {changeSign}{changeAbs} ({changeSign}{stats.change.toFixed(2)}%)
          </span>
        </div>

        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-2.5 h-[26px] text-[12px] font-medium rounded-sm transition-fast ${
                activeTimeframe === tf
                  ? "bg-bg-surface text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="flex items-center justify-center aspect-video">
        <span className="text-text-muted text-body-sm">TradingView — {pair}</span>
      </div>
    </div>
  );
}
