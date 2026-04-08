import { describe, it, expect } from "vitest";
import { estimatePriceImpact } from "@/lib/priceImpact";
import type { OrderBookResponse } from "@/lib/apiTypes";

function makeBook(
  bids: { price: string; qty: string }[],
  asks: { price: string; qty: string }[],
): OrderBookResponse {
  return {
    market_id: 1,
    bids: bids.map((b, i) => ({
      id: i,
      owner_account_id: 1,
      side: "Buy" as const,
      kind: "Limit" as const,
      price: b.price,
      remaining_quantity: b.qty,
    })),
    asks: asks.map((a, i) => ({
      id: i + 100,
      owner_account_id: 2,
      side: "Sell" as const,
      kind: "Limit" as const,
      price: a.price,
      remaining_quantity: a.qty,
    })),
  };
}

// 6-decimal token encoding: 1000 USDC = "1000000000"
const enc = (n: number) => (n * 1e6).toString();

describe("estimatePriceImpact", () => {
  it("returns none when book is undefined", () => {
    const result = estimatePriceImpact(undefined, "buy", 100);
    expect(result).toEqual({ impactPercent: 0, severity: "none" });
  });

  it("returns none when quantity is zero", () => {
    const book = makeBook([], [{ price: "1000000000000000000", qty: enc(1000) }]);
    const result = estimatePriceImpact(book, "buy", 0);
    expect(result).toEqual({ impactPercent: 0, severity: "none" });
  });

  it("returns none when quantity is negative", () => {
    const book = makeBook([], [{ price: "1000000000000000000", qty: enc(1000) }]);
    const result = estimatePriceImpact(book, "buy", -50);
    expect(result).toEqual({ impactPercent: 0, severity: "none" });
  });

  it("returns none when relevant side has no entries", () => {
    const book = makeBook([{ price: "1000000000000000000", qty: enc(1000) }], []);
    const result = estimatePriceImpact(book, "buy", 100);
    expect(result).toEqual({ impactPercent: 0, severity: "none" });
  });

  it("returns none for small order relative to book depth", () => {
    // Total ask depth = 10000. Order = 500 → 5%
    const book = makeBook([], [
      { price: "1085000000000000000", qty: enc(5000) },
      { price: "1086000000000000000", qty: enc(5000) },
    ]);
    const result = estimatePriceImpact(book, "buy", 500);
    expect(result.severity).toBe("none");
    expect(result.impactPercent).toBe(5);
  });

  it("returns warning when order is 10-50% of book depth", () => {
    // Total ask depth = 1000. Order = 200 → 20%
    const book = makeBook([], [{ price: "1085000000000000000", qty: enc(1000) }]);
    const result = estimatePriceImpact(book, "buy", 200);
    expect(result.severity).toBe("warning");
    expect(result.impactPercent).toBe(20);
  });

  it("returns critical when order exceeds 50% of book depth", () => {
    // Total ask depth = 1000. Order = 600 → 60%
    const book = makeBook([], [{ price: "1085000000000000000", qty: enc(1000) }]);
    const result = estimatePriceImpact(book, "buy", 600);
    expect(result.severity).toBe("critical");
    expect(result.impactPercent).toBe(60);
  });

  it("uses bids for sell orders", () => {
    // Total bid depth = 500. Order = 300 → 60% → critical
    const book = makeBook(
      [{ price: "1085000000000000000", qty: enc(500) }],
      [{ price: "1086000000000000000", qty: enc(10000) }],
    );
    const result = estimatePriceImpact(book, "sell", 300);
    expect(result.severity).toBe("critical");
    expect(result.impactPercent).toBe(60);
  });

  it("uses asks for buy orders", () => {
    // Total ask depth = 500, bid depth = 10000. Buy 300 → 60% of asks → critical
    const book = makeBook(
      [{ price: "1085000000000000000", qty: enc(10000) }],
      [{ price: "1086000000000000000", qty: enc(500) }],
    );
    const result = estimatePriceImpact(book, "buy", 300);
    expect(result.severity).toBe("critical");
    expect(result.impactPercent).toBe(60);
  });

  it("handles exact boundary at 10% as none", () => {
    // Total depth = 1000. Order = 100 → exactly 10% → none (>10% needed for warning)
    const book = makeBook([], [{ price: "1085000000000000000", qty: enc(1000) }]);
    const result = estimatePriceImpact(book, "buy", 100);
    expect(result.severity).toBe("none");
    expect(result.impactPercent).toBe(10);
  });

  it("handles exact boundary at 50% as warning", () => {
    // Total depth = 1000. Order = 500 → exactly 50% → warning (>50% needed for critical)
    const book = makeBook([], [{ price: "1085000000000000000", qty: enc(1000) }]);
    const result = estimatePriceImpact(book, "buy", 500);
    expect(result.severity).toBe("warning");
    expect(result.impactPercent).toBe(50);
  });

  it("sums depth across multiple entries", () => {
    // 3 ask levels of 200 each = 600 total. Order = 100 → ~17% → warning
    const book = makeBook([], [
      { price: "1085000000000000000", qty: enc(200) },
      { price: "1086000000000000000", qty: enc(200) },
      { price: "1087000000000000000", qty: enc(200) },
    ]);
    const result = estimatePriceImpact(book, "buy", 100);
    expect(result.severity).toBe("warning");
    expect(result.impactPercent).toBe(17);
  });
});
