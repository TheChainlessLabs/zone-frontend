import type { ApiSide } from "./apiTypes";

export const SIDE_ENCODING: Record<ApiSide, number> = {
  Buy: 0,
  Sell: 1,
} as const;

export const eip712Types = {
  AddLimitOrderRequest: [
    { name: "nonce", type: "uint64" },
    { name: "market_id", type: "uint16" },
    { name: "price", type: "uint128" },
    { name: "quantity", type: "uint128" },
    { name: "side", type: "uint8" },
  ],
  AddMarketOrderRequest: [
    { name: "nonce", type: "uint64" },
    { name: "market_id", type: "uint16" },
    { name: "price", type: "uint128" },
    { name: "quantity", type: "uint128" },
    { name: "side", type: "uint8" },
    { name: "max_slippage_bps", type: "uint32" },
  ],
  AddFlipOrderRequest: [
    { name: "nonce", type: "uint64" },
    { name: "market_id", type: "uint16" },
    { name: "price", type: "uint128" },
    { name: "quantity", type: "uint128" },
    { name: "side", type: "uint8" },
    { name: "flip_price", type: "uint128" },
  ],
  CancelOrderRequest: [
    { name: "nonce", type: "uint64" },
    { name: "market_id", type: "uint16" },
    { name: "order_id", type: "uint64" },
  ],
} as const;
