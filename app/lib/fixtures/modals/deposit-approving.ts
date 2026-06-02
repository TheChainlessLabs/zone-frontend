import type { DepositModalFixture } from "../types";

/** Deposit modal — ERC20 allowance approval awaiting wallet confirmation. */
export const depositApproving: DepositModalFixture = {
  state: "approving",
  token: "PATH.USD",
  amount: "10000.00",
};
