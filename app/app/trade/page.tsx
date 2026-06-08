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

import { AppShell } from "@/components/shell/AppShell";
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
  type MatchToastFill,
  type OrderMode,
  type OrderFormSubmitPayload,
} from "@/components/trade";
import {
  tradeFixtures,
  usePageState,
  DEMO_ZONE_PATH_USD_BALANCE,
  DEMO_ZONE_OALPHA_BALANCE,
  DEMO_ZONE_MIDPOINT,
  DEMO_ZONE_BEST_BID,
  DEMO_ZONE_BEST_ASK,
  DEMO_ZONE_FILLS,
  type LaunchPair,
} from "@/lib/fixtures";
import type { FillFixture, OrderFixture } from "@/lib/fixtures/types";
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
  getZoneMidpointHistory,
  mergeOmegaZoneActivity,
  persistZoneRpcAuthToken,
  publicZoneClient,
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
  demoMidpoint: "1.000000",
};

const ZONE_PAIRS = [ZONE_PAIR];

export default function TradePage() {
  return (
    <AppShell route="/trade" auth>
      <TradeSurface />
    </AppShell>
  );
}

function TradeSurface() {
  const state = usePageState("default");
  const fixture = tradeFixtures[state] ?? tradeFixtures.default;
  const account = useAccount();
  const connections = useConnections();
  const { data: walletClient } = useWalletClient();
  const signMessage = useSignMessage();
  const connectedAddress = account.address;

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
  const [midpointHistoryEnabled, setMidpointHistoryEnabled] =
    React.useState(false);
  const [activity, setActivity] = React.useState(() =>
    readOmegaZoneActivity(connectedAddress),
  );
  const [liveState, setLiveState] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [liveError, setLiveError] = React.useState<string | undefined>();
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
      const [pathUsdBalance, oalphaBalance] = await Promise.all([
        readPrivateZonePathUsdBalance(authToken, connectedAddress),
        readPrivateZoneOalphaBalance(authToken, connectedAddress),
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
      setBestBid(
        bid.status === "fulfilled" && bid.value.price > BigInt(0)
          ? bid.value.price
          : null,
      );
      setBestAsk(
        ask.status === "fulfilled" && ask.value.price > BigInt(0)
          ? ask.value.price
          : null,
      );
      setMidpointHistoryEnabled(
        history.status === "fulfilled" ? history.value.history.enabled : false,
      );
      if (ownerActivity.status === "fulfilled") {
        setActivity(
          mergeOmegaZoneActivity(connectedAddress, ownerActivity.value),
        );
      }
    },
    [connectedAddress],
  );

  const ensureZoneAuthToken = React.useCallback(async () => {
    if (zoneAuthTokenRef.current) return zoneAuthTokenRef.current;
    if (zoneAuthToken) {
      zoneAuthTokenRef.current = zoneAuthToken;
      return zoneAuthToken;
    }
    if (zoneAuthTokenPromiseRef.current) return zoneAuthTokenPromiseRef.current;
    if (!connectedAddress) throw new Error("Connect Tempo Wallet first.");
    const cachedAuthToken = readPersistedZoneRpcAuthToken(connectedAddress);
    if (cachedAuthToken) {
      zoneAuthTokenRef.current = cachedAuthToken;
      setZoneAuthToken(cachedAuthToken);
      return cachedAuthToken;
    }

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
  }, [
    connectedAddress,
    signMessage,
    walletClient,
    zoneAuthToken,
  ]);

  React.useEffect(() => {
    if (!connectedAddress || state !== "default") return;
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
  }, [connectedAddress, ensureZoneAuthToken, refreshZoneSnapshot, state]);

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
      const authToken = await ensureZoneAuthToken();
      const signer = await getZoneTransactionSigner();

      const amount = parseTokenAmount(payload.amount, "OALPHA");
      if (payload.mode === "market" && !midpoint) {
        throw new Error("No zone midpoint is available yet. Use a limit order.");
      }
      const price =
        payload.mode === "limit"
          ? parseRawPrice(payload.price ?? "")
          : parseRawPrice(midpoint);
      const quoteAmount = quoteForBaseAmount(amount, price);

      await ensureTradeBalance({
        account: address,
        authToken,
        token:
          payload.side === "buy"
            ? OMEGA_ZONE_ADDRESSES.pathUsd
            : OMEGA_ZONE_ADDRESSES.oalpha,
        requiredAmount: payload.side === "buy" ? quoteAmount : amount,
        tokenLabel: payload.side === "buy" ? "PATH.USD" : "OALPHA",
      });

      const txHash =
        payload.mode === "limit"
          ? await signAndSendPrivateZoneContractWrite({
              authToken,
              signer,
              account: address,
              request: darkpoolPlaceOrderRequest({
                base: OMEGA_ZONE_ADDRESSES.oalpha,
                amount,
                price,
                isBid: payload.side === "buy",
              }),
            })
          : payload.side === "buy"
            ? await signAndSendPrivateZoneContractWrite({
                authToken,
                signer,
                account: address,
                request: darkpoolMarketBuyRequest({
                  base: OMEGA_ZONE_ADDRESSES.oalpha,
                  amount,
                  maxQuoteIn: quoteAmount,
                }),
              })
            : await signAndSendPrivateZoneContractWrite({
                authToken,
                signer,
                account: address,
                request: darkpoolMarketSellRequest({
                  base: OMEGA_ZONE_ADDRESSES.oalpha,
                  amount,
                  minQuoteOut: quoteAmount,
                }),
              });

      const receipt = await publicZoneClient.waitForTransactionReceipt({
        hash: txHash,
      });
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
      ensureZoneAuthToken,
      getZoneTransactionSigner,
      midpoint,
      refreshZoneSnapshot,
      requireWallet,
    ],
  );

  // Page-state-driven gate surfaces. Wallet-state-driven gates live in
  // AppShell — both paths must render cleanly for review.
  if (state === "disconnected") {
    return (
      <PageLayout width="narrow" bare>
          <DisconnectedState
          title="Connect Tempo Wallet to trade"
          description="Omega is read-only until your Tempo account is connected."
          actionLabel="Tempo wallet"
          icon={Icon.Wallet}
          onAction={() => {}}
        />
      </PageLayout>
    );
  }

  if (state === "wrong-network") {
    return (
      <PageLayout width="narrow" bare>
          <DisconnectedState
          title="Unsupported network"
          description="Switch to Omega Zone to access trading."
          actionLabel="Switch network"
          icon={Icon.Warning}
          onAction={() => {}}
        />
      </PageLayout>
    );
  }

  // With no backend running, the live zone snapshot is empty. The default view
  // shows the populated OALPHA/PATH.USD demo fixture whenever no live data has
  // arrived — including while a load is still in flight — so the surface is
  // never empty or stuck on a skeleton. A successful live snapshot (`ready`, or
  // any non-null balance / own fill) always wins and swaps the real values in.
  // The `?state=loading|skeleton|error` review toggles still force those states.
  const liveFills = activity.fills.filter(
    (fill) => fill.pair === ZONE_PAIR.pair,
  );
  const hasLiveData =
    liveState === "ready" ||
    zonePathUsdBalance !== null ||
    zoneOalphaBalance !== null ||
    liveFills.length > 0;
  const useDemoData = state === "default" && !hasLiveData;

  const isLoading =
    state === "loading" ||
    state === "skeleton" ||
    (state === "default" &&
      !useDemoData &&
      liveState === "loading" &&
      (zonePathUsdBalance === null || zoneOalphaBalance === null));
  const errorMessage =
    state === "error"
      ? fixture.error?.message
      : useDemoData
        ? undefined
        : liveError;
  const fillsEmptyMessage =
    state === "empty"
      ? "No fills yet. Your matches will appear here."
      : undefined;
  const displayedMidpoint =
    state === "loading" || state === "skeleton" || state === "error"
      ? ""
      : useDemoData
        ? DEMO_ZONE_MIDPOINT
        : midpoint;
  const displayedBestBid =
    state === "loading" || state === "skeleton" || state === "error"
      ? ""
      : useDemoData
        ? DEMO_ZONE_BEST_BID
        : formatRawPrice(bestBid);
  const displayedBestAsk =
    state === "loading" || state === "skeleton" || state === "error"
      ? ""
      : useDemoData
        ? DEMO_ZONE_BEST_ASK
        : formatRawPrice(bestAsk);
  const fills = useDemoData
    ? DEMO_ZONE_FILLS
    : state === "default"
      ? liveFills
      : [];
  // The trade chart's midpoint trend renders only when real history is indexed;
  // in demo mode we plot the kit's illustrative trend instead.
  const chartHistoryEnabled = useDemoData ? true : midpointHistoryEnabled;

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
          buy: formatTokenAmount(
            useDemoData ? DEMO_ZONE_PATH_USD_BALANCE : zonePathUsdBalance,
          ),
          sell: formatTokenAmount(
            useDemoData ? DEMO_ZONE_OALPHA_BALANCE : zoneOalphaBalance,
          ),
        }}
        loading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleOrderSubmit}
      />
    </div>
  );

  // Limit-mode-only side block — chart placeholder + your fills.
  const limitSideBlock = (
    <Animate variant="enter" className="flex flex-col gap-4">
      <ChartPlaceholder
        pair={launchPair}
        midpoint={displayedMidpoint}
        bestBid={displayedBestBid}
        bestAsk={displayedBestAsk}
        historyEnabled={chartHistoryEnabled}
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
