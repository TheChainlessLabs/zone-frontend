"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import React from "react";

interface MarketContextValue {
  marketId: number;
  setMarketId: (id: number) => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [marketId, setMarketId] = useState(1); // Default: EUR/USD

  return React.createElement(
    MarketContext.Provider,
    { value: { marketId, setMarketId } },
    children,
  );
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
