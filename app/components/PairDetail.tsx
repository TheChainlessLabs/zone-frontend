"use client";

import { useState } from "react";
import Link from "next/link";
import { mockPairs, mockMarketPrices } from "@/lib/mockData";

const timeframes = ["1H", "4H", "1D", "1W", "1M"] as const;

interface PairDetailProps {
  pairSlug: string;
}

export default function PairDetail({ pairSlug }: PairDetailProps) {
  const [timeframe, setTimeframe] = useState<string>("1D");
  const pairName = pairSlug.replace("-", "/");
  const pair = mockPairs.find((p) => p.pair === pairName) ?? mockPairs[0];

  const stats = [
    { label: "24h High", value: (pair.price * 1.004).toFixed(4) },
    { label: "24h Low", value: (pair.price * 0.996).toFixed(4) },
    { label: "24h Volume", value: "$142.5M" },
    { label: "Spread", value: "0.2 pips" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/trade"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &lt; Back to Trade
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-h2 font-semibold">{pair.pair}</h2>
        <span className="text-h3 font-mono font-tabular">{pair.price.toFixed(4)}</span>
        <span className={`text-body-sm font-mono font-tabular ${pair.change >= 0 ? "text-success" : "text-error"}`}>
          {pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border border-border rounded-lg p-4">
            <span className="text-label-uppercase text-text-muted">{stat.label}</span>
            <p className="text-h3 font-mono font-tabular mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Venue comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Timeframe tabs */}
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1 w-fit mb-3">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 h-[28px] text-body-sm font-medium rounded-sm transition-fast ${
                  timeframe === tf
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bg-bg-surface border border-border rounded-lg flex items-center justify-center aspect-[2/1]">
            <span className="text-text-muted text-body-sm">TradingView — {pair.pair}</span>
          </div>
        </div>

        {/* Venue Comparison sidebar */}
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-body-sm font-semibold">Venue Comparison</h3>
          </div>
          <div className="flex items-center h-[28px] px-4 text-label-uppercase text-text-muted">
            <span className="w-[35%]">Source</span>
            <span className="w-[25%] text-right">Bid</span>
            <span className="w-[25%] text-right">Ask</span>
            <span className="w-[15%] text-right">Sprd</span>
          </div>
          {mockMarketPrices.map((mp) => (
            <div
              key={mp.source}
              className={`flex items-center h-[36px] px-4 text-body-sm font-mono font-tabular ${
                mp.source === "Omega" ? "bg-accent/10" : "hover:bg-bg-elevated"
              } transition-fast`}
            >
              <span className="w-[35%] font-display text-text-primary">{mp.source}</span>
              <span className="w-[25%] text-right text-text-secondary">{mp.bid.toFixed(4)}</span>
              <span className="w-[25%] text-right text-text-secondary">{mp.ask.toFixed(4)}</span>
              <span className={`w-[15%] text-right ${mp.source === "Omega" ? "text-success" : "text-text-muted"}`}>
                {(mp.spread * 10000).toFixed(1)}
              </span>
            </div>
          ))}
          <div className="p-4 border-t border-border">
            <Link
              href="/trade"
              className="h-[44px] w-full flex items-center justify-center rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
            >
              Trade {pair.pair}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
