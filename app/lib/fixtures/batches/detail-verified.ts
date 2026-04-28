import type { BatchesDetailFixture } from "../types";

/** /batches/[number] — happy path, batch sealed + proven + settled onchain. */
export const batchesDetailVerified: BatchesDetailFixture = {
  batch: {
    number: 4821,
    root: "0x5e2a7c9b1f4d3e6a8b2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e",
    status: "verified",
    sealedAt: "2026-04-27T14:02:00Z",
    orderCount: 18,
    fillCount: 11,
    pairs: ["USDC/EURC", "USDC/USDT"],
    volumeUsd: "184250.00",
    settlementTx:
      "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    proofRef:
      "0xb7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6",
  },
  orders: [
    {
      id: "o-9482",
      pair: "USDC/EURC",
      side: "sell",
      type: "limit",
      amount: "5000.00",
      price: "0.9215",
      filledPercent: 100,
      status: "settled",
      submittedAt: "2026-04-27T13:42:11Z",
    },
    {
      id: "o-9477",
      pair: "USDC/EURC",
      side: "buy",
      type: "midpoint",
      amount: "1250.00",
      price: "0.9213",
      filledPercent: 100,
      status: "settled",
      submittedAt: "2026-04-27T13:40:08Z",
    },
    {
      id: "o-9476",
      pair: "USDC/USDT",
      side: "sell",
      type: "limit",
      amount: "8000.00",
      price: "1.0001",
      filledPercent: 100,
      status: "settled",
      submittedAt: "2026-04-27T13:38:14Z",
    },
  ],
  fills: [
    {
      id: "f-2914",
      orderId: "o-9482",
      pair: "USDC/EURC",
      side: "sell",
      amount: "5000.00",
      price: "0.9213",
      matchedAt: "2026-04-27T14:02:00Z",
      status: "settled",
    },
    {
      id: "f-2913",
      orderId: "o-9477",
      pair: "USDC/EURC",
      side: "buy",
      amount: "1250.00",
      price: "0.9213",
      matchedAt: "2026-04-27T14:01:58Z",
      status: "settled",
    },
  ],
};
