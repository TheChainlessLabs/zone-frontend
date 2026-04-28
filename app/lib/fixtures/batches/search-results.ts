import type { BatchesSearchFixture } from "../types";

/** /batches search — query matches batch number prefix. */
export const batchesSearchResults: BatchesSearchFixture = {
  query: "482",
  results: [
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
  ],
};
