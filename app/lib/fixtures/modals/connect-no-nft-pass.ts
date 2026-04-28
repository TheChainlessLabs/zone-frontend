import type { ConnectModalFixture } from "../types";

/**
 * ConnectWallet modal — wallet connected but address does not hold an
 * Omega NFT pass. Modal blocks entry to /trade and /portfolio with a
 * "Get a pass" affordance.
 */
export const connectNoNftPass: ConnectModalFixture = {
  state: "no-nft-pass",
  address: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
  error: {
    message: "Omega is invitation-only. This wallet does not hold a pass.",
    code: "NO_NFT_PASS",
  },
};
