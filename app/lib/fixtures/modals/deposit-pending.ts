import type { DepositModalFixture } from "../types";

/** Deposit modal — tx broadcast, waiting for relayer to credit balance. */
export const depositPending: DepositModalFixture = {
  state: "pending",
  token: "USDC",
  amount: "10000.00",
  txHash:
    "0x4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f",
};
