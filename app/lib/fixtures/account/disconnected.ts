import type { AccountFixture } from "../types";

/** /account disconnected — wallet not connected; page renders DisconnectedState. */
export const accountDisconnected: AccountFixture = {
  address: null,
  hasNftPass: false,
  preferences: {
    reduceMotion: false,
    showAdvancedOrderTypes: false,
  },
};
