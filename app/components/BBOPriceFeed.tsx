import CompareRates from "./CompareRates";

export default function BBOPriceFeed() {
  const bestBid = 1.0850;
  const bestAsk = 1.0852;
  const midpoint = (bestBid + bestAsk) / 2;
  const spread = bestAsk - bestBid;

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[36px] border-b border-border">
        <span className="text-label-uppercase text-text-muted">BBO Price Feed</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-label-uppercase text-success">Live</span>
        </div>
      </div>

      {/* Bid / Ask */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-body-sm text-text-muted">Best Bid</span>
          <span className="text-h3 font-mono font-tabular text-success">{bestBid.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-body-sm text-text-muted">Best Ask</span>
          <span className="text-h3 font-mono font-tabular text-error">{bestAsk.toFixed(4)}</span>
        </div>

        {/* Midpoint bar */}
        <div className="bg-bg-base rounded-md p-3">
          <div className="flex justify-between items-center">
            <span className="text-body-sm text-text-muted">Midpoint</span>
            <span className="text-body-sm font-mono font-tabular text-text-primary">
              {midpoint.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-body-sm text-text-muted">Spread</span>
            <span className="text-body-sm font-mono font-tabular text-text-secondary">
              {(spread * 10000).toFixed(1)} pips
            </span>
          </div>
        </div>
      </div>

      {/* Compare Rates */}
      <CompareRates />
    </div>
  );
}
