"use client";

import { mockPairs } from "@/lib/mockData";
import { useMarket } from "@/lib/hooks/useMarket";
import { PAIR_MARKET_IDS } from "@/lib/marketIds";

export default function PairList() {
  const { marketId, setMarketId } = useMarket();

  return (
    <div className="flex flex-col">
      {mockPairs.map((pair) => {
        const pairMarketId = PAIR_MARKET_IDS[pair.pair];
        const isSelected = pairMarketId === marketId;
        const isAvailable = pairMarketId !== undefined;

        return (
          <button
            key={pair.pair}
            onClick={() => {
              if (isAvailable) {
                setMarketId(pairMarketId);
              }
            }}
            disabled={!isAvailable}
            className={`flex items-center justify-between px-3 h-[44px] transition-fast border-b border-border-subtle text-left ${
              isSelected
                ? "bg-accent/10 border-l-2 border-l-accent"
                : isAvailable
                  ? "hover:bg-bg-elevated cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-body-sm font-medium ${isSelected ? "text-accent" : "text-text-primary"}`}>
                {pair.pair}
              </span>
              <span className="text-label-uppercase text-text-muted" style={{ fontSize: "10px" }}>
                {pair.fullName}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-body-sm font-mono font-tabular text-text-primary">
                {pair.price.toFixed(4)}
              </span>
              <span
                className={`text-body-sm font-mono font-tabular ${
                  pair.change >= 0 ? "text-success" : "text-error"
                }`}
                style={{ fontSize: "11px" }}
              >
                {pair.change >= 0 ? "+" : ""}
                {pair.change.toFixed(2)}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
