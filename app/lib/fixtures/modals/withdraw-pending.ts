import type { WithdrawModalFixture } from "../types";

/** Withdraw modal — sequencer accepted; awaiting batch settlement onchain. */
export const withdrawPending: WithdrawModalFixture = {
  state: "pending",
  token: "PATH.USD",
  amount: "1500.00",
  txHash:
    "0x2c1d0e9f4e1a3b9f8c7d6e5b2a1f0c9d8e7b6a5f4c3d2e1f0a9b8c7d6e5f4a3b",
};
