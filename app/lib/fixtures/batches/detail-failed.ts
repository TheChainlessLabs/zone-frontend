import type { BatchesDetailFixture } from "../types";

/**
 * /batches/[number] — settlement reverted onchain.
 *
 * Batch was sealed and proven offchain, but the L1 settlement tx failed
 * (e.g. bridge reorg, gas exhaustion). The page surfaces a Failed badge
 * and a "What this means for your fills" explainer.
 */
export const batchesDetailFailed: BatchesDetailFixture = {
  batch: {
    number: 4795,
    root: "0x1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b2c1d0e9f4e1a3b9f8c7d6e5b2a",
    status: "failed",
    sealedAt: "2026-04-27T12:34:00Z",
    orderCount: 6,
    fillCount: 3,
    settlementTx:
      "0xfa11edfa11edfa11ed5ea1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a",
  },
  orders: [
    {
      id: "o-9388",
      pair: "USDC/EURC",
      side: "sell",
      type: "limit",
      amount: "1000.00",
      price: "0.9210",
      filledPercent: 100,
      status: "failed",
      submittedAt: "2026-04-27T12:33:11Z",
    },
  ],
  fills: [
    {
      id: "f-2841",
      orderId: "o-9388",
      pair: "USDC/EURC",
      side: "sell",
      amount: "1000.00",
      price: "0.9210",
      matchedAt: "2026-04-27T12:34:00Z",
      status: "matched",
    },
  ],
};
