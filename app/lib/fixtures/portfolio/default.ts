import type { PortfolioFixture } from "../types";

/** /portfolio default — connected user with positions, fills, and onchain history. */
export const portfolioDefault: PortfolioFixture = {
  totalValueUSD: "47,213.40",
  balances: [
    {
      token: "USDC",
      available: "32,450.00",
      locked: "0.00",
      total: "32,450.00",
    },
    {
      token: "EURC",
      available: "13,521.00",
      locked: "1,242.40",
      total: "14,763.40",
    },
    { token: "USDT", available: "0.00", locked: "0.00", total: "0.00" },
  ],
  openOrders: [
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
    {
      id: "o-9486",
      pair: "USDC/USDT",
      side: "buy",
      type: "midpoint",
      amount: "10000.00",
      price: "1.0001",
      filledPercent: 0,
      status: "pending",
      submittedAt: "2026-04-27T13:50:02Z",
    },
  ],
  recentFills: [
    {
      id: "f-2914",
      orderId: "o-9482",
      pair: "USDC/EURC",
      side: "sell",
      amount: "600.00",
      price: "0.9213",
      matchedAt: "2026-04-27T14:02:11Z",
      status: "settled",
    },
    {
      id: "f-2899",
      orderId: "o-9460",
      pair: "USDC/EURC",
      side: "buy",
      amount: "2500.00",
      price: "0.9214",
      matchedAt: "2026-04-27T11:18:42Z",
      status: "proven",
    },
  ],
  deposits: [
    {
      id: "d-441",
      token: "USDC",
      amount: "30,000.00",
      status: "settled",
      initiatedAt: "2026-04-26T09:14:00Z",
      txHash:
        "0x4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f",
    },
    {
      id: "d-442",
      token: "EURC",
      amount: "15,000.00",
      status: "settled",
      initiatedAt: "2026-04-26T09:18:32Z",
      txHash:
        "0x9b8c7d6e5f4a3b2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a",
    },
  ],
  withdrawals: [
    {
      id: "w-118",
      token: "USDC",
      amount: "1,500.00",
      status: "pending",
      initiatedAt: "2026-04-27T13:55:14Z",
      txHash:
        "0x2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a9b8c7d6e5f4a3b",
    },
  ],
};
