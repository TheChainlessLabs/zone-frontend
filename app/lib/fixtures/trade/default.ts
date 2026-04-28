import type { TradeFixture } from "../types";

/**
 * /trade default — connected user, USDC/EURC, populated book.
 *
 * Recent fills are own-and-own-batch only; Omega's dark-pool stance
 * forbids exposing a global trade tape (see omega-docs/03-brand/naming.md
 * "Omega is a dark pool, not a public exchange").
 */
export const tradeDefault: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "0.9213",
  recentFills: [
    {
      id: "f-2914",
      orderId: "o-9482",
      pair: "USDC/EURC",
      side: "sell",
      amount: "5000.00",
      price: "0.9213",
      matchedAt: "2026-04-27T14:02:11Z",
      status: "settled",
    },
    {
      id: "f-2913",
      orderId: "o-9477",
      pair: "USDC/EURC",
      side: "buy",
      amount: "1250.00",
      price: "0.9214",
      matchedAt: "2026-04-27T13:51:08Z",
      status: "matched",
    },
  ],
  bids: [
    { price: "0.9212", size: "12,500.00" },
    { price: "0.9211", size: "28,400.00" },
    { price: "0.9210", size: "55,200.00" },
    { price: "0.9209", size: "104,300.00" },
  ],
  asks: [
    { price: "0.9214", size: "9,800.00" },
    { price: "0.9215", size: "22,100.00" },
    { price: "0.9216", size: "48,700.00" },
    { price: "0.9217", size: "92,400.00" },
  ],
  myOpenOrders: [
    {
      id: "o-9482",
      pair: "USDC/EURC",
      side: "sell",
      type: "limit",
      amount: "5000.00",
      price: "0.9215",
      filledPercent: 12,
      status: "pending",
      submittedAt: "2026-04-27T13:42:11Z",
    },
  ],
};
