"use client";

import { useState } from "react";

const timeRanges = ["24H", "7D", "30D"] as const;

const volumeData = [
  { time: "00:00", value: 8.2 },
  { time: "04:00", value: 5.1 },
  { time: "08:00", value: 12.4 },
  { time: "12:00", value: 18.7 },
  { time: "16:00", value: 22.3 },
  { time: "20:00", value: 15.6 },
  { time: "Now", value: 28.1 },
];

const topPairs = [
  { pair: "EUR/USD", volume: "$89.2M" },
  { pair: "GBP/USD", volume: "$32.1M" },
  { pair: "USD/JPY", volume: "$21.2M" },
];

export default function ProtocolStats() {
  const [range, setRange] = useState<(typeof timeRanges)[number]>("24H");
  const maxValue = Math.max(...volumeData.map((d) => d.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Volume Chart */}
      <div className="lg:col-span-2 bg-bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-label-uppercase text-text-muted block">Protocol Volume</span>
            <span className="text-h2 font-mono font-tabular text-text-primary">$142.5M</span>
          </div>
          <div className="flex gap-1 bg-bg-base rounded-md p-1">
            {timeRanges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 h-[24px] text-[11px] font-medium rounded-sm transition-fast ${
                  range === r
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-[120px]">
          {volumeData.map((d) => (
            <div key={d.time} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-accent/80 rounded-sm min-h-[4px] transition-all"
                style={{ height: `${(d.value / maxValue) * 100}%` }}
              />
              <span className="text-[10px] text-text-muted">{d.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        {/* Savings */}
        <div className="bg-bg-surface border border-border rounded-lg p-4">
          <span className="text-label-uppercase text-text-muted block mb-1">
            Total Savings vs Traditional FX
          </span>
          <span className="text-h2 font-mono font-tabular text-success">$847,230</span>
          <p className="text-[12px] text-text-muted mt-2">
            Cumulative savings delivered to traders compared to best external venue rates
            (Wise, OFX, Revolut).
          </p>
        </div>

        {/* Top Pairs */}
        <div className="bg-bg-surface border border-border rounded-lg p-4">
          <span className="text-label-uppercase text-text-muted block mb-3">
            Top Pairs by Volume
          </span>
          <div className="flex flex-col gap-2">
            {topPairs.map((p) => (
              <div key={p.pair} className="flex justify-between text-body-sm">
                <span className="text-text-primary">{p.pair}</span>
                <span className="font-mono font-tabular text-text-secondary">{p.volume}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
