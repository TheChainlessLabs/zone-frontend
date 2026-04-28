import type { WithdrawModalFixture } from "../types";

/** Withdraw modal — EIP-712 typed-data signature awaiting wallet confirmation. */
export const withdrawSigning: WithdrawModalFixture = {
  state: "signing",
  token: "USDC",
  amount: "1500.00",
};
