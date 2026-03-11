import { mockMarketPrices } from "@/lib/mockData";

export default function MarketPrices() {
  return (
    <div className="bg-bg-surface border border-border rounded-lg">
      <div className="px-3 py-2 border-b border-border-subtle">
        <h3 className="text-body-sm font-semibold">Compare Rates</h3>
      </div>

      {/* Header */}
      <div className="flex h-[28px] items-center px-3 text-label-uppercase text-text-muted">
        <span className="w-[30%]">Source</span>
        <span className="w-[25%] text-right">Bid</span>
        <span className="w-[25%] text-right">Ask</span>
        <span className="w-[20%] text-right">Spread</span>
      </div>

      {/* Rows */}
      {mockMarketPrices.map((mp) => (
        <div
          key={mp.source}
          className={`flex h-[28px] items-center px-3 font-mono text-mono font-tabular hover:bg-bg-elevated transition-fast ${
            mp.source === "Omega" ? "bg-accent/10" : ""
          }`}
        >
          <span className="w-[30%] font-display text-body-sm text-text-primary">
            {mp.source}
          </span>
          <span className="w-[25%] text-right text-text-secondary">
            {mp.bid.toFixed(4)}
          </span>
          <span className="w-[25%] text-right text-text-secondary">
            {mp.ask.toFixed(4)}
          </span>
          <span className={`w-[20%] text-right ${mp.source === "Omega" ? "text-success" : "text-text-muted"}`}>
            {(mp.spread * 10000).toFixed(1)} pips
          </span>
        </div>
      ))}
    </div>
  );
}
