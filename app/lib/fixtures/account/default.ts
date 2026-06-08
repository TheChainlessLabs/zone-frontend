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
  // Demo zone snapshot — stands in for the unwired private RPC so Settings
  // reads as live instead of an empty Authorize/Pending panel.
  zone: {
    authorized: true,
    chainName: "Omega Zone",
    zoneBalances: { pathUsd: "48,250.00", oalpha: "12,500.00" },
    darkpoolBalances: { pathUsd: "9,400.00", oalpha: "3,150.00" },
  },
};
