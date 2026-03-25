import { describe, it, expect } from "vitest";
import { eip712Types, SIDE_ENCODING } from "../lib/eip712Types";

describe("SIDE_ENCODING", () => {
  it("encodes Buy as 0", () => {
    expect(SIDE_ENCODING.Buy).toBe(0);
  });

  it("encodes Sell as 1", () => {
    expect(SIDE_ENCODING.Sell).toBe(1);
  });
});

describe("eip712Types", () => {
  it("AddLimitOrderRequest has 5 fields in correct order", () => {
    const fields = eip712Types.AddLimitOrderRequest;
    expect(fields).toHaveLength(5);
    expect(fields[0]).toEqual({ name: "nonce", type: "uint64" });
    expect(fields[1]).toEqual({ name: "market_id", type: "uint16" });
    expect(fields[2]).toEqual({ name: "price", type: "uint128" });
    expect(fields[3]).toEqual({ name: "quantity", type: "uint128" });
    expect(fields[4]).toEqual({ name: "side", type: "uint8" });
  });

  it("AddMarketOrderRequest has 6 fields (limit + max_slippage_bps)", () => {
    const fields = eip712Types.AddMarketOrderRequest;
    expect(fields).toHaveLength(6);
    expect(fields[5]).toEqual({ name: "max_slippage_bps", type: "uint32" });
  });

  it("AddFlipOrderRequest has 6 fields (limit + flip_price)", () => {
    const fields = eip712Types.AddFlipOrderRequest;
    expect(fields).toHaveLength(6);
    expect(fields[5]).toEqual({ name: "flip_price", type: "uint128" });
  });

  it("CancelOrderRequest has 3 fields in correct order", () => {
    const fields = eip712Types.CancelOrderRequest;
    expect(fields).toHaveLength(3);
    expect(fields[0]).toEqual({ name: "nonce", type: "uint64" });
    expect(fields[1]).toEqual({ name: "market_id", type: "uint16" });
    expect(fields[2]).toEqual({ name: "order_id", type: "uint64" });
  });
});
