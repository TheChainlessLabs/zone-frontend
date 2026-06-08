import type { PortfolioFixture } from "../types";

/**
 * /portfolio default — connected user with positions, fills, and onchain
 * history. Denominated in the venue's OALPHA / PATH.USD market (the live
 * product denomination), so it doubles as the demo snapshot the page shows
 * when no backend is reachable.
 */
export const portfolioDefault: PortfolioFixture = {
  totalValueUSD: "47,213.40",
  balances: [
    {
      token: "PATH.USD",
      available: "32,450.00",
      locked: "1,242.40",
      total: "33,692.40",
    },
    {
      token: "OALPHA",
      available: "13,521.00",
      locked: "0.00",
      total: "13,521.00",
    },
  ],
  openOrders: [
    {
      id: "o-9482",
      pair: "OALPHA/PATH.USD",
      side: "sell",
      type: "limit",
      amount: "5000.00",
      price: "1.0421",
      filledPercent: 12,
      status: "pending",
      submittedAt: "2026-04-27T13:42:11Z",
    },
    {
      id: "o-9486",
      pair: "OALPHA/PATH.USD",
      side: "buy",
      type: "midpoint",
      amount: "10000.00",
      price: "1.0399",
      filledPercent: 0,
      status: "pending",
      submittedAt: "2026-04-27T13:50:02Z",
    },
  ],
  recentFills: [
    {
      id: "f-2914",
      orderId: "o-9482",
      pair: "OALPHA/PATH.USD",
      side: "sell",
      amount: "600.00",
      price: "1.0418",
      matchedAt: "2026-04-27T14:02:11Z",
      status: "settled",
      txHash:
        "0x7f3c2d1b8a9e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c",
    },
    {
      id: "f-2899",
      orderId: "o-9460",
      pair: "OALPHA/PATH.USD",
      side: "buy",
      amount: "2500.00",
      price: "1.0405",
      matchedAt: "2026-04-27T11:18:42Z",
      status: "proven",
      txHash:
        "0xa1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
    },
  ],
  deposits: [
    {
      id: "d-441",
      token: "PATH.USD",
      amount: "30,000.00",
      status: "settled",
      initiatedAt: "2026-04-26T09:14:00Z",
      txHash:
        "0x4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f",
    },
    {
      id: "d-442",
      token: "PATH.USD",
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
      token: "PATH.USD",
      amount: "1,500.00",
      status: "pending",
      initiatedAt: "2026-04-27T13:55:14Z",
      txHash:
        "0x2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a9b8c7d6e5f4a3b",
    },
  ],
};
