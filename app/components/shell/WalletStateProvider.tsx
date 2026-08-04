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
  useWalletClient,
} from "wagmi";
import type { Address } from "viem";
import {
  OMEGA_TEMPO_L1_CHAIN_ID,
  OMEGA_TEMPO_L1_CHAIN_NAME,
  OMEGA_ZONE_CHAIN_ID,
  clearPersistedZoneRpcAuthToken,
  ensureZoneSessionAccessKey,
  getOrCreateZoneRpcAuthToken,
  hasUsableZoneSessionAccessKey,
  isZoneRpcAuthTokenExpired,
  readPersistedZoneRpcAuthToken,
  resolveZoneTransactionSigner,
  verifyOmegaZoneAuthToken,
  ZoneTransactionSignerUnavailableError,
} from "@/lib/zone";

export type WalletState =
  | "disconnected"
  | "signing-up"
  | "connecting"
  | "reviewing-login"
  | "authenticating-zone"
  | "authorizing-session"
  | "connected"
  | "wrong-network"
  | "no-nft-pass";

const VALID_STATES: readonly WalletState[] = [
  "disconnected",
  "signing-up",
  "connecting",
  "reviewing-login",
  "authenticating-zone",
  "authorizing-session",
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
  /** Open the Omega login review before any wallet prompt starts. */
  reviewLogin: () => void;
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
  /** True when the dev test-wallet connector is registered (gated by
   *  NEXT_PUBLIC_DEV_WALLET_PK). Lets the connect modal surface a dev sign-in. */
  isDevWalletAvailable: boolean;
  /** True when the dev maker-wallet connector is registered (gated by
   *  NEXT_PUBLIC_MAKER_WALLET_PK). Used to create real two-party fills locally. */
  isMakerWalletAvailable: boolean;
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
  const { data: walletClient } = useWalletClient({
    chainId: OMEGA_ZONE_CHAIN_ID,
  });

  const [reviewState, setReviewState] = useState<WalletState | null>(null);
  const [pendingConnector, setPendingConnector] = useState<string | undefined>();
  const [pendingIntent, setPendingIntent] = useState<
    | "connect"
    | "sign-up"
    | "reviewing-login"
    | "authenticating-zone"
    | "authorize-session"
    | undefined
  >();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const hydratedRef = useRef(false);
  const authorizedSessionAccountRef = useRef<string | undefined>(undefined);
  const loginReviewAcceptedRef = useRef(false);
  const sessionAccessKeyStatusRef = useRef<
    { account: string; hasKey: boolean } | undefined
  >(undefined);

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

  // Dev-only key-backed connectors (see lib/omega-zone/config.ts). Matched by
  // NAME (both are `dangerous_secp256k1`) so each is addressable independently.
  const devConnector = useMemo(
    () => connectors.find((c) => c.name === "Test Wallet (dev)"),
    [connectors],
  );
  const makerConnector = useMemo(
    () => connectors.find((c) => c.name === "Maker Wallet (dev)"),
    [connectors],
  );

  const completeConnectedZoneLogin = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const address = connection.address;
      const connector = connection.connector;
      if (
        !connection.isConnected ||
        !address ||
        !isSupportedTempoChain(connection.chainId)
      ) {
        return;
      }
      if (!shouldAuthorizeZoneSessionConnector(connector)) {
        authorizedSessionAccountRef.current = address;
        return;
      }
      if (
        !force &&
        authorizedSessionAccountRef.current?.toLowerCase() ===
          address.toLowerCase() &&
        hasUsableZoneRpcAuthToken(address as Address)
      ) {
        return;
      }

      setPendingConnector(connector?.name ?? "Tempo Wallet");
      setErrorMessage(undefined);

      try {
        const account = address as Address;
        if (!hasUsableZoneRpcAuthToken(account)) {
          setPendingIntent("authenticating-zone");
          await waitForAuthorizationCopyRender();
        }

        const authToken = await getOrCreateZoneRpcAuthToken({
          account,
          getProvider: () =>
            resolveZoneTransactionSigner({
              connector,
              fallback: walletClient,
            }),
        });
        try {
          await verifyOmegaZoneAuthToken({ authToken, account });
        } catch (error) {
          clearPersistedZoneRpcAuthToken(account);
          throw error;
        }

        setPendingIntent("authorize-session");
        await waitForAuthorizationCopyRender();

        const provider = await resolveZoneTransactionSigner({
          connector,
          fallback: walletClient,
          chainId: OMEGA_ZONE_CHAIN_ID,
        });

        await ensureZoneSessionAccessKey({
          signer: provider,
          account,
        });
        authorizedSessionAccountRef.current = address;
        sessionAccessKeyStatusRef.current = {
          account: address.toLowerCase(),
          hasKey: true,
        };
        loginReviewAcceptedRef.current = false;
      } catch (error) {
        authorizedSessionAccountRef.current = undefined;
        sessionAccessKeyStatusRef.current = undefined;
        loginReviewAcceptedRef.current = false;
        if (!force && error instanceof ZoneTransactionSignerUnavailableError) {
          return;
        }
        setErrorMessage(getWalletConnectionErrorMessage(error));
        throw error;
      } finally {
        setPendingIntent(undefined);
        setPendingConnector(undefined);
      }
    },
    [
      connection.address,
      connection.chainId,
      connection.connector,
      connection.isConnected,
      walletClient,
    ],
  );

  useEffect(() => {
    if (reviewState) return;
    if (
      !connection.isConnected ||
      !connection.address ||
      !isSupportedTempoChain(connection.chainId)
    ) {
      authorizedSessionAccountRef.current = undefined;
      sessionAccessKeyStatusRef.current = undefined;
      loginReviewAcceptedRef.current = false;
      return;
    }
    if (!shouldAuthorizeZoneSessionConnector(connection.connector)) {
      authorizedSessionAccountRef.current = connection.address;
      sessionAccessKeyStatusRef.current = undefined;
      loginReviewAcceptedRef.current = false;
      return;
    }
    if (
      authorizedSessionAccountRef.current?.toLowerCase() ===
        connection.address.toLowerCase() &&
      hasUsableZoneRpcAuthToken(connection.address as Address)
    ) {
      loginReviewAcceptedRef.current = false;
      return;
    }

    const account = connection.address as Address;
    const normalizedAccount = account.toLowerCase();
    if (hasUsableZoneRpcAuthToken(account)) {
      const checkedSession = sessionAccessKeyStatusRef.current;
      if (checkedSession?.account === normalizedAccount) {
        if (checkedSession.hasKey) {
          authorizedSessionAccountRef.current = connection.address;
          loginReviewAcceptedRef.current = false;
          setPendingIntent(undefined);
          setPendingConnector(undefined);
          return;
        }
        if (loginReviewAcceptedRef.current) {
          void completeConnectedZoneLogin().catch(() => {});
          return;
        }
        setPendingIntent("reviewing-login");
        setPendingConnector(connection.connector?.name ?? "Tempo Wallet");
        setErrorMessage(undefined);
        return;
      }

      let cancelled = false;
      void (async () => {
        const authToken = readPersistedZoneRpcAuthToken(account);
        if (!authToken) return;
        try {
          await verifyOmegaZoneAuthToken({ authToken, account });
        } catch {
          if (cancelled) return;
          clearPersistedZoneRpcAuthToken(account);
          sessionAccessKeyStatusRef.current = {
            account: normalizedAccount,
            hasKey: false,
          };
          setPendingIntent("reviewing-login");
          setPendingConnector(connection.connector?.name ?? "Tempo Wallet");
          setErrorMessage(undefined);
          return;
        }

        try {
          const provider = await resolveZoneTransactionSigner({
            connector: connection.connector,
            fallback: walletClient,
            chainId: OMEGA_ZONE_CHAIN_ID,
          });
          const hasKey = hasUsableZoneSessionAccessKey({
            signer: provider,
            account,
          });
          if (cancelled) return;
          sessionAccessKeyStatusRef.current = {
            account: normalizedAccount,
            hasKey,
          };
          if (hasKey) {
            authorizedSessionAccountRef.current = connection.address;
            loginReviewAcceptedRef.current = false;
            setPendingIntent(undefined);
            setPendingConnector(undefined);
            return;
          }
          setPendingIntent("reviewing-login");
          setPendingConnector(connection.connector?.name ?? "Tempo Wallet");
          setErrorMessage(undefined);
        } catch (error) {
          if (
            !cancelled &&
            !(error instanceof ZoneTransactionSignerUnavailableError)
          ) {
            setErrorMessage(getWalletConnectionErrorMessage(error));
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (loginReviewAcceptedRef.current) {
      void completeConnectedZoneLogin().catch(() => {});
      return;
    }

    setPendingIntent("reviewing-login");
    setPendingConnector(connection.connector?.name ?? "Tempo Wallet");
    setErrorMessage(undefined);
  }, [
    completeConnectedZoneLogin,
    connection.address,
    connection.chainId,
    connection.connector,
    connection.isConnected,
    reviewState,
    walletClient,
  ]);

  const beginTempoConnect = useCallback(
    (intent: "connect" | "sign-up", connectorLabel?: string) => {
      setReviewState(null);
      setErrorMessage(undefined);
      setPendingIntent(intent);

      // Honor an explicit connector label (e.g. the dev test wallet); otherwise
      // fall back to the Tempo connector.
      const chosen =
        (connectorLabel
          ? connectors.find((c) => c.name === connectorLabel)
          : undefined) ?? tempoConnector;
      setPendingConnector(connectorLabel ?? tempoConnector?.name ?? "Tempo Wallet");
      loginReviewAcceptedRef.current =
        shouldAuthorizeZoneSessionConnector(chosen);

      if (!chosen) {
        setPendingIntent(undefined);
        setPendingConnector(undefined);
        loginReviewAcceptedRef.current = false;
        setErrorMessage("Tempo Wallet connector is not available.");
        return;
      }

      // Account registration (`sign-up`) is a Tempo-wallet capability; never
      // request it for a non-Tempo connector such as the dev test wallet.
      const isTempo = chosen === tempoConnector;

      connectMutation.connect(
        {
          connector: chosen,
          chainId: OMEGA_TEMPO_L1_CHAIN_ID,
          ...(intent === "sign-up" && isTempo
            ? { capabilities: { method: "register", name: "Omega" } }
            : {}),
        } as Parameters<typeof connectMutation.connect>[0],
        {
          onError(error) {
            loginReviewAcceptedRef.current = false;
            setErrorMessage(getWalletConnectionErrorMessage(error));
          },
          onSettled() {
            setPendingIntent(undefined);
            setPendingConnector(undefined);
          },
        },
      );
    },
    [connectMutation, connectors, tempoConnector],
  );

  const signUp = useCallback(() => {
    beginTempoConnect("sign-up");
  }, [beginTempoConnect]);

  const reviewLogin = useCallback(() => {
    setReviewState(null);
    setErrorMessage(undefined);
    setPendingConnector(tempoConnector?.name ?? "Tempo Wallet");
    setPendingIntent("reviewing-login");
    loginReviewAcceptedRef.current = false;
  }, [tempoConnector?.name]);

  const connect = useCallback(
    (connectorLabel?: string) => {
      if (
        (!connectorLabel || connectorLabel === "Tempo Wallet") &&
        connection.isConnected &&
        connection.address &&
        shouldAuthorizeZoneSessionConnector(connection.connector)
      ) {
        loginReviewAcceptedRef.current = true;
        void completeConnectedZoneLogin({ force: true }).catch(() => {});
        return;
      }
      beginTempoConnect("connect", connectorLabel);
    },
    [
      completeConnectedZoneLogin,
      beginTempoConnect,
      connection.address,
      connection.connector,
      connection.isConnected,
    ],
  );

  const disconnect = useCallback(() => {
    setReviewState(null);
    setErrorMessage(undefined);
    authorizedSessionAccountRef.current = undefined;
    sessionAccessKeyStatusRef.current = undefined;
    loginReviewAcceptedRef.current = false;
    clearPersistedZoneRpcAuthToken();
    if (!connection.isConnected && !connection.isReconnecting) return;
    disconnectMutation.disconnect(undefined, {
      onError(error) {
        setErrorMessage(getWalletConnectionErrorMessage(error));
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
          setErrorMessage(getWalletConnectionErrorMessage(error));
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
        : pendingIntent === "reviewing-login"
        ? "reviewing-login"
        : pendingIntent === "authenticating-zone"
        ? "authenticating-zone"
        : pendingIntent === "authorize-session"
        ? "authorizing-session"
        : "connecting"
      : connection.isConnected
      ? isSupportedTempoChain(connection.chainId)
        ? needsConnectedZoneLogin({
            address: connection.address,
            connector: connection.connector,
            authorizedAccount: authorizedSessionAccountRef.current,
          })
          ? "reviewing-login"
          : "connected"
        : "wrong-network"
      : "disconnected";

    const state = reviewState ?? liveState;
    const reviewAddress =
      state === "connected" ||
      state === "reviewing-login" ||
      state === "authenticating-zone" ||
      state === "authorizing-session" ||
      state === "wrong-network" ||
      state === "no-nft-pass"
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
      reviewLogin,
      connect,
      disconnect,
      switchNetwork,
      setState,
      clearError,
      isDevWalletAvailable: Boolean(devConnector),
      isMakerWalletAvailable: Boolean(makerConnector),
    };
  }, [
    devConnector,
    makerConnector,
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
    connection.connector,
    connection.connector?.name,
    reviewState,
    pendingConnector,
    errorMessage,
    signUp,
    reviewLogin,
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
    if (
      state === "connecting" ||
      state === "signing-up" ||
      state === "reviewing-login" ||
      state === "authenticating-zone" ||
      state === "authorizing-session"
    ) {
      return;
    }
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

  const reviewLogin = useCallback(() => {
    setConnector("Tempo Wallet");
    setStateRaw("reviewing-login");
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
      case "reviewing-login":
      case "authenticating-zone":
      case "authorizing-session":
        address = MOCK_ADDRESS;
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
      reviewLogin,
      connect,
      disconnect,
      switchNetwork,
      setState,
      clearError,
      isDevWalletAvailable: false,
      isMakerWalletAvailable: false,
    };
  }, [
    state,
    connector,
    signUp,
    reviewLogin,
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
    case "reviewing-login":
    case "authenticating-zone":
    case "authorizing-session":
    case "connected":
    case "no-nft-pass":
      return RIGHT_CHAIN;
    case "wrong-network":
      return WRONG_CHAIN;
    case "disconnected":
      return undefined;
  }
}

function hasUsableZoneRpcAuthToken(account: Address): boolean {
  const authToken = readPersistedZoneRpcAuthToken(account);
  return Boolean(authToken && !isZoneRpcAuthTokenExpired(authToken));
}

function needsConnectedZoneLogin({
  address,
  connector,
  authorizedAccount,
}: {
  address?: string;
  connector?: { id?: string; name?: string };
  authorizedAccount?: string;
}): boolean {
  if (!address || !shouldAuthorizeZoneSessionConnector(connector)) return false;
  if (!hasUsableZoneRpcAuthToken(address as Address)) return true;
  return Boolean(
    authorizedAccount &&
      authorizedAccount.toLowerCase() !== address.toLowerCase(),
  );
}

export function getWalletConnectionErrorMessage(error: unknown): string {
  const message =
    error instanceof Error && error.message
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (isWebAuthnTlsError(message)) {
    return [
      "Tempo Wallet passkeys require a trusted browser origin.",
      "Open Omega on http://localhost for local dev, or use HTTPS with a valid trusted certificate.",
    ].join(" ");
  }

  if (message) return message;
  return "Tempo Wallet could not complete the request.";
}

function isWebAuthnTlsError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("webauthn") &&
    (normalized.includes("tls certificate") ||
      normalized.includes("certificate error") ||
      normalized.includes("not supported on sites with tls") ||
      normalized.includes("secure context"))
  );
}

function isSupportedTempoChain(chainId: number | undefined): boolean {
  return chainId === OMEGA_TEMPO_L1_CHAIN_ID || chainId === OMEGA_ZONE_CHAIN_ID;
}

function shouldAuthorizeZoneSessionConnector(
  connector: { id?: string; name?: string } | undefined,
): boolean {
  if (!connector) return false;
  const name = connector.name?.toLowerCase() ?? "";
  return connector.id === "xyz.tempo" || name === "tempo wallet";
}

function waitForAuthorizationCopyRender(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** Truncate an address to `0xa513…C853` form. */
export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`;
}
