import { describe, it, expect } from "vitest";
import { TOKEN_MAP, getTokenMeta, formatTokenAmount, getTokenIdBySymbol } from "../lib/tokens";

describe("TOKEN_MAP", () => {
  it("maps token ID 1 to USDC", () => {
    expect(TOKEN_MAP[1]).toEqual({ symbol: "USDC", decimals: 6, color: "#2775CA" });
  });

  it("maps token ID 2 to USDT", () => {
    expect(TOKEN_MAP[2]).toEqual({ symbol: "USDT", decimals: 6, color: "#26A17B" });
  });

  it("maps token ID 3 to EURC", () => {
    expect(TOKEN_MAP[3]).toEqual({ symbol: "EURC", decimals: 6, color: "#1434CB" });
  });
});

describe("getTokenMeta", () => {
  it("returns known token metadata", () => {
    expect(getTokenMeta(1).symbol).toBe("USDC");
    expect(getTokenMeta(1).decimals).toBe(6);
  });

  it("returns fallback for unknown token ID", () => {
    const meta = getTokenMeta(999);
    expect(meta.symbol).toBe("Token 999");
    expect(meta.decimals).toBe(18);
    expect(meta.color).toBe("#888");
  });
});

describe("formatTokenAmount", () => {
  it("formats 6-decimal token (USDC): 10000000000 → 10000", () => {
    expect(formatTokenAmount("10000000000", 6)).toBe(10000);
  });

  it("formats zero correctly", () => {
    expect(formatTokenAmount("0", 6)).toBe(0);
  });

  it("formats 18-decimal token: 1000000000000000000 → 1", () => {
    expect(formatTokenAmount("1000000000000000000", 18)).toBe(1);
  });

  it("handles small amounts with 6 decimals", () => {
    expect(formatTokenAmount("1000000", 6)).toBe(1);
  });

  it("handles fractional results", () => {
    // 1500000 with 6 decimals = 1.5
    expect(formatTokenAmount("1500000", 6)).toBe(1.5);
  });
});

describe("getTokenIdBySymbol", () => {
  it("finds USDC as token ID 1", () => {
    expect(getTokenIdBySymbol("USDC")).toBe(1);
  });

  it("returns undefined for unknown symbol", () => {
    expect(getTokenIdBySymbol("DOGE")).toBeUndefined();
  });
});
