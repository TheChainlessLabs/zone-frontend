import type { ConnectModalFixture } from "../types";

/** ConnectWallet modal — user rejected the connection prompt. */
export const connectFailed: ConnectModalFixture = {
  state: "failed",
  error: {
    message: "Wallet connection rejected.",
    code: "USER_REJECTED",
  },
};
