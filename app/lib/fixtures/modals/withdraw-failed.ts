import type { WithdrawModalFixture } from "../types";

/** Withdraw modal — wallet rejected the EIP-712 signature. */
export const withdrawFailed: WithdrawModalFixture = {
  state: "failed",
  token: "USDC",
  amount: "1500.00",
  error: {
    message: "Withdrawal rejected.",
    code: "USER_REJECTED",
  },
};
