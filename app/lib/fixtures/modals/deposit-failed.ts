import type { DepositModalFixture } from "../types";

/** Deposit modal — wallet rejected the deposit signature. */
export const depositFailed: DepositModalFixture = {
  state: "failed",
  token: "PATH.USD",
  amount: "10000.00",
  error: {
    message: "Deposit rejected.",
    code: "USER_REJECTED",
  },
};
