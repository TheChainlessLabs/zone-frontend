"use client";

/**
 * WalletStateProvider — review-time wallet-state simulator with interactive
 * connect / disconnect actions.
 *
 * Production wagmi wiring lands in M6. This provider gives every M3
 * wireframe an interactive mock: clicking Connect Wallet runs a real state
 * machine (idle → connecting → connected) instead of forcing the reviewer
 * to flip `?walletState=` query params.
 *
 * Persistence: localStorage. State survives reloads.
 *
 * Review override: `?walletState=<state>` still works as a hard set
 * (overrides whatever's in localStorage on mount). Useful for shared URLs
 * and visual-regression snapshots.
 *
 * NFT-pass gate context: omega-docs#12.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

export type WalletState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "wrong-network"
  | "no-nft-pass";

const VALID_STATES: readonly WalletState[] = [
  "disconnected",
  "connecting",
  "connected",
  "wrong-network",
  "no-nft-pass",
] as const;

const STORAGE_KEY = "omega:wallet-state";
const MOCK_ADDRESS = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";
const RIGHT_CHAIN = "Ethereum";
const WRONG_CHAIN = "Base";
const CONNECT_DELAY_MS = 1500;

export interface WalletStateContextValue {
  state: WalletState;
  /** Mock address — present whenever the wallet is "connected enough" to have one. */
  address?: string;
  /** Mock chain name — present whenever a chain is selected. */
  chainName?: string;
  /** Last connector the user picked, if any. */
  connector?: string;
  /** Begin a mock connect flow with the given connector. Transitions through `connecting` → `connected`. */
  connect: (connector: string) => void;
  /** Drop the mock connection. */
  disconnect: () => void;
  /** Mock-switch from `wrong-network` → `connected`. */
  switchNetwork: () => void;
  /** Direct setter — used by `?walletState=` overrides and by review demos. */
  setState: (state: WalletState) => void;
}

interface PersistedShape {
  state: WalletState;
  connector?: string;
}

const WalletStateContext = createContext<WalletStateContextValue | null>(null);

function parseWalletState(raw: string | null): WalletState | null {
  if (!raw) return null;
  return (VALID_STATES as readonly string[]).includes(raw)
    ? (raw as WalletState)
    : null;
}

function readPersisted(): PersistedShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    if (!parsed.state || !(VALID_STATES as readonly string[]).includes(parsed.state)) {
      return null;
    }
    return { state: parsed.state, connector: parsed.connector };
  } catch {
    return null;
  }
}

function writePersisted(value: PersistedShape | null) {
  if (typeof window === "undefined") return;
  if (!value || value.state === "disconnected") {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function WalletStateProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const queryOverride = parseWalletState(params?.get("walletState") ?? null);

  const [state, setStateRaw] = useState<WalletState>("disconnected");
  const [connector, setConnector] = useState<string | undefined>(undefined);
  const hydratedRef = useRef(false);
  const connectingTimerRef = useRef<number | null>(null);

  // Hydrate once: query param wins over localStorage.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (queryOverride) {
      setStateRaw(queryOverride);
      return;
    }
    const persisted = readPersisted();
    if (persisted) {
      setStateRaw(persisted.state);
      setConnector(persisted.connector);
    }
  }, [queryOverride]);

  // Persist whenever the natural state changes after hydration. Skip
  // `connecting` so a refresh mid-connect doesn't wedge — a stale
  // connecting reload should fall back to disconnected gracefully.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (state === "connecting") return;
    writePersisted({ state, connector });
  }, [state, connector]);

  // Cleanup any running connect timer on unmount.
  useEffect(() => {
    return () => {
      if (connectingTimerRef.current !== null) {
        window.clearTimeout(connectingTimerRef.current);
        connectingTimerRef.current = null;
      }
    };
  }, []);

  const connect = useCallback((c: string) => {
    if (connectingTimerRef.current !== null) {
      window.clearTimeout(connectingTimerRef.current);
    }
    setConnector(c);
    setStateRaw("connecting");
    connectingTimerRef.current = window.setTimeout(() => {
      setStateRaw("connected");
      connectingTimerRef.current = null;
    }, CONNECT_DELAY_MS);
  }, []);

  const disconnect = useCallback(() => {
    if (connectingTimerRef.current !== null) {
      window.clearTimeout(connectingTimerRef.current);
      connectingTimerRef.current = null;
    }
    setStateRaw("disconnected");
    setConnector(undefined);
  }, []);

  const switchNetwork = useCallback(() => {
    setStateRaw("connected");
  }, []);

  const setState = useCallback((s: WalletState) => {
    if (connectingTimerRef.current !== null) {
      window.clearTimeout(connectingTimerRef.current);
      connectingTimerRef.current = null;
    }
    setStateRaw(s);
  }, []);

  const value = useMemo<WalletStateContextValue>(() => {
    let address: string | undefined;
    let chainName: string | undefined;
    switch (state) {
      case "connecting":
        chainName = RIGHT_CHAIN;
        break;
      case "connected":
        address = MOCK_ADDRESS;
        chainName = RIGHT_CHAIN;
        break;
      case "wrong-network":
        address = MOCK_ADDRESS;
        chainName = WRONG_CHAIN;
        break;
      case "no-nft-pass":
        address = MOCK_ADDRESS;
        chainName = RIGHT_CHAIN;
        break;
      default:
        break;
    }
    return {
      state,
      address,
      chainName,
      connector,
      connect,
      disconnect,
      switchNetwork,
      setState,
    };
  }, [state, connector, connect, disconnect, switchNetwork, setState]);

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
}

export function useWalletState(): WalletStateContextValue {
  const ctx = useContext(WalletStateContext);
  if (!ctx) {
    throw new Error("useWalletState must be used inside a WalletStateProvider");
  }
  return ctx;
}

/** Truncate an address to `0xa513…C853` form. */
export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`;
}
