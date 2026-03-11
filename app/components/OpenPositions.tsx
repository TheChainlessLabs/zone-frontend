import { openPositions } from "@/lib/mockData";

export default function OpenPositions() {
  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center h-[36px] px-3 border-b border-border">
        <span className="text-body-sm font-medium">Open Positions</span>
      </div>

      {/* Header */}
      <div className="flex items-center h-[33px] px-3 text-label-uppercase text-text-muted">
        <span className="w-[16%]">Pair</span>
        <span className="w-[12%]">Side</span>
        <span className="w-[18%] text-right">Size</span>
        <span className="w-[16%] text-right">Entry</span>
        <span className="w-[16%] text-right">Current</span>
        <span className="w-[12%] text-right">P&L</span>
        <span className="w-[10%] text-right">P&L%</span>
      </div>

      {openPositions.length === 0 ? (
        <div className="flex items-center justify-center h-[120px]">
          <span className="text-body-sm text-text-muted">No open positions</span>
        </div>
      ) : (
        <div>
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
      )}
    </div>
  );
}
