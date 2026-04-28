import type { BatchesListFixture } from "../types";

/**
 * /batches default — last 100 batches, mix of verified and pending.
 *
 * Truncated to 8 here for fixture readability; the page assumes the API
 * returns up to 100 and handles its own pagination.
 */
export const batchesDefault: BatchesListFixture = {
  batches: [
    {
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
    {
      number: 4820,
      root: "0x9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c",
      status: "verified",
      sealedAt: "2026-04-27T14:00:00Z",
      orderCount: 24,
      fillCount: 15,
      pairs: ["USDC/EURC", "USDC/USDT", "USDT/EURC", "ETH/USDC"],
      volumeUsd: "412780.50",
      settlementTx:
        "0xd5e60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4",
      proofRef:
        "0xc3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2",
    },
    {
      number: 4819,
      root: "0x4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b2c1d0e9f",
      status: "verified",
      sealedAt: "2026-04-27T13:58:00Z",
      orderCount: 9,
      fillCount: 6,
      pairs: ["USDC/EURC"],
      volumeUsd: "62100.00",
      settlementTx:
        "0x718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60",
      proofRef:
        "0xa4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293",
    },
    {
      number: 4818,
      root: "0x2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b",
      status: "pending",
      sealedAt: "2026-04-27T13:56:00Z",
      orderCount: 14,
      fillCount: 8,
      pairs: ["USDC/EURC", "USDT/EURC"],
      volumeUsd: "96400.25",
      settlementTx: null,
    },
    {
      number: 4817,
      root: "0x0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b2c1d0e9f4e1a3b9f8c7d6e5b2a1f",
      status: "verified",
      sealedAt: "2026-04-27T13:54:00Z",
      orderCount: 31,
      fillCount: 22,
      pairs: ["USDC/EURC", "USDC/USDT", "USDT/EURC", "ETH/USDC", "BTC/USDC"],
      volumeUsd: "874320.00",
      settlementTx:
        "0xf60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5",
      proofRef:
        "0xe8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a4b5c6d7",
    },
    {
      number: 4816,
      root: "0x6e5b2a1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b2c1d0e9f4e1a3b9f8c7d",
      status: "verified",
      sealedAt: "2026-04-27T13:52:00Z",
      orderCount: 7,
      fillCount: 4,
      pairs: ["USDC/USDT"],
      volumeUsd: "31000.00",
      settlementTx:
        "0x293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718",
      proofRef:
        "0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a4b5c6d7e8f",
    },
    {
      number: 4815,
      root: "0x8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f4d3e6a8b2c1d0e9f4e1a3b9f",
      status: "verified",
      sealedAt: "2026-04-27T13:50:00Z",
      orderCount: 12,
      fillCount: 7,
      pairs: ["USDC/EURC", "USDC/USDT"],
      volumeUsd: "108200.00",
      settlementTx:
        "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a",
      proofRef:
        "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a4b5c6d7e8f9a0",
    },
    {
      number: 4814,
      root: "0x4d3e6a8b2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e5e2a7c9b1f",
      status: "verified",
      sealedAt: "2026-04-27T13:48:00Z",
      orderCount: 19,
      fillCount: 13,
      pairs: ["USDC/EURC", "USDC/USDT", "USDT/EURC"],
      volumeUsd: "227560.00",
      settlementTx:
        "0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a4b5c",
      proofRef:
        "0xd3e4f5a6b7c8d9e0f1a2b3c4d5ea1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2",
    },
  ],
};
