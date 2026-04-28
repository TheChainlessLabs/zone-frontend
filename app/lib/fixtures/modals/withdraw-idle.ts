import type { WithdrawModalFixture } from "../types";

/** Withdraw modal — opened, awaiting amount input. */
export const withdrawIdle: WithdrawModalFixture = {
  state: "idle",
  token: "USDC",
  amount: "",
};
