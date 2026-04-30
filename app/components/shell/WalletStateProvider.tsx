"use client";

/**
 * WalletStateProvider — review-time session-state simulator with interactive
 * sign-up / disconnect actions.
 *
 * v0 entry flow (per omega-docs#5 PRD + Decision #12) is email-driven, not
 * wallet-driven. The provider models that flow as
 *   disconnected → signing-up → magic-link-sent → connected
 * with a server-managed pre-generated trading address surfaced under
 * `address` once `connected`. The legacy wallet-connect flow
 * (`connecting` → `connected` via `connect()`) is preserved unchanged so the
 * Phase-4 self-custody mechanism — and its `/system` showcase — keeps
 * working. Real magic-link backend integration lands in M6.
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
  | "signing-up"
  | "magic-link-sent"
  | "connecting"
  | "connected"
  | "wrong-network"
  | "no-nft-pass";

const VALID_STATES: readonly WalletState[] = [
  "disconnected",
  "signing-up",
  "magic-link-sent",
  "connecting",
  "connected",
  "wrong-network",
  "no-nft-pass",
] as const;

const STORAGE_KEY = "omega:wallet-state";
const MOCK_ADDRESS = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";
const MOCK_EMAIL = "trader@omegamarkets.com";
const RIGHT_CHAIN = "Ethereum";
const WRONG_CHAIN = "Base";
const CONNECT_DELAY_MS = 1500;
const SIGN_UP_DELAY_MS = 600;

export interface WalletStateContextValue {
  state: WalletState;
  /** Mock pre-generated trading address — present once the email session is
   *  active (`connected`) or when a wallet flow has produced one. */
  address?: string;
  /** Mock chain name — present whenever a chain is selected. */
  chainName?: string;
  /** Last connector the user picked, if any. */
  connector?: string;
  /** Email associated with the active session, when one exists. */
  email?: string;
  /** Begin a mock email sign-up. Transitions
   *  `signing-up` → `magic-link-sent`. The user activates the link from the
   *  modal, which calls `activateMagicLink()` to land on `connected`. */
  signUp: (email: string) => void;
  /** Mock-activate the magic link. Transitions any post-sign-up state to
   *  `connected` and locks in the email + pre-gen address. */
  activateMagicLink: () => void;
  /** Begin a mock connect flow with the given connector. Transitions through
   *  `connecting` → `connected`. Preserved for the Phase-4 self-custody flow
   *  shown in `/system`. */
  connect: (connector: string) => void;
  /** Drop the mock session. */
  disconnect: () => void;
  /** Mock-switch from `wrong-network` → `connected`. */
  switchNetwork: () => void;
  /** Direct setter — used by `?walletState=` overrides and by review demos. */
  setState: (state: WalletState) => void;
}

interface PersistedShape {
  state: WalletState;
  connector?: string;
  email?: string;
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
    return {
      state: parsed.state,
      connector: parsed.connector,
      email: parsed.email,
    };
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
  const [email, setEmail] = useState<string | undefined>(undefined);
  const hydratedRef = useRef(false);
  const connectingTimerRef = useRef<number | null>(null);
  const signUpTimerRef = useRef<number | null>(null);

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
      setEmail(persisted.email);
    }
  }, [queryOverride]);

  // Persist whenever the natural state changes after hydration. Skip
  // transient states (`connecting`, `signing-up`) so a refresh mid-flow
  // doesn't wedge — a stale transient reload falls back to disconnected
  // gracefully.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (state === "connecting" || state === "signing-up") return;
    writePersisted({ state, connector, email });
  }, [state, connector, email]);

  // Cleanup any running connect / sign-up timers on unmount.
  useEffect(() => {
    return () => {
      if (connectingTimerRef.current !== null) {
        window.clearTimeout(connectingTimerRef.current);
        connectingTimerRef.current = null;
      }
      if (signUpTimerRef.current !== null) {
        window.clearTimeout(signUpTimerRef.current);
        signUpTimerRef.current = null;
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

  const signUp = useCallback((nextEmail: string) => {
    if (signUpTimerRef.current !== null) {
      window.clearTimeout(signUpTimerRef.current);
    }
    setEmail(nextEmail);
    setStateRaw("signing-up");
    signUpTimerRef.current = window.setTimeout(() => {
      setStateRaw("magic-link-sent");
      signUpTimerRef.current = null;
    }, SIGN_UP_DELAY_MS);
  }, []);

  const activateMagicLink = useCallback(() => {
    if (signUpTimerRef.current !== null) {
      window.clearTimeout(signUpTimerRef.current);
      signUpTimerRef.current = null;
    }
    setStateRaw("connected");
  }, []);

  const disconnect = useCallback(() => {
    if (connectingTimerRef.current !== null) {
      window.clearTimeout(connectingTimerRef.current);
      connectingTimerRef.current = null;
    }
    if (signUpTimerRef.current !== null) {
      window.clearTimeout(signUpTimerRef.current);
      signUpTimerRef.current = null;
    }
    setStateRaw("disconnected");
    setConnector(undefined);
    setEmail(undefined);
  }, []);

  const switchNetwork = useCallback(() => {
    setStateRaw("connected");
  }, []);

  const setState = useCallback((s: WalletState) => {
    if (connectingTimerRef.current !== null) {
      window.clearTimeout(connectingTimerRef.current);
      connectingTimerRef.current = null;
    }
    if (signUpTimerRef.current !== null) {
      window.clearTimeout(signUpTimerRef.current);
      signUpTimerRef.current = null;
    }
    setStateRaw(s);
  }, []);

  const value = useMemo<WalletStateContextValue>(() => {
    let address: string | undefined;
    let chainName: string | undefined;
    let resolvedEmail: string | undefined = email;
    switch (state) {
      case "signing-up":
        // Email is captured but the session has not yet activated.
        chainName = RIGHT_CHAIN;
        break;
      case "magic-link-sent":
        chainName = RIGHT_CHAIN;
        break;
      case "connecting":
        chainName = RIGHT_CHAIN;
        break;
      case "connected":
        address = MOCK_ADDRESS;
        chainName = RIGHT_CHAIN;
        // For `?walletState=connected` query overrides the user has not
        // typed an email — fall back to the demo fixture so /account and
        // the navbar don't render an empty session string.
        if (!resolvedEmail) resolvedEmail = MOCK_EMAIL;
        break;
      case "wrong-network":
        address = MOCK_ADDRESS;
        chainName = WRONG_CHAIN;
        if (!resolvedEmail) resolvedEmail = MOCK_EMAIL;
        break;
      case "no-nft-pass":
        address = MOCK_ADDRESS;
        chainName = RIGHT_CHAIN;
        if (!resolvedEmail) resolvedEmail = MOCK_EMAIL;
        break;
      default:
        resolvedEmail = undefined;
        break;
    }
    return {
      state,
      address,
      chainName,
      connector,
      email: resolvedEmail,
      signUp,
      activateMagicLink,
      connect,
      disconnect,
      switchNetwork,
      setState,
    };
  }, [
    state,
    connector,
    email,
    signUp,
    activateMagicLink,
    connect,
    disconnect,
    switchNetwork,
    setState,
  ]);

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
