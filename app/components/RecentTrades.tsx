import { recentTrades } from "@/lib/mockData";
import { SkeletonRow } from "@/components/Skeleton";

const skeletonColumns = [
  { width: "30%" },
  { width: "35%", align: "right" as const },
  { width: "35%", align: "right" as const },
];

export default function RecentTrades({ isLoading }: { isLoading?: boolean }) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between h-[36px] px-3 border-b border-border">
        <span className="text-body-sm font-medium">Recent Fills</span>
        <span className="text-label-uppercase text-text-muted">Anonymous fills</span>
      </div>

      {/* Header */}
      <div className="flex items-center h-[28px] px-3 border-b border-border-subtle">
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
      ) : (
        <div className="animate-fadeIn">
          {recentTrades.map((trade, i) => (
            <div
              key={i}
              className="flex items-center h-[28px] px-3 text-mono font-mono font-tabular hover:bg-bg-elevated transition-fast"
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
