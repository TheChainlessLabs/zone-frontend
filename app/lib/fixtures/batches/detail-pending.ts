import type { BatchesDetailFixture } from "../types";

/** /batches/[number] — sealed but proof not yet generated, no settlement tx. */
export const batchesDetailPending: BatchesDetailFixture = {
  batch: {
    number: 4818,
    root: "0x2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b",
    status: "pending",
    sealedAt: "2026-04-27T13:56:00Z",
    orderCount: 14,
    fillCount: 8,
    settlementTx: null,
  },
  orders: [
    {
      id: "o-9468",
      pair: "USDC/EURC",
      side: "sell",
      type: "limit",
      amount: "2000.00",
      price: "0.9214",
      filledPercent: 100,
      status: "matched",
      submittedAt: "2026-04-27T13:55:01Z",
    },
    {
      id: "o-9467",
      pair: "USDC/EURC",
      side: "buy",
      type: "market",
      amount: "2000.00",
      price: "0.9214",
      filledPercent: 100,
      status: "matched",
      submittedAt: "2026-04-27T13:55:00Z",
    },
  ],
  fills: [
    {
      id: "f-2902",
      orderId: "o-9468",
      pair: "USDC/EURC",
      side: "sell",
      amount: "2000.00",
      price: "0.9214",
      matchedAt: "2026-04-27T13:55:30Z",
      status: "matched",
    },
  ],
};
