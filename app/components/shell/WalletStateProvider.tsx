"use client";

/**
 * WalletStateProvider — review-time wallet-state simulator.
 *
 * Reads `?walletState=` from the URL and exposes the current connection
 * state via `useWalletState()`. Production wagmi wiring lands in M6; this
 * provider's only job is to let M3.1–M3.7 render every connection branch
 * (disconnected / connected / wrong-network / no-NFT-pass) without a real
 * wallet. The mock address and chain name are deliberate constants so
 * design review surfaces are stable across screenshots.
 *
 * NFT-pass gate context: omega-docs#12.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

export type WalletState =
  | "disconnected"
  | "connected"
  | "wrong-network"
  | "no-nft-pass";

const VALID_STATES: readonly WalletState[] = [
  "disconnected",
  "connected",
  "wrong-network",
  "no-nft-pass",
] as const;

export interface WalletStateContextValue {
  state: WalletState;
  /** Mock address — present whenever the wallet is "connected enough" to have one. */
  address?: string;
  /** Mock chain name — present whenever a chain is selected. */
  chainName?: string;
}

// Stable mock identity. The exact address/chain do not matter; what matters
// is that they stay byte-identical across reviews so visual regression
// snapshots don't flap on a rerun.
const MOCK_ADDRESS = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";
const RIGHT_CHAIN = "Ethereum";
const WRONG_CHAIN = "Base";

const WalletStateContext = createContext<WalletStateContextValue>({
  state: "disconnected",
});

function parseWalletState(raw: string | null): WalletState {
  if (!raw) return "disconnected";
  return (VALID_STATES as readonly string[]).includes(raw)
    ? (raw as WalletState)
    : "disconnected";
}

export function WalletStateProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const state = parseWalletState(params?.get("walletState") ?? null);

  const value = useMemo<WalletStateContextValue>(() => {
    switch (state) {
      case "connected":
        return { state, address: MOCK_ADDRESS, chainName: RIGHT_CHAIN };
      case "wrong-network":
        return { state, address: MOCK_ADDRESS, chainName: WRONG_CHAIN };
      case "no-nft-pass":
        // The wallet is connected to the right chain — the rejection is
        // strictly that the address holds no Phase-4 NFT pass. Address +
        // chain stay populated so downstream UIs can render "we know who
        // you are, we just can't let you in".
        return { state, address: MOCK_ADDRESS, chainName: RIGHT_CHAIN };
      case "disconnected":
      default:
        return { state: "disconnected" };
    }
  }, [state]);

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
}

export function useWalletState(): WalletStateContextValue {
  return useContext(WalletStateContext);
}

/** Truncate an address to `0xa513…C853` form. */
export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`;
}
