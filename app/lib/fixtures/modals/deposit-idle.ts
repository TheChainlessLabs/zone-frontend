import type { DepositModalFixture } from "../types";

/** Deposit modal — opened, no token/amount selected yet. */
export const depositIdle: DepositModalFixture = {
  state: "idle",
  token: "PATH.USD",
  amount: "",
};
