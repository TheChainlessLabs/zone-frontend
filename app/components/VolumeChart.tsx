"use client";

import { useState } from "react";

const timeRanges = ["24H", "7D", "30D"] as const;

const MOCK_BARS = [30, 45, 35, 55, 40, 60, 50, 70, 55, 65, 75, 90];

const timeLabels = ["00:00", "", "", "06:00", "", "", "12:00", "", "", "18:00", "", "Now"];

export default function VolumeChart() {
  const [range, setRange] = useState<(typeof timeRanges)[number]>("24H");
  const maxValue = Math.max(...MOCK_BARS);

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4">
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
      <div className="flex items-end gap-2 h-[140px]">
        {MOCK_BARS.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-accent/80 rounded-sm min-h-[4px] transition-all"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-[10px] text-text-muted whitespace-nowrap">
              {timeLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
