import type { DepositModalFixture } from "../types";

/** Deposit modal — bridge.deposit() awaiting wallet confirmation. */
export const depositDepositing: DepositModalFixture = {
  state: "depositing",
  token: "USDC",
  amount: "10000.00",
};
