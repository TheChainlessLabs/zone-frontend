import type { AccountFixture } from "../types";

/** /account default — connected, NFT pass present, session live. */
export const accountDefault: AccountFixture = {
  address: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
  hasNftPass: true,
  sessionStartedAt: "2026-04-27T09:00:00Z",
  preferences: {
    reduceMotion: false,
    showAdvancedOrderTypes: true,
  },
};
