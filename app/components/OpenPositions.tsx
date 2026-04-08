import { openPositions } from "@/lib/mockData";
import { TrendingUp } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function OpenPositions() {
  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center h-[36px] px-3 border-b border-border">
        <span className="text-body-sm font-medium">Open Positions</span>
      </div>

      {openPositions.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={20} />}
          title="No open positions"
          description="Your open positions will appear here. Start trading to build your portfolio."
          action={{ label: "Start Trading", href: "/trade" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="flex items-center h-[33px] px-3 text-label-uppercase text-text-muted">
              <span className="w-[16%]">Pair</span>
              <span className="w-[12%]">Side</span>
              <span className="w-[18%] text-right">Size</span>
              <span className="w-[16%] text-right">Entry</span>
              <span className="w-[16%] text-right">Current</span>
              <span className="w-[12%] text-right">P&L</span>
              <span className="w-[10%] text-right">P&L%</span>
            </div>
            {openPositions.map((pos, i) => (
              <div
                key={i}
                className="flex items-center h-[40px] px-3 text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
              >
                <span className="w-[16%] font-display text-text-primary">{pos.pair}</span>
                <span className={`w-[12%] font-display capitalize ${pos.side === "long" ? "text-success" : "text-error"}`}>
                  {pos.side}
                </span>
                <span className="w-[18%] text-right text-text-secondary">{pos.size.toLocaleString()}</span>
                <span className="w-[16%] text-right text-text-secondary">{pos.entry.toFixed(4)}</span>
                <span className="w-[16%] text-right text-text-primary">{pos.current.toFixed(4)}</span>
                <span className={`w-[12%] text-right ${pos.pnl >= 0 ? "text-success" : "text-error"}`}>
                  {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                </span>
                <span className={`w-[10%] text-right ${pos.pnlPercent >= 0 ? "text-success" : "text-error"}`}>
                  {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {openPositions.map((pos, i) => (
              <div key={i} className="p-3 border-b border-border-subtle last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-medium text-text-primary">{pos.pair}</span>
                    <span className={`text-[11px] font-medium capitalize ${pos.side === "long" ? "text-success" : "text-error"}`}>
                      {pos.side}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-body-sm font-mono font-tabular ${pos.pnl >= 0 ? "text-success" : "text-error"}`}>
                      {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-[12px] text-text-muted">
                  <span>Size: {pos.size.toLocaleString()}</span>
                  <span className={pos.pnlPercent >= 0 ? "text-success" : "text-error"}>
                    {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
