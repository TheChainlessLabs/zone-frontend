"use client";

import { useTrades } from "@/lib/hooks/useTrades";
import { SkeletonRow } from "@/components/Skeleton";

const skeletonColumns = [
  { width: "30%" },
  { width: "35%", align: "right" as const },
  { width: "35%", align: "right" as const },
];

export default function RecentTrades() {
  const { trades, isLoading, isError } = useTrades();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between h-[36px]">
        <span className="text-body-sm font-medium">Recent Fills</span>
        <span className="text-label-uppercase text-text-muted">Anonymous fills</span>
      </div>

      {/* Header */}
      <div className="flex items-center h-[28px] border-b border-border-subtle">
        <span className="text-label-uppercase text-text-muted w-[30%]">Time</span>
        <span className="text-label-uppercase text-text-muted w-[35%] text-right">Price</span>
        <span className="text-label-uppercase text-text-muted w-[35%] text-right">Size</span>
      </div>

      {/* Rows */}
      {isLoading ? (
        <div>
          {Array.from({ length: 15 }, (_, i) => (
            <SkeletonRow
              key={i}
              data-testid="skeleton-row"
              height="28px"
              columns={skeletonColumns}
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-[80px]">
          <span className="text-body-sm text-text-muted">Data unavailable</span>
        </div>
      ) : trades.length === 0 ? (
        <div className="flex items-center justify-center h-[80px]">
          <span className="text-body-sm text-text-muted">No trades yet</span>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {trades.map((trade, i) => (
            <div
              key={i}
              className="flex items-center h-[28px] text-mono font-mono font-tabular hover:bg-bg-surface transition-fast rounded-sm -mx-1 px-1"
            >
              <span className="w-[30%] text-text-muted">{trade.time}</span>
              <span className="w-[35%] text-right text-accent">
                {trade.price.toFixed(4)}
              </span>
              <span className="w-[35%] text-right text-text-secondary">
                {trade.sizeFormatted ?? trade.size.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
