"use client";

/**
 * WalletStateProvider — Tempo wallet session bridge with a mock mode for
 * review-time state coverage.
 *
 * The private-alpha flow uses Tempo Wallet. Production mode derives state from
 * wagmi's Tempo connector. Mock mode keeps a deterministic Tempo-shaped state
 * machine for fixtures, screenshots, and unit tests.
 *
 * Persistence: wagmi handles live Tempo reconnects. Mock mode still persists
 * its deterministic state to localStorage.
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
import {
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  OMEGA_TEMPO_L1_CHAIN_ID,
  OMEGA_TEMPO_L1_CHAIN_NAME,
  OMEGA_ZONE_CHAIN_ID,
  clearPersistedZoneRpcAuthToken,
} from "@/lib/zone";

export type WalletState =
  | "disconnected"
  | "signing-up"
  | "connecting"
  | "connected"
  | "wrong-network"
  | "no-nft-pass";

const VALID_STATES: readonly WalletState[] = [
  "disconnected",
  "signing-up",
  "connecting",
  "connected",
  "wrong-network",
  "no-nft-pass",
] as const;

const STORAGE_KEY = "omega:wallet-state";
const MOCK_ADDRESS = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";
const RIGHT_CHAIN = OMEGA_TEMPO_L1_CHAIN_NAME;
const WRONG_CHAIN = "Ethereum";
const CONNECT_DELAY_MS = 1500;
const SIGN_UP_DELAY_MS = 600;

export type WalletStateMode = "tempo" | "mock";

export interface WalletStateContextValue {
  state: WalletState;
  /** Connected Tempo account address. Mock mode returns a deterministic fixture. */
  address?: string;
  /** Mock chain name — present whenever a chain is selected. */
  chainName?: string;
  /** Last connector the user picked, if any. */
  connector?: string;
  /** Last connector error, suitable for a modal-level failure state. */
  errorMessage?: string;
  /** Begin account setup. In Tempo mode this starts Tempo Wallet registration.
   *  Mock mode simulates the same transition deterministically. */
  signUp: () => void;
  /** Begin a mock connect flow with the given connector. Transitions through
   *  `connecting` → `connected`. Preserved for the Phase-4 self-custody flow
   *  shown in `/system`. */
  connect: (connector?: string) => void;
  /** Drop the mock session. */
  disconnect: () => void;
  /** Mock-switch from `wrong-network` → `connected`. */
  switchNetwork: () => void;
  /** Direct setter — used by `?walletState=` overrides and by review demos. */
  setState: (state: WalletState) => void;
  /** Clear the last connector error without changing wallet connection. */
  clearError: () => void;
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
    return {
      state: parsed.state,
      connector: parsed.connector,
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

export function WalletStateProvider({
  children,
  mode = "tempo",
}: {
  children: ReactNode;
  mode?: WalletStateMode;
}) {
  if (mode === "mock") {
    return <MockWalletStateProvider>{children}</MockWalletStateProvider>;
  }
  return <TempoBackedWalletStateProvider>{children}</TempoBackedWalletStateProvider>;
}

function TempoBackedWalletStateProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const queryOverride = parseWalletState(params?.get("walletState") ?? null);
  const connection = useConnection();
  const connectMutation = useConnect();
  const connectors = useConnectors();
  const disconnectMutation = useDisconnect();
  const switchChainMutation = useSwitchChain();

  const [reviewState, setReviewState] = useState<WalletState | null>(null);
  const [pendingConnector, setPendingConnector] = useState<string | undefined>();
  const [pendingIntent, setPendingIntent] = useState<
    "connect" | "sign-up" | undefined
  >();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (queryOverride) setReviewState(queryOverride);
  }, [queryOverride]);

  const tempoConnector = useMemo(
    () =>
      connectors.find((c) => c.id === "xyz.tempo") ??
      connectors.find((c) => c.name.toLowerCase().includes("tempo")) ??
      connectors[0],
    [connectors],
  );

  const beginTempoConnect = useCallback(
    (intent: "connect" | "sign-up", connectorLabel?: string) => {
      setReviewState(null);
      setErrorMessage(undefined);
      setPendingIntent(intent);
      setPendingConnector(connectorLabel ?? tempoConnector?.name ?? "Tempo Wallet");

      if (!tempoConnector) {
        setPendingIntent(undefined);
        setPendingConnector(undefined);
        setErrorMessage("Tempo Wallet connector is not available.");
        return;
      }

      connectMutation.connect(
        {
          connector: tempoConnector,
          chainId: OMEGA_TEMPO_L1_CHAIN_ID,
          ...(intent === "sign-up"
            ? { capabilities: { method: "register", name: "Omega" } }
            : {}),
        } as Parameters<typeof connectMutation.connect>[0],
        {
          onError(error) {
            setErrorMessage(getErrorMessage(error));
          },
          onSettled() {
            setPendingIntent(undefined);
            setPendingConnector(undefined);
          },
        },
      );
    },
    [connectMutation, tempoConnector],
  );

  const signUp = useCallback(() => {
    beginTempoConnect("sign-up");
  }, [beginTempoConnect]);

  const connect = useCallback(
    (connectorLabel?: string) => {
      beginTempoConnect("connect", connectorLabel);
    },
    [beginTempoConnect],
  );

  const disconnect = useCallback(() => {
    setReviewState(null);
    setErrorMessage(undefined);
    clearPersistedZoneRpcAuthToken();
    if (!connection.isConnected && !connection.isReconnecting) return;
    disconnectMutation.disconnect(undefined, {
      onError(error) {
        setErrorMessage(getErrorMessage(error));
      },
    });
  }, [connection.isConnected, connection.isReconnecting, disconnectMutation]);

  const switchNetwork = useCallback(() => {
    if (reviewState) {
      setReviewState("connected");
      return;
    }
    switchChainMutation.switchChain(
      { chainId: OMEGA_TEMPO_L1_CHAIN_ID },
      {
        onError(error) {
          setErrorMessage(getErrorMessage(error));
        },
      },
    );
  }, [reviewState, switchChainMutation]);

  const setState = useCallback((s: WalletState) => {
    setReviewState(s);
    setErrorMessage(undefined);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  const value = useMemo<WalletStateContextValue>(() => {
    const pending =
      pendingIntent !== undefined ||
      connectMutation.isPending ||
      disconnectMutation.isPending ||
      switchChainMutation.isPending ||
      connection.isConnecting ||
      connection.isReconnecting;

    const liveState: WalletState = pending
      ? pendingIntent === "sign-up"
        ? "signing-up"
        : "connecting"
      : connection.isConnected
      ? isSupportedTempoChain(connection.chainId)
        ? "connected"
        : "wrong-network"
      : "disconnected";

    const state = reviewState ?? liveState;
    const reviewAddress =
      state === "connected" || state === "wrong-network" || state === "no-nft-pass"
        ? MOCK_ADDRESS
        : undefined;
    const address = reviewState ? reviewAddress : connection.address;
    const chainName = reviewState
      ? chainNameForReviewState(state)
      : state === "disconnected"
      ? undefined
      : connection.chain?.name ??
        (connection.chainId ? `Chain ${connection.chainId}` : RIGHT_CHAIN);

    return {
      state,
      address,
      chainName,
      connector:
        (reviewState ? pendingConnector : connection.connector?.name) ??
        pendingConnector ??
        "Tempo Wallet",
      errorMessage,
      signUp,
      connect,
      disconnect,
      switchNetwork,
      setState,
      clearError,
    };
  }, [
    pendingIntent,
    connectMutation.isPending,
    disconnectMutation.isPending,
    switchChainMutation.isPending,
    connection.isConnecting,
    connection.isReconnecting,
    connection.isConnected,
    connection.chainId,
    connection.address,
    connection.chain?.name,
    connection.connector?.name,
    reviewState,
    pendingConnector,
    errorMessage,
    signUp,
    connect,
    disconnect,
    switchNetwork,
    setState,
    clearError,
  ]);

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
}

function MockWalletStateProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const queryOverride = parseWalletState(params?.get("walletState") ?? null);

  const [state, setStateRaw] = useState<WalletState>("disconnected");
  const [connector, setConnector] = useState<string | undefined>(undefined);
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
    }
  }, [queryOverride]);

  // Persist whenever the natural state changes after hydration. Skip
  // transient states (`connecting`, `signing-up`) so a refresh mid-flow
  // doesn't wedge — a stale transient reload falls back to disconnected
  // gracefully.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (state === "connecting" || state === "signing-up") return;
    writePersisted({ state, connector });
  }, [state, connector]);

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

  const connect = useCallback((c: string = "Tempo Wallet") => {
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

  const signUp = useCallback(() => {
    if (signUpTimerRef.current !== null) {
      window.clearTimeout(signUpTimerRef.current);
    }
    setConnector("Tempo Wallet");
    setStateRaw("signing-up");
    signUpTimerRef.current = window.setTimeout(() => {
      setStateRaw("connected");
      signUpTimerRef.current = null;
    }, SIGN_UP_DELAY_MS);
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

  const clearError = useCallback(() => {}, []);

  const value = useMemo<WalletStateContextValue>(() => {
    let address: string | undefined;
    let chainName: string | undefined;
    switch (state) {
      case "signing-up":
        chainName = RIGHT_CHAIN;
        break;
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
      signUp,
      connect,
      disconnect,
      switchNetwork,
      setState,
      clearError,
    };
  }, [
    state,
    connector,
    signUp,
    connect,
    disconnect,
    switchNetwork,
    setState,
    clearError,
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

function chainNameForReviewState(state: WalletState): string | undefined {
  switch (state) {
    case "signing-up":
    case "connecting":
    case "connected":
    case "no-nft-pass":
      return RIGHT_CHAIN;
    case "wrong-network":
      return WRONG_CHAIN;
    case "disconnected":
      return undefined;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Tempo Wallet could not complete the request.";
}

function isSupportedTempoChain(chainId: number | undefined): boolean {
  return chainId === OMEGA_TEMPO_L1_CHAIN_ID || chainId === OMEGA_ZONE_CHAIN_ID;
}

/** Truncate an address to `0xa513…C853` form. */
export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`;
}
