import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useMarket, MarketProvider } from "../lib/hooks/useMarket";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(MarketProvider, null, children);
}

describe("useMarket", () => {
  it("throws if used outside MarketProvider", () => {
    expect(() => {
      renderHook(() => useMarket());
    }).toThrow("useMarket must be used within MarketProvider");
  });

  it("defaults to marketId 1", () => {
    const { result } = renderHook(() => useMarket(), { wrapper });
    expect(result.current.marketId).toBe(1);
  });

  it("setMarketId updates the market", () => {
    const { result } = renderHook(() => useMarket(), { wrapper });

    act(() => {
      result.current.setMarketId(42);
    });

    expect(result.current.marketId).toBe(42);
  });
});
