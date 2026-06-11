"use client";

/**
 * /trade — M3.2 wireframe.
 *
 * Action-first execution surface (omega-docs/03-brand/visual-identity.md).
 * Two modes:
 *   • Market — narrow centred 480px column; order form is the only surface.
 *   • Limit  — wide 1280px split (form left, chart + your fills right on lg+).
 *
 * Brand stance: no chart in Market mode; no public order book; no global
 * trade tape; user-fills-only timeline. Pairs are stablecoin/crypto BASE/QUOTE
 * tickers (omega-docs/03-brand/naming.md), never fiat.
 *
 * State coverage (all 7 from PRD, omega-docs#5):
 *   default · empty · loading · error · skeleton · disconnected · wrong-network
 * Reachable via `?state=…`. Wallet branches additionally reachable via
 * `?walletState=…` through AppShell's guard layer.
 */

import * as React from "react";
import {
  decodeEventLog,
  formatUnits,
  parseUnits,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";
import {
  useAccount,
  useConnections,
  useSignMessage,
  useWalletClient,
} from "wagmi";

import { PageLayout } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import { Animate } from "@/components/ui/animate";
import { Icon } from "@/lib/icons";
import {
  ChartPlaceholder,
  MatchToast,
  OrderForm,
  OrderModeSelector,
  PairSwitcher,
  YourFills,
  YourOpenOrders,
  type MatchToastFill,
  type OrderMode,
  type OrderFormSubmitPayload,
} from "@/components/trade";
import type { LaunchPair } from "@/lib/pairs";
import type { FillFixture, OrderFixture } from "@/lib/view-types";
import { useWalletState } from "@/components/shell/WalletStateProvider";
import {
  DARKPOOL_PARSED_ABI,
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  buildZoneRpcAuthToken,
  darkpoolMarketBuyRequest,
  darkpoolMarketSellRequest,
  darkpoolPlaceOrderRequest,
  fetchOmegaZoneActivity,
  getTempoNativeAuthSigner,
  isZoneAuthError,
  isZoneRpcAuthTokenExpired,
  clearPersistedZoneRpcAuthToken,
  getZoneMidpointHistory,
  getZonePublicMidpointHistory,
  getZonePublicTopOfBook,
  mergeOmegaZoneActivity,
  persistZoneRpcAuthToken,
  waitForZoneTransactionReceipt,
  readPersistedZoneRpcAuthToken,
  readOmegaZoneActivity,
  readPrivateBestAsk,
  readPrivateBestBid,
  readPrivateZoneOalphaBalance,
  readPrivateZonePathUsdBalance,
  readPrivateZoneTokenBalance,
  signAndSendPrivateZoneContractWrite,
  type OmegaZoneActivity,
  type ZoneTransactionSigner,
} from "@/lib/zone";

const ZONE_PAIR: LaunchPair = {
  pair: "OALPHA/PATH.USD",
  base: "OALPHA",
  quote: "PATH.USD",
};

const ZONE_PAIRS = [ZONE_PAIR];

export default function TradePage() {
  return <TradeSurface />;
}

function TradeSurface() {
  const wallet = useWalletState();
  const account = useAccount();
  const connections = useConnections();
  const { data: walletClient } = useWalletClient();
  const signMessage = useSignMessage();
  const connectedAddress = account.address;
  const isConnected = Boolean(connectedAddress);

  // Hydration guard — wallet connection is client-only (wagmi rehydrates after
  // mount), so the server renders disconnected while the client's first paint
  // may be connected. Render a stable skeleton until mounted so SSR and the
  // first client paint match; the real branch swaps in next paint.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [pair, setPair] = React.useState<string>(ZONE_PAIR.pair);
  const [mode, setMode] = React.useState<OrderMode>("market");
  const [zoneAuthToken, setZoneAuthToken] = React.useState<Hex | null>(null);
  const [zonePathUsdBalance, setZonePathUsdBalance] = React.useState<
    bigint | null
  >(null);
  const [zoneOalphaBalance, setZoneOalphaBalance] = React.useState<
    bigint | null
  >(
    null,
  );
  const [bestBid, setBestBid] = React.useState<bigint | null>(null);
  const [bestAsk, setBestAsk] = React.useState<bigint | null>(null);
  // Resting depth at the top of book (base/OALPHA units). Used to guard market
  // orders against exceeding available liquidity (the darkpool reverts on a
  // partial fill rather than filling what it can).
  const [bestBidQty, setBestBidQty] = React.useState<bigint | null>(null);
  const [bestAskQty, setBestAskQty] = React.useState<bigint | null>(null);
  const [midpointHistoryEnabled, setMidpointHistoryEnabled] =
    React.useState(false);
  const [activity, setActivity] = React.useState(() =>
    readOmegaZoneActivity(connectedAddress),
  );
  const [liveState, setLiveState] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [liveError, setLiveError] = React.useState<string | undefined>();
  // Wallet-free public market snapshot (midpoint + chart enable). The zone
  // serves zone_getTopOfBook / zone_getMidpointHistory on the public RPC with
  // an anonymous AuthContext, so the trade surface shows the live midpoint even
  // while disconnected. The authed snapshot (when a wallet connects) refines
  // the same fields with owner context.
  const [publicMarketState, setPublicMarketState] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  // The settlement moment — the kit's Matched→Settled→Proven toast, driven by
  // the real fill produced by the most recent submit. `key` re-triggers the
  // slide-in; the timer dismisses it.
  const [toastFill, setToastFill] = React.useState<MatchToastFill | null>(null);
  const [toastKey, setToastKey] = React.useState(0);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );
  const zoneAuthTokenRef = React.useRef<Hex | null>(null);
  const zoneAuthTokenPromiseRef = React.useRef<Promise<Hex> | null>(null);
  const autoAuthAttemptedRef = React.useRef(false);

  const launchPair = ZONE_PAIRS.find((p) => p.pair === pair) ?? ZONE_PAIR;

  React.useEffect(() => {
    setActivity(readOmegaZoneActivity(connectedAddress));
  }, [connectedAddress]);

  React.useEffect(() => {
    const cachedAuthToken = readPersistedZoneRpcAuthToken(connectedAddress);
    zoneAuthTokenRef.current = cachedAuthToken;
    zoneAuthTokenPromiseRef.current = null;
    autoAuthAttemptedRef.current = false;
    setZoneAuthToken(cachedAuthToken);
  }, [connectedAddress]);

  const refreshZoneSnapshot = React.useCallback(
    async (authToken: Hex) => {
      if (!connectedAddress) return;
      // Resilient: a failing balance read resolves to null instead of throwing,
      // so it cannot push the whole snapshot into the "error" state. A live-zero
      // balance is real data; the gate decides demo-vs-live on null, not on throw.
      const settle = <T,>(p: T | Promise<T>): Promise<T | null> =>
        Promise.resolve(p).then(
          (v) => v,
          () => null,
        );
      const [pathUsdBalance, oalphaBalance] = await Promise.all([
        settle(readPrivateZonePathUsdBalance(authToken, connectedAddress)),
        settle(readPrivateZoneOalphaBalance(authToken, connectedAddress)),
      ]);
      const [bid, ask, history, ownerActivity] = await Promise.allSettled([
        readPrivateBestBid(
          authToken,
          connectedAddress,
          OMEGA_ZONE_ADDRESSES.oalpha,
        ),
        readPrivateBestAsk(
          authToken,
          connectedAddress,
          OMEGA_ZONE_ADDRESSES.oalpha,
        ),
        getZoneMidpointHistory(authToken, {
          base: OMEGA_ZONE_ADDRESSES.oalpha,
          quote: OMEGA_ZONE_ADDRESSES.pathUsd,
          interval: "1m",
          limit: 50,
        }),
        fetchOmegaZoneActivity({
          authToken,
          account: connectedAddress,
        }),
      ]);
      setZonePathUsdBalance(pathUsdBalance);
      setZoneOalphaBalance(oalphaBalance);
      const bidLive = bid.status === "fulfilled" && bid.value.price > BigInt(0);
      const askLive = ask.status === "fulfilled" && ask.value.price > BigInt(0);
      setBestBid(bidLive ? bid.value.price : null);
      setBestAsk(askLive ? ask.value.price : null);
      setBestBidQty(bidLive ? bid.value.quantity : null);
      setBestAskQty(askLive ? ask.value.quantity : null);
      setMidpointHistoryEnabled(
        history.status === "fulfilled" ? history.value.history.enabled : false,
      );
      if (ownerActivity.status === "fulfilled") {
        // The owner-activity fetch returns the COMPLETE set of resting orders
        // (zone_getMyOrders, filtered to open/partiallyFilled), so it is
        // authoritative — replace the order list rather than merge, which drops
        // optimistic place-time "pending" rows once they fill or cancel.
        setActivity(
          mergeOmegaZoneActivity(connectedAddress, ownerActivity.value, {
            ordersAuthoritative: true,
          }),
        );
      }
    },
    [connectedAddress],
  );

  const ensureZoneAuthToken = React.useCallback(
    async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    // A token is only reusable if it is present AND not within the refresh
    // buffer of expiring — the private RPC rejects an expired token with HTTP
    // 403. `forceRefresh` (used after a 403 mid-flight) discards every cached
    // copy and re-signs.
    const usable = (token: Hex | null | undefined): token is Hex =>
      Boolean(token) && !isZoneRpcAuthTokenExpired(token as Hex);

    if (forceRefresh) {
      zoneAuthTokenRef.current = null;
      zoneAuthTokenPromiseRef.current = null;
      clearPersistedZoneRpcAuthToken();
      setZoneAuthToken(null);
    } else {
      if (usable(zoneAuthTokenRef.current)) return zoneAuthTokenRef.current;
      if (usable(zoneAuthToken)) {
        zoneAuthTokenRef.current = zoneAuthToken;
        return zoneAuthToken;
      }
      if (zoneAuthTokenPromiseRef.current)
        return zoneAuthTokenPromiseRef.current;
      const cachedAuthToken = readPersistedZoneRpcAuthToken(connectedAddress);
      if (usable(cachedAuthToken)) {
        zoneAuthTokenRef.current = cachedAuthToken;
        setZoneAuthToken(cachedAuthToken);
        return cachedAuthToken;
      }
    }
    if (!connectedAddress) throw new Error("Connect Tempo Wallet first.");

    const authTokenPromise = buildZoneRpcAuthToken({
      account: connectedAddress,
      signMessage: ({ account: signerAccount, message }) =>
        signMessage.signMessageAsync({
          account: signerAccount,
          message,
        }),
      nativeSigner: getTempoNativeAuthSigner(walletClient),
    }).then((authToken) => {
      zoneAuthTokenRef.current = authToken;
      setZoneAuthToken(authToken);
      persistZoneRpcAuthToken(authToken, connectedAddress);
      return authToken;
    });

    zoneAuthTokenPromiseRef.current = authTokenPromise;
    try {
      return await authTokenPromise;
    } finally {
      zoneAuthTokenPromiseRef.current = null;
    }
    // NB: `zoneAuthToken` is intentionally NOT a dependency — this callback reads
    // the token via `zoneAuthTokenRef` (line above), so it does not need it. If it
    // were a dep, `setZoneAuthToken` firing during auth would churn this callback's
    // identity, re-trigger the live-snapshot effect mid-flight, cancel it before
    // `setLiveState("ready")`, and leave the surface stuck on "loading" (skeleton
    // fills, midpoint "—") behind the one-shot `autoAuthAttemptedRef` guard.
  }, [
    connectedAddress,
    signMessage,
    walletClient,
  ]);

  React.useEffect(() => {
    if (!connectedAddress) return;
    if (autoAuthAttemptedRef.current) return;
    autoAuthAttemptedRef.current = true;
    let cancelled = false;

    async function loadLiveSnapshot() {
      setLiveState("loading");
      setLiveError(undefined);
      try {
        const authToken = await ensureZoneAuthToken();
        await refreshZoneSnapshot(authToken);
        if (!cancelled) setLiveState("ready");
      } catch (error) {
        if (!cancelled) {
          setLiveError(getErrorMessage(error));
          setLiveState("error");
        }
      }
    }

    void loadLiveSnapshot();
    return () => {
      cancelled = true;
    };
    // Depend ONLY on the stable inputs that should (re)start a snapshot. The
    // callbacks (ensureZoneAuthToken/refreshZoneSnapshot) are excluded on
    // purpose: their identities churn the instant walletClient/signMessage
    // settle right after connect, which would re-run this effect, fire its
    // cleanup (`cancelled = true`) on the in-flight run, and skip
    // `setLiveState("ready")` even though the snapshot already succeeded —
    // pinning the surface on "loading" forever. Read from the latest closure
    // at call time, so narrowing loses nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  // Wallet-free public market poll — runs regardless of wallet so the trade
  // surface renders the LIVE midpoint + chart-enable from the zone's public
  // RPC. Fixtures remain the fallback only when these reads fail (zone
  // unreachable). The authed snapshot, when a wallet connects, sets the same
  // fields with owner context.
  React.useEffect(() => {
    let cancelled = false;
    async function loadPublicMarket() {
      setPublicMarketState((s) => (s === "ready" ? s : "loading"));
      try {
        const [book, history] = await Promise.all([
          getZonePublicTopOfBook({
            base: OMEGA_ZONE_ADDRESSES.oalpha,
            quote: OMEGA_ZONE_ADDRESSES.pathUsd,
          }),
          getZonePublicMidpointHistory({
            base: OMEGA_ZONE_ADDRESSES.oalpha,
            quote: OMEGA_ZONE_ADDRESSES.pathUsd,
            interval: "1m",
            limit: 50,
          }),
        ]);
        if (cancelled) return;
        const bidLive = Boolean(book.bid) && BigInt(book.bid!.price) > BigInt(0);
        const askLive = Boolean(book.ask) && BigInt(book.ask!.price) > BigInt(0);
        setBestBid(bidLive ? BigInt(book.bid!.price) : null);
        setBestAsk(askLive ? BigInt(book.ask!.price) : null);
        setBestBidQty(bidLive ? BigInt(book.bid!.quantity) : null);
        setBestAskQty(askLive ? BigInt(book.ask!.quantity) : null);
        setMidpointHistoryEnabled(history.history.enabled);
        setPublicMarketState("ready");
      } catch {
        if (!cancelled) setPublicMarketState("error");
      }
    }
    void loadPublicMarket();
    const iv = window.setInterval(() => void loadPublicMarket(), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
    // Stable callback set; runs once on mount and polls. No page-state gating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Authed snapshot poll — keeps balances, resting open orders, and fills
  // current while connected, so an order that fills (here or via another
  // party's match) leaves the open-orders card promptly instead of lingering
  // as a stale "pending" row. Uses the cached auth token only (never re-signs
  // on a timer — that would surprise the user with a passkey prompt); when the
  // token has expired the poll simply no-ops until the next user action.
  React.useEffect(() => {
    if (!connectedAddress) return;
    const tick = () => {
      const token = zoneAuthTokenRef.current;
      if (!token || isZoneRpcAuthTokenExpired(token)) return;
      void refreshZoneSnapshot(token).catch(() => {});
    };
    const iv = window.setInterval(tick, 8_000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  const requireWallet = React.useCallback(() => {
    if (!connectedAddress) throw new Error("Connect Tempo Wallet first.");
    return {
      address: connectedAddress,
    };
  }, [connectedAddress]);

  const getZoneTransactionSigner = React.useCallback(async () => {
    const connector = account.connector ?? connections[0]?.connector;
    const provider = connector
      ? await connector
          .getProvider({ chainId: OMEGA_ZONE_CHAIN_ID })
          .catch(() => connector.getProvider())
      : walletClient;

    if (
      !provider ||
      typeof (provider as { request?: unknown }).request !== "function"
    ) {
      throw new Error("Tempo Wallet provider is not ready for Omega Zone signing.");
    }

    return provider as ZoneTransactionSigner;
  }, [account.connector, connections, walletClient]);

  const midpoint = React.useMemo(
    () => formatMidpoint(bestBid, bestAsk),
    [bestAsk, bestBid],
  );

  const handleOrderSubmit = React.useCallback(
    async (payload: OrderFormSubmitPayload) => {
      const { address } = requireWallet();
      const signer = await getZoneTransactionSigner();

      const amount = parseTokenAmount(payload.amount, "OALPHA");

      // Price the order at the side of the book it will actually execute
      // against. A market BUY clears the resting ASK, so the spend cap
      // (maxQuoteIn) must be the ask price (+ slippage) — pricing it at the
      // midpoint under-funds the fill and the darkpool reverts. A market SELL
      // clears the resting BID, so the floor (minQuoteOut) is the bid price
      // (− slippage). Limit orders price at the user's stated price.
      let limitPrice: bigint | null = null;
      let quoteBound: bigint; // maxQuoteIn (buy) / minQuoteOut (sell) / amount*price (limit)

      if (payload.mode === "limit") {
        limitPrice = parseRawPrice(payload.price ?? "");
        quoteBound = quoteForBaseAmount(amount, limitPrice);
      } else if (payload.side === "buy") {
        if (bestAsk === null) {
          throw new Error(
            "No resting ask to trade against yet. Place a limit order instead.",
          );
        }
        if (bestAskQty !== null && amount > bestAskQty) {
          throw new Error(
            `Only ${formatTokenAmount(bestAskQty)} OALPHA is resting at the ask. Reduce the size or place a limit order.`,
          );
        }
        quoteBound = applyMarketSlippage(
          quoteForBaseAmount(amount, bestAsk),
          "up",
        );
      } else {
        if (bestBid === null) {
          throw new Error(
            "No resting bid to trade against yet. Place a limit order instead.",
          );
        }
        if (bestBidQty !== null && amount > bestBidQty) {
          throw new Error(
            `Only ${formatTokenAmount(bestBidQty)} OALPHA of bid depth is available. Reduce the size or place a limit order.`,
          );
        }
        quoteBound = applyMarketSlippage(
          quoteForBaseAmount(amount, bestBid),
          "down",
        );
      }

      const request =
        payload.mode === "limit"
          ? darkpoolPlaceOrderRequest({
              base: OMEGA_ZONE_ADDRESSES.oalpha,
              amount,
              price: limitPrice as bigint,
              isBid: payload.side === "buy",
            })
          : payload.side === "buy"
            ? darkpoolMarketBuyRequest({
                base: OMEGA_ZONE_ADDRESSES.oalpha,
                amount,
                maxQuoteIn: quoteBound,
              })
            : darkpoolMarketSellRequest({
                base: OMEGA_ZONE_ADDRESSES.oalpha,
                amount,
                minQuoteOut: quoteBound,
              });

      // One submit attempt against a given auth token: balance pre-check +
      // signed contract write. Both touch the private RPC and can 403 on an
      // expired token, so the caller retries once with a fresh token.
      const submitWith = async (token: Hex) => {
        await ensureTradeBalance({
          account: address,
          authToken: token,
          token:
            payload.side === "buy"
              ? OMEGA_ZONE_ADDRESSES.pathUsd
              : OMEGA_ZONE_ADDRESSES.oalpha,
          requiredAmount: payload.side === "buy" ? quoteBound : amount,
          tokenLabel: payload.side === "buy" ? "PATH.USD" : "OALPHA",
        });
        return signAndSendPrivateZoneContractWrite({
          authToken: token,
          signer,
          account: address,
          request,
        });
      };

      let authToken = await ensureZoneAuthToken();
      let txHash: Hex;
      try {
        txHash = await submitWith(authToken);
      } catch (error) {
        if (!isZoneAuthError(error)) throw error;
        // Auth token expired/rejected mid-flight — re-sign once and retry.
        authToken = await ensureZoneAuthToken({ forceRefresh: true });
        txHash = await submitWith(authToken);
      }

      const receipt = await waitForZoneTransactionReceipt(txHash);
      const patch = activityFromDarkpoolReceipt({
        receipt,
        fallback: payload,
        txHash,
        midpoint,
      });
      setActivity(mergeOmegaZoneActivity(address, patch));

      // Surface the settlement moment (the kit's MatchToast) for the fill the
      // submit just produced. Reflects the real fill status (matched at
      // midpoint) — limit orders that rest without a fill don't toast.
      const settledFill = patch.fills?.[0];
      if (settledFill) {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastFill({ status: settledFill.status, price: settledFill.price });
        setToastKey((k) => k + 1);
        toastTimerRef.current = setTimeout(() => setToastFill(null), 4800);
      }

      await refreshZoneSnapshot(authToken);
    },
    [
      bestAsk,
      bestAskQty,
      bestBid,
      bestBidQty,
      ensureZoneAuthToken,
      getZoneTransactionSigner,
      midpoint,
      refreshZoneSnapshot,
      requireWallet,
    ],
  );

  // Stable SSR/first-paint output (see the `mounted` hydration guard above).
  if (!mounted) {
    return (
      <PageLayout width="narrow" bare>
        <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--muted)]/20 motion-reduce:animate-none" />
      </PageLayout>
    );
  }

  // Auth gate on the REAL wallet connection (not a demo toggle). Wrong-network
  // is handled by AppShell's WrongNetworkBanner above the route.
  if (!isConnected) {
    return (
      <PageLayout width="narrow" bare>
        <DisconnectedState
          title="Connect Tempo Wallet to trade"
          description="Omega is read-only until your Tempo account is connected."
          actionLabel="Tempo wallet"
          icon={Icon.Wallet}
          onAction={() => wallet.connect("Tempo Wallet")}
        />
      </PageLayout>
    );
  }

  // Live data only — no demo fallback. The public market poll fills the
  // midpoint + book from the zone's public RPC even while the wallet is still
  // resolving its authed snapshot; when nothing has arrived yet the surface
  // shows a brief skeleton, then honest empties ("—" midpoint, blank book,
  // "No fills yet") rather than fabricated values.
  const liveFills = activity.fills.filter(
    (fill) => fill.pair === ZONE_PAIR.pair,
  );
  // Resting limit orders for this pair — anything not in a terminal state.
  const openOrders = activity.orders.filter(
    (order) =>
      order.pair === ZONE_PAIR.pair &&
      !["matched", "settled", "cancelled", "failed"].includes(order.status),
  );
  const hasLiveData =
    liveState === "ready" ||
    publicMarketState === "ready" ||
    zonePathUsdBalance !== null ||
    zoneOalphaBalance !== null ||
    liveFills.length > 0;

  const isLoading =
    !hasLiveData &&
    (liveState === "loading" ||
      publicMarketState === "loading" ||
      publicMarketState === "idle");
  const errorMessage = liveError;
  const fillsEmptyMessage =
    liveFills.length === 0
      ? "No fills yet. Your matches will appear here."
      : undefined;
  const ordersEmptyMessage =
    openOrders.length === 0
      ? "No open orders. Your resting limit orders will appear here."
      : undefined;
  const displayedMidpoint = midpoint;
  const displayedBestBid = formatRawPrice(bestBid);
  const displayedBestAsk = formatRawPrice(bestAsk);
  const fills = liveFills;
  // The trade chart's midpoint trend renders only when real history is indexed.
  const chartHistoryEnabled = midpointHistoryEnabled;

  // Order form (shared between Market + Limit) — exact same surface, only
  // the outer width + the chart/fills siblings change.
  const orderFormBlock = (
    <div className="flex flex-col gap-4">
      <PairSwitcher
        value={pair}
        onChange={setPair}
        midpoint={displayedMidpoint}
        pairs={ZONE_PAIRS}
      />
      <OrderForm
        pair={launchPair}
        mode={mode}
        onModeChange={setMode}
        midpoint={displayedMidpoint}
        availableBySide={{
          buy: formatTokenAmount(zonePathUsdBalance),
          sell: formatTokenAmount(zoneOalphaBalance),
        }}
        loading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleOrderSubmit}
      />
    </div>
  );

  // Limit-mode-only side block — chart placeholder + open orders + your fills.
  const limitSideBlock = (
    <Animate variant="enter" className="flex flex-col gap-4">
      <ChartPlaceholder
        pair={launchPair}
        midpoint={displayedMidpoint}
        bestBid={displayedBestBid}
        bestAsk={displayedBestAsk}
        historyEnabled={chartHistoryEnabled}
      />
      <YourOpenOrders
        orders={openOrders}
        loading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={ordersEmptyMessage}
      />
      <YourFills
        fills={fills}
        loading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={fillsEmptyMessage}
      />
    </Animate>
  );

  const modeSelector = (
    <div className="flex justify-center">
      <OrderModeSelector value={mode} onChange={setMode} />
    </div>
  );

  return (
    <>
      {mode === "market" ? (
      <PageLayout width="narrow" bare>
          <div className="flex flex-col gap-4">
            {modeSelector}
            {orderFormBlock}
            <YourFills
              fills={fills}
              loading={isLoading}
              errorMessage={errorMessage}
              emptyMessage={fillsEmptyMessage}
              compact
            />
          </div>
        </PageLayout>
      ) : (
        <PageLayout width="wide" bare>
          <div className="flex flex-col gap-4">
            {modeSelector}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[480px_1fr] lg:gap-8">
              <div>{orderFormBlock}</div>
              <div>{limitSideBlock}</div>
            </div>
          </div>
        </PageLayout>
      )}

      <MatchToast key={toastKey} fill={toastFill} />
    </>
  );
}

async function ensureTradeBalance({
  account,
  authToken,
  token,
  requiredAmount,
  tokenLabel,
}: {
  account: Address;
  authToken: Hex;
  token: Address;
  requiredAmount: bigint;
  tokenLabel: string;
}) {
  const currentZoneBalance = await readPrivateZoneTokenBalance(
    authToken,
    account,
    token,
  );

  if (currentZoneBalance < requiredAmount) {
    throw new Error(
      `Deposit at least ${formatTokenAmount(requiredAmount)} ${tokenLabel} to Omega Zone first.`,
    );
  }
}

function activityFromDarkpoolReceipt({
  receipt,
  fallback,
  txHash,
  midpoint,
}: {
  receipt: TransactionReceipt;
  fallback: OrderFormSubmitPayload;
  txHash: Hex;
  midpoint: string;
}): Partial<OmegaZoneActivity> {
  const orders: OrderFixture[] = [];
  const fills: FillFixture[] = [];
  const now = new Date().toISOString();

  for (const log of receipt.logs) {
    try {
      const event = decodeEventLog({
        abi: DARKPOOL_PARSED_ABI,
        data: log.data,
        topics: log.topics,
      });
      const args = event.args as Record<string, unknown>;

      if (event.eventName === "OrderPlaced") {
        const orderId = bigintArg(args.orderId);
        const amount = bigintArg(args.amount);
        const price = bigintArg(args.price);
        const isBid = Boolean(args.isBid);
        orders.push({
          id: `o-${orderId.toString()}`,
          pair: ZONE_PAIR.pair,
          side: isBid ? "buy" : "sell",
          type: "limit",
          amount: formatTokenAmount(amount),
          price: formatRawPrice(price),
          filledPercent: 0,
          status: "pending",
          submittedAt: now,
        });
      }

      if (event.eventName === "OrderFilled") {
        const orderId = bigintArg(args.orderId);
        const amount = bigintArg(args.amountFilled);
        const price = bigintArg(args.price);
        fills.push({
          id: `f-${orderId.toString()}-${log.logIndex ?? 0}`,
          orderId: `o-${orderId.toString()}`,
          pair: ZONE_PAIR.pair,
          side: fallback.side,
          amount: formatTokenAmount(amount),
          price: formatRawPrice(price),
          matchedAt: now,
          status: "matched",
          txHash,
        });
      }
    } catch {
      continue;
    }
  }

  if (orders.length === 0 && fills.length === 0) {
    if (fallback.mode === "limit") {
      orders.push({
        id: `o-${txHash.slice(2, 10)}`,
        pair: ZONE_PAIR.pair,
        side: fallback.side,
        type: "limit",
        amount: formatTokenAmount(parseTokenAmount(fallback.amount, "OALPHA")),
        price: formatRawPrice(parseRawPrice(fallback.price ?? "0")),
        filledPercent: 0,
        status: "pending",
        submittedAt: now,
      });
    } else {
      fills.push({
        id: `f-${txHash.slice(2, 10)}`,
        orderId: `o-${txHash.slice(2, 10)}`,
        pair: ZONE_PAIR.pair,
        side: fallback.side,
        amount: formatTokenAmount(parseTokenAmount(fallback.amount, "OALPHA")),
        price: midpoint,
        matchedAt: now,
        status: "matched",
        txHash,
      });
    }
  }

  return { orders, fills };
}

function bigintArg(value: unknown): bigint {
  return typeof value === "bigint" ? value : BigInt(0);
}

function formatMidpoint(bestBid: bigint | null, bestAsk: bigint | null): string {
  if (bestBid !== null && bestAsk !== null) {
    return formatRawPrice((bestBid + bestAsk) / BigInt(2));
  }
  if (bestBid !== null) return formatRawPrice(bestBid);
  if (bestAsk !== null) return formatRawPrice(bestAsk);
  return "";
}

function parseTokenAmount(value: string, label: string): bigint {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) throw new Error("Enter an amount.");
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    throw new Error(`Enter a ${label} amount with up to 6 decimals.`);
  }
  const amount = parseUnits(trimmed, 6);
  if (amount <= BigInt(0)) throw new Error("Amount must be greater than zero.");
  return amount;
}

function parseRawPrice(value: string): bigint {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) throw new Error("Enter a price.");
  if (!/^\d+(\.0{1,6})?$/.test(trimmed)) {
    throw new Error("Enter a whole-number price. Use 1 for the seeded 1:1 market.");
  }
  const price = BigInt(trimmed.split(".")[0] ?? "0");
  if (price <= BigInt(0)) throw new Error("Price must be greater than zero.");
  return price;
}

function quoteForBaseAmount(amount: bigint, price: bigint): bigint {
  return amount * price;
}

// Slippage tolerance for market orders, in basis points. The cap (buy) or floor
// (sell) is derived from the top-of-book price and padded by this much so a fill
// that walks slightly into the book — or a price that moves between preview and
// settle — still clears instead of reverting on the darkpool's exact-fill check.
const MARKET_SLIPPAGE_BPS = BigInt(100); // 1%
const BPS_DENOMINATOR = BigInt(10_000);

function applyMarketSlippage(quote: bigint, direction: "up" | "down"): bigint {
  const delta = (quote * MARKET_SLIPPAGE_BPS) / BPS_DENOMINATOR;
  return direction === "up" ? quote + delta : quote - delta;
}

function formatRawPrice(value: bigint | null): string {
  if (value === null) return "";
  return `${value.toString()}.000000`;
}

function formatTokenAmount(value: bigint | null): string {
  if (value === null) return "0.00";
  const formatted = formatUnits(value, 6);
  const [whole, fraction = ""] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cents = fraction.padEnd(2, "0").slice(0, 2);
  return `${groupedWhole}.${cents}`;
}

function getErrorMessage(error: unknown): string {
  const rawMessage =
    error instanceof Error && error.message
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (
    rawMessage.includes("421700035") &&
    rawMessage.toLowerCase().includes("chain")
  ) {
    return "Tempo Wallet rejected the Omega Zone chain. Reconnect Tempo Wallet and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Omega Zone request failed.";
}
