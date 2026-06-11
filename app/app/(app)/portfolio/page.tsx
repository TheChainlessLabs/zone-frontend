"use client";

/**
 * /portfolio — production trader dashboard.
 *
 * The user's personal financial dashboard: total value, positions,
 * fills, transfers, and onchain deposit/withdrawal log.
 *
 * Privacy contract (omega-docs#5 PRD): only the connected user's own
 * state ever lands on this page — no counterparty IDs, no global feed.
 *
 * Presentation is the Omega Markets design-kit Portfolio surface
 * (`PortfolioView`): value lede + 30-day trend, the Holdings
 * centerpiece, the Activity stream, and a right rail carrying the
 * equal-weight Deposit/Withdraw actions, an execution-quality card,
 * and cancelable open orders — under Overview / Tokens / Orders /
 * Activity tabs. This page owns the data + behaviour (wagmi/zone
 * wiring, EIP-712 signing, the deposit/withdraw modals) and feeds the
 * live OALPHA / PATH.USD fixture into the ported view.
 *
 * State coverage (driven by `?state=`):
 *   default · empty · loading · error · skeleton · disconnected.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatUnits, isAddress, parseUnits, type Address, type Hex } from "viem";
import {
  useAccount,
  useConnections,
  useSignMessage,
  useSwitchChain,
  useWalletClient,
} from "wagmi";

import { PageLayout } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import {
  DepositModal,
  type DepositState,
} from "@/components/modals/deposit-modal";
import {
  WithdrawModal,
  type WithdrawState,
} from "@/components/modals/withdraw-modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { useWalletState } from "@/components/shell/WalletStateProvider";
import type {
  BalanceFixture,
  DepositFixture,
  PortfolioFixture,
  WithdrawalFixture,
} from "@/lib/view-types";

/**
 * Honest empty portfolio — a connected wallet with no zone balances renders
 * this (all zeros), never a fabricated demo. There is NO populated showcase
 * fixture anymore: the surface is live data or honest zeros/skeleton/error.
 */
const EMPTY_PORTFOLIO: PortfolioFixture = {
  totalValueUSD: "0.00",
  balances: [],
  openOrders: [],
  recentFills: [],
  deposits: [],
  withdrawals: [],
};
import {
  OMEGA_TEMPO_L1_CHAIN_ID,
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  TIP20_PARSED_ABI,
  approvePathUsdToPortalRequest,
  buildZoneRpcAuthToken,
  depositPathUsdToZoneRequest,
  fetchOmegaZoneActivity,
  getTempoNativeAuthSigner,
  getZoneInfo,
  getZoneMarketConfig,
  getZoneDepositStatus,
  getZoneWithdrawalStatus,
  mergeOmegaZoneActivity,
  persistZoneRpcAuthToken,
  isZoneRpcAuthTokenExpired,
  waitForZoneTransactionReceipt,
  readPersistedZoneRpcAuthToken,
  readOmegaZoneActivity,
  readPrivateDarkpoolBalance,
  readPrivateZoneTokenBalance,
  readPrivateZoneOalphaBalance,
  readPrivateZonePathUsdBalance,
  signAndSendPrivateZoneContractWrite,
  tempoL1Client,
  type ZoneTransactionSigner,
  zoneWithdrawalStatusToFixture,
  zoneOutboxRequestWithdrawal,
} from "@/lib/zone";

import { PortfolioView, PortfolioSkeleton } from "./_components/PortfolioView";

interface WithdrawFormValues {
  recipient: string;
  amount: string;
}

interface ZonePortfolioToken {
  token: BalanceFixture["token"];
  address: Address;
  decimals: number;
}

interface ZonePortfolioTokenBalance extends ZonePortfolioToken {
  available: bigint;
  locked: bigint;
}

export default function PortfolioPage() {
  const router = useRouter();
  const wallet = useWalletState();
  const account = useAccount();
  const connections = useConnections();
  const { data: walletClient } = useWalletClient();
  const signMessage = useSignMessage();
  const switchChain = useSwitchChain();
  const connectedAddress = account.address;

  // Hydration guard. The wallet connection is client-only (wagmi rehydrates +
  // the dev connector auto-reconnects only after mount), so the server always
  // renders "disconnected" while the client's first paint may already be
  // connected — a different top-level tree, which React flags as a hydration
  // mismatch. Render a stable skeleton until mounted so SSR and the first
  // client paint are identical; the real wallet-derived branch swaps in next.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [depositOpen, setDepositOpen] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);
  const [depositState, setDepositState] = React.useState<DepositState>("idle");
  const [withdrawState, setWithdrawState] = React.useState<WithdrawState>("idle");
  const [depositAmount, setDepositAmount] = React.useState("");
  const [permitSigned, setPermitSigned] = React.useState(false);
  const [depositTxHash, setDepositTxHash] = React.useState<Hex | undefined>();
  const [withdrawTxHash, setWithdrawTxHash] = React.useState<Hex | undefined>();
  const [depositError, setDepositError] = React.useState<string | undefined>();
  const [withdrawError, setWithdrawError] = React.useState<string | undefined>();
  const [zoneAuthToken, setZoneAuthToken] = React.useState<Hex | null>(null);
  const [l1PathUsdBalance, setL1PathUsdBalance] = React.useState<bigint | null>(
    null,
  );
  const [zonePathUsdBalance, setZonePathUsdBalance] =
    React.useState<bigint | null>(null);
  const [darkpoolPathUsdBalance, setDarkpoolPathUsdBalance] =
    React.useState<bigint | null>(null);
  const [zoneOalphaBalance, setZoneOalphaBalance] =
    React.useState<bigint | null>(null);
  const [darkpoolOalphaBalance, setDarkpoolOalphaBalance] =
    React.useState<bigint | null>(null);
  const [zoneTokenBalances, setZoneTokenBalances] =
    React.useState<ZonePortfolioTokenBalance[] | null>(null);
  const [activity, setActivity] = React.useState(() =>
    readOmegaZoneActivity(connectedAddress),
  );
  const [liveState, setLiveState] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [liveError, setLiveError] = React.useState<string | undefined>();
  const [lastWithdrawForm, setLastWithdrawForm] =
    React.useState<WithdrawFormValues | null>(null);
  const zoneAuthTokenRef = React.useRef<Hex | null>(null);
  const zoneAuthTokenPromiseRef = React.useRef<Promise<Hex> | null>(null);
  const autoAuthAttemptedRef = React.useRef(false);

  React.useEffect(() => {
    const cachedAuthToken = readPersistedZoneRpcAuthToken(connectedAddress);
    zoneAuthTokenRef.current = cachedAuthToken;
    zoneAuthTokenPromiseRef.current = null;
    autoAuthAttemptedRef.current = false;
    setZoneAuthToken(cachedAuthToken);
    setZoneTokenBalances(null);
    setZonePathUsdBalance(null);
    setDarkpoolPathUsdBalance(null);
    setZoneOalphaBalance(null);
    setDarkpoolOalphaBalance(null);
  }, [connectedAddress]);

  const refreshL1Balance = React.useCallback(async () => {
    if (!connectedAddress) return;
    try {
      const balance = await tempoL1Client.readContract({
        address: OMEGA_ZONE_ADDRESSES.pathUsd,
        abi: TIP20_PARSED_ABI,
        functionName: "balanceOf",
        args: [connectedAddress],
      });
      setL1PathUsdBalance(balance as bigint);
    } catch {
      setL1PathUsdBalance(null);
    }
  }, [connectedAddress]);

  const refreshZoneBalances = React.useCallback(
    async (authToken: Hex) => {
      if (!connectedAddress) return;
      // Each read is resilient: a missing/zero/erroring balance resolves to null
      // instead of throwing, so one asset the wallet has no position in (e.g. an
      // un-traded token or empty darkpool escrow) cannot tank the whole live
      // snapshot and force the demo fallback. A live-zero balance is real data.
      const settle = <T,>(p: T | Promise<T>): Promise<T | null> =>
        Promise.resolve(p).then(
          (v) => v,
          () => null,
        );
      const tokenBalances = await settle(
        fetchZonePortfolioTokenBalances(authToken, connectedAddress),
      ).then((v) => v ?? []);
      const byAddress = new Map(
        tokenBalances.map((balance) => [
          balance.address.toLowerCase(),
          balance,
        ]),
      );
      const pathUsdBalance = byAddress.get(
        OMEGA_ZONE_ADDRESSES.pathUsd.toLowerCase(),
      );
      const oalphaBalance = byAddress.get(
        OMEGA_ZONE_ADDRESSES.oalpha.toLowerCase(),
      );
      const [
        pathUsdWalletBalance,
        pathUsdDarkpoolBalance,
        oalphaWalletBalance,
        oalphaDarkpoolBalance,
      ] = await Promise.all([
        settle(
          pathUsdBalance?.available ??
            readPrivateZonePathUsdBalance(authToken, connectedAddress),
        ),
        settle(
          pathUsdBalance?.locked ??
            readPrivateDarkpoolBalance(authToken, connectedAddress),
        ),
        settle(
          oalphaBalance?.available ??
            readPrivateZoneOalphaBalance(authToken, connectedAddress),
        ),
        settle(
          oalphaBalance?.locked ??
            readPrivateDarkpoolBalance(
              authToken,
              connectedAddress,
              OMEGA_ZONE_ADDRESSES.oalpha,
            ),
        ),
      ]);
      setZoneTokenBalances(tokenBalances);
      setZonePathUsdBalance(pathUsdWalletBalance);
      setDarkpoolPathUsdBalance(pathUsdDarkpoolBalance);
      setZoneOalphaBalance(oalphaWalletBalance);
      setDarkpoolOalphaBalance(oalphaDarkpoolBalance);
    },
    [connectedAddress],
  );

  const refreshZoneActivity = React.useCallback(
    async (authToken: Hex) => {
      if (!connectedAddress) return;
      const nextActivity = await fetchOmegaZoneActivity({
        authToken,
        account: connectedAddress,
      });
      // Authoritative resting-order set (zone_getMyOrders) — replace, don't
      // merge, so filled/cancelled orders drop out instead of lingering.
      setActivity(
        mergeOmegaZoneActivity(connectedAddress, nextActivity, {
          ordersAuthoritative: true,
        }),
      );
    },
    [connectedAddress],
  );

  React.useEffect(() => {
    void refreshL1Balance();
  }, [refreshL1Balance]);

  React.useEffect(() => {
    setActivity(readOmegaZoneActivity(connectedAddress));
  }, [connectedAddress]);

  const requireWallet = React.useCallback(() => {
    if (!connectedAddress) throw new Error("Connect Tempo Wallet first.");
    if (!walletClient) throw new Error("Tempo Wallet is not ready yet.");
    return {
      address: connectedAddress,
      walletClient,
    };
  }, [connectedAddress, walletClient]);

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
    // NB: `zoneAuthToken` is intentionally NOT a dependency. This callback reads
    // the token via `zoneAuthTokenRef`/the cache, so it does not need it — and
    // including it churns this callback's identity the moment `setZoneAuthToken`
    // fires during auth, which re-triggered the live-snapshot effect mid-flight,
    // cancelled it before `setLiveState("ready")`, and left the page stuck on
    // "loading" (→ demo) forever behind the one-shot guard.
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
        // The balances read is the demo-vs-live signal (`hasLiveData` checks it),
        // so gate "ready" on it alone. Secondary reads (L1 balance, activity) run
        // in the background — a slow/hanging/failing activity feed must never keep
        // the surface stuck on "loading" (and thus on the demo fallback) when the
        // wallet's real balances already resolved.
        await refreshZoneBalances(authToken);
        if (!cancelled) setLiveState("ready");
        void refreshL1Balance().catch(() => {});
        void refreshZoneActivity(authToken).catch(() => {});
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
    // Depend ONLY on the stable inputs that should (re)start a snapshot:
    // the connected address and the demo page-state. The callbacks
    // (ensureZoneAuthToken/refreshZoneBalances/…) are intentionally excluded —
    // their identities churn the instant `walletClient`/`signMessage` settle
    // right after connect, which would re-run this effect, fire its cleanup
    // (`cancelled = true`) on the in-flight run, and skip `setLiveState("ready")`
    // even though the balance read already succeeded — pinning the surface on
    // the loading skeleton (→ demo fallback) forever. They're read at call time
    // from the latest closure, so narrowing the deps loses nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  // Live refresh — poll balances, holdings, and resting orders while connected
  // so the portfolio reflects fills/deposits/withdrawals without a manual
  // reload. Uses the cached auth token only (never re-signs on a timer); when
  // the token has expired the poll no-ops until the next user action.
  React.useEffect(() => {
    if (!connectedAddress) return;
    const tick = () => {
      const token = zoneAuthTokenRef.current;
      if (!token || isZoneRpcAuthTokenExpired(token)) return;
      void refreshZoneBalances(token).catch(() => {});
      void refreshZoneActivity(token).catch(() => {});
      void refreshL1Balance().catch(() => {});
    };
    const iv = window.setInterval(tick, 8_000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  const ensureChain = React.useCallback(
    async (chainId: number) => {
      if (account.chainId === chainId) return;
      await switchChain.switchChainAsync({ chainId });
    },
    [account.chainId, switchChain],
  );

  const handleSignPermit = React.useCallback(async () => {
    setDepositError(undefined);
    try {
      const { address, walletClient: client } = requireWallet();
      const amount = parsePathUsdAmount(depositAmount);

      await ensureChain(OMEGA_TEMPO_L1_CHAIN_ID);
      setDepositState("approving");
      const txHash = await client.writeContract({
        account: address,
        ...approvePathUsdToPortalRequest(amount),
      });
      setDepositTxHash(txHash);
      await tempoL1Client.waitForTransactionReceipt({ hash: txHash });
      setPermitSigned(true);
      setDepositState("idle");
      await refreshL1Balance();
    } catch (error) {
      setDepositError(getErrorMessage(error));
      setDepositState("failed");
    }
  }, [depositAmount, ensureChain, refreshL1Balance, requireWallet]);

  const handleSignDeposit = React.useCallback(async () => {
    setDepositError(undefined);
    try {
      const { address, walletClient: client } = requireWallet();
      const amount = parsePathUsdAmount(depositAmount);
      const authToken = await ensureZoneAuthToken();

      await ensureChain(OMEGA_TEMPO_L1_CHAIN_ID);
      setDepositState("depositing");
      const txHash = await client.writeContract({
        account: address,
        ...depositPathUsdToZoneRequest({
          to: address,
          amount,
        }),
      });
      setDepositTxHash(txHash);

      setDepositState("pending");
      const receipt = await tempoL1Client.waitForTransactionReceipt({
        hash: txHash,
      });
      await waitForZoneDeposit(authToken, receipt.blockNumber);
      const deposit: DepositFixture = {
        id: `d-${txHash.slice(2, 10)}`,
        token: "PATH.USD",
        amount: formatPathUsdAmount(amount),
        status: "settled",
        initiatedAt: new Date().toISOString(),
        txHash,
      };
      setActivity(mergeOmegaZoneActivity(address, { deposits: [deposit] }));
      await Promise.all([
        refreshL1Balance(),
        refreshZoneBalances(authToken),
        refreshZoneActivity(authToken),
      ]);
      setDepositState("success");
    } catch (error) {
      setDepositError(getErrorMessage(error));
      setDepositState("failed");
    }
  }, [
    depositAmount,
    ensureChain,
    ensureZoneAuthToken,
    refreshL1Balance,
    refreshZoneActivity,
    refreshZoneBalances,
    requireWallet,
  ]);

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

  const handleDepositRetry = React.useCallback(() => {
    if (permitSigned) {
      void handleSignDeposit();
    } else {
      void handleSignPermit();
    }
  }, [handleSignDeposit, handleSignPermit, permitSigned]);

  const handleWithdraw = React.useCallback(
    async (values: WithdrawFormValues) => {
      setLastWithdrawForm(values);
      setWithdrawError(undefined);
      try {
        const { address } = requireWallet();
        if (!isAddress(values.recipient)) {
          throw new Error("Invalid recipient address.");
        }
        const amount = parsePathUsdAmount(values.amount);
        const authToken = await ensureZoneAuthToken();

        const signer = await getZoneTransactionSigner();
        setWithdrawState("signing");
        const txHash = await signAndSendPrivateZoneContractWrite({
          authToken,
          signer,
          account: address,
          request: zoneOutboxRequestWithdrawal({
            to: values.recipient,
            amount,
            gasLimit: BigInt(250_000),
            fallbackRecipient: values.recipient,
          }),
        });
        setWithdrawTxHash(txHash);

        setWithdrawState("pending");
        await waitForZoneTransactionReceipt(txHash);
        const withdrawalStatus = await pollZoneWithdrawalStatus(authToken, txHash);
        const withdrawal = withdrawalStatus
          ? zoneWithdrawalStatusToFixture(withdrawalStatus)
          : ({
              id: `w-${txHash.slice(2, 10)}`,
              token: "PATH.USD",
              amount: formatPathUsdAmount(amount),
              status: "pending",
              initiatedAt: new Date().toISOString(),
              txHash,
            } satisfies WithdrawalFixture);
        setActivity(mergeOmegaZoneActivity(address, { withdrawals: [withdrawal] }));
        await Promise.all([
          refreshZoneBalances(authToken),
          refreshZoneActivity(authToken),
        ]);
        setWithdrawState("success");
      } catch (error) {
        setWithdrawError(getErrorMessage(error));
        setWithdrawState("failed");
      }
    },
    [
      ensureZoneAuthToken,
      getZoneTransactionSigner,
      refreshZoneActivity,
      refreshZoneBalances,
      requireWallet,
    ],
  );

  const handleWithdrawRetry = React.useCallback(() => {
    if (!lastWithdrawForm) {
      setWithdrawState("idle");
      return;
    }
    void handleWithdraw(lastWithdrawForm);
  }, [handleWithdraw, lastWithdrawForm]);

  const closeDeposit = React.useCallback(() => {
    setDepositOpen(false);
    setDepositState("idle");
    setPermitSigned(false);
    setDepositError(undefined);
  }, []);

  const closeWithdraw = React.useCallback(() => {
    setWithdrawOpen(false);
    setWithdrawState("idle");
    setWithdrawError(undefined);
  }, []);

  const livePortfolio = React.useMemo(
    () =>
      buildOmegaZonePortfolioFixture({
        tokenBalances: zoneTokenBalances,
        zonePathUsdBalance,
        darkpoolPathUsdBalance,
        zoneOalphaBalance,
        darkpoolOalphaBalance,
        activity,
      }),
    [
      activity,
      darkpoolOalphaBalance,
      darkpoolPathUsdBalance,
      zoneOalphaBalance,
      zonePathUsdBalance,
      zoneTokenBalances,
    ],
  );
  // Live data is only "present" once the snapshot resolved AND the wallet
  // returned at least one balance. There is NO demo fallback anymore: a
  // connected wallet renders live data, a skeleton while it loads, an error
  // band if the read fails, or honest zeros (EMPTY_PORTFOLIO) — never
  // fabricated holdings. A disconnected wallet gets the connect prompt below.
  const isConnected = Boolean(connectedAddress);
  const hasLiveData =
    liveState === "ready" &&
    (zonePathUsdBalance !== null ||
      zoneOalphaBalance !== null ||
      (zoneTokenBalances?.length ?? 0) > 0);
  const data = hasLiveData ? livePortfolio : EMPTY_PORTFOLIO;
  const isLoading = liveState === "idle" || liveState === "loading";
  const isError = liveState === "error";
  const errorMessage = liveError ?? "Portfolio unavailable.";

  // Stable SSR/first-paint output (see the `mounted` hydration guard above).
  if (!mounted) {
    return (
      <PageLayout width="wide" bare>
        <PortfolioSkeleton />
      </PageLayout>
    );
  }

  // Auth gate on the REAL wallet connection (not a demo toggle). Placed after
  // all hooks so hook order stays stable across connect/disconnect.
  if (!isConnected) {
    return (
      <DisconnectedState
        title="Portfolio is private."
        description="Connect Tempo Wallet to see your balances, positions, and history."
        onAction={() => wallet.connect("Tempo Wallet")}
      />
    );
  }

  return (
    <>
      <PageLayout width="wide" bare>
        {isError ? <ErrorBand message={errorMessage} /> : null}

        {isLoading || isError ? (
          <PortfolioSkeleton />
        ) : (
          <PortfolioView
            fixture={data}
            onDeposit={() => setDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
            onMore={() => router.push("/account")}
          />
        )}
      </PageLayout>

      <DepositModal
        open={depositOpen}
        onClose={closeDeposit}
        state={depositState}
        amount={depositAmount}
        walletBalance={formatPathUsdAmount(l1PathUsdBalance)}
        permitSigned={permitSigned}
        txHash={depositTxHash}
        errorMessage={depositError}
        onAmountChange={(next) => {
          setDepositAmount(next);
          setPermitSigned(false);
          setDepositError(undefined);
          if (depositState === "failed") setDepositState("idle");
        }}
        onSignPermit={() => void handleSignPermit()}
        onSignDeposit={() => void handleSignDeposit()}
        onRetry={handleDepositRetry}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={closeWithdraw}
        state={withdrawState}
        available={formatPathUsdAmount(zonePathUsdBalance)}
        txHash={withdrawTxHash}
        errorMessage={withdrawError}
        onSubmit={(values) => void handleWithdraw(values)}
        onRetry={handleWithdrawRetry}
      />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Error band — functional retry affordance shown above the skeleton when     */
/*  the live snapshot fails. The loading/error skeleton itself is the kit's     */
/*  `PortfolioSkeleton`, imported from ./_components/PortfolioView.            */
/* ────────────────────────────────────────────────────────────────────────── */

function ErrorBand({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-[var(--destructive)] md:items-center"
    >
      <div className="flex items-start gap-2 text-xs md:items-center">
        <Icon.Warning size={14} aria-hidden className="mt-0.5 shrink-0 md:mt-0" />
        <span className="leading-relaxed">{message}</span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {}}
        className="min-h-[44px] md:min-h-0"
      >
        Retry
      </Button>
    </div>
  );
}

function parsePathUsdAmount(value: string): bigint {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) throw new Error("Enter an amount.");
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    throw new Error("Enter a PATH.USD amount with up to 6 decimals.");
  }
  const amount = parseUnits(trimmed, 6);
  if (amount <= BigInt(0)) throw new Error("Amount must be greater than zero.");
  return amount;
}

function buildOmegaZonePortfolioFixture({
  tokenBalances,
  zonePathUsdBalance,
  darkpoolPathUsdBalance,
  zoneOalphaBalance,
  darkpoolOalphaBalance,
  activity,
}: {
  tokenBalances: ZonePortfolioTokenBalance[] | null;
  zonePathUsdBalance: bigint | null;
  darkpoolPathUsdBalance: bigint | null;
  zoneOalphaBalance: bigint | null;
  darkpoolOalphaBalance: bigint | null;
  activity: {
    orders: PortfolioFixture["openOrders"];
    fills: PortfolioFixture["recentFills"];
    deposits: PortfolioFixture["deposits"];
    withdrawals: PortfolioFixture["withdrawals"];
  };
}): PortfolioFixture {
  if (tokenBalances?.length) {
    const balances = tokenBalances.map((balance) => {
      const total = balance.available + balance.locked;
      return {
        token: balance.token,
        available: formatTokenAmount(balance.available, balance.decimals),
        locked: formatTokenAmount(balance.locked, balance.decimals),
        total: formatTokenAmount(total, balance.decimals),
      };
    });
    const total = tokenBalances.reduce(
      (sum, balance) =>
        sum +
        normalizeTokenAmountToPathUsdDecimals(
          balance.available + balance.locked,
          balance.decimals,
        ),
      BigInt(0),
    );

    return {
      totalValueUSD: formatPathUsdAmount(total),
      balances,
      openOrders: activity.orders,
      recentFills: activity.fills,
      deposits: activity.deposits,
      withdrawals: activity.withdrawals,
    };
  }

  const pathUsdAvailable = zonePathUsdBalance ?? BigInt(0);
  const pathUsdLocked = darkpoolPathUsdBalance ?? BigInt(0);
  const pathUsdTotal = pathUsdAvailable + pathUsdLocked;
  const oalphaAvailable = zoneOalphaBalance ?? BigInt(0);
  const oalphaLocked = darkpoolOalphaBalance ?? BigInt(0);
  const oalphaTotal = oalphaAvailable + oalphaLocked;
  const total = pathUsdTotal + oalphaTotal;

  return {
    totalValueUSD: formatPathUsdAmount(total),
    balances: [
      {
        token: "PATH.USD",
        available: formatPathUsdAmount(pathUsdAvailable),
        locked: formatPathUsdAmount(pathUsdLocked),
        total: formatPathUsdAmount(pathUsdTotal),
      },
      {
        token: "OALPHA",
        available: formatPathUsdAmount(oalphaAvailable),
        locked: formatPathUsdAmount(oalphaLocked),
        total: formatPathUsdAmount(oalphaTotal),
      },
    ],
    openOrders: activity.orders,
    recentFills: activity.fills,
    deposits: activity.deposits,
    withdrawals: activity.withdrawals,
  };
}

async function fetchZonePortfolioTokenBalances(
  authToken: Hex,
  account: Address,
): Promise<ZonePortfolioTokenBalance[]> {
  const tokens = await fetchZonePortfolioTokens(authToken);
  return Promise.all(
    tokens.map(async (token) => {
      const [available, locked] = await Promise.all([
        readPrivateZoneTokenBalance(authToken, account, token.address),
        readPrivateDarkpoolBalance(authToken, account, token.address),
      ]);
      return {
        ...token,
        available,
        locked,
      };
    }),
  );
}

async function fetchZonePortfolioTokens(
  authToken: Hex,
): Promise<ZonePortfolioToken[]> {
  const [zoneInfo, marketConfig] = await Promise.all([
    getZoneInfo(authToken),
    getZoneMarketConfig(authToken),
  ]);
  const tokensByAddress = new Map<string, ZonePortfolioToken>();

  for (const market of marketConfig.markets) {
    for (const token of [market.quote, market.base]) {
      const symbol = toPortfolioTokenSymbol(token.symbol);
      if (!symbol) continue;
      tokensByAddress.set(token.address.toLowerCase(), {
        token: symbol,
        address: token.address,
        decimals: token.decimals,
      });
    }
  }

  const fallbackTokens = [
    {
      token: "PATH.USD",
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      decimals: 6,
    },
    {
      token: "OALPHA",
      address: OMEGA_ZONE_ADDRESSES.oalpha,
      decimals: 6,
    },
  ] satisfies ZonePortfolioToken[];

  for (const token of fallbackTokens) {
    if (
      zoneInfo.zoneTokens.some(
        (address) => address.toLowerCase() === token.address.toLowerCase(),
      )
    ) {
      tokensByAddress.set(token.address.toLowerCase(), token);
    }
  }

  return Array.from(tokensByAddress.values()).sort((a, b) => {
    if (a.token === "PATH.USD") return -1;
    if (b.token === "PATH.USD") return 1;
    return a.token.localeCompare(b.token);
  });
}

function toPortfolioTokenSymbol(symbol: string): BalanceFixture["token"] | null {
  const known = [
    "USDC",
    "EURC",
    "USDT",
    "ETH",
    "BTC",
    "PATH.USD",
    "OALPHA",
  ] satisfies BalanceFixture["token"][];
  return known.find((token) => token === symbol) ?? null;
}

function formatPathUsdAmount(value: bigint | null): string {
  if (value === null) return "0.00";
  return formatTokenAmount(value, 6);
}

function formatTokenAmount(value: bigint, decimals: number): string {
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cents = fraction.padEnd(2, "0").slice(0, 2);
  return `${groupedWhole}.${cents}`;
}

function normalizeTokenAmountToPathUsdDecimals(
  value: bigint,
  decimals: number,
): bigint {
  if (decimals === 6) return value;
  if (decimals > 6) return value / (BigInt(10) ** BigInt(decimals - 6));
  return value * (BigInt(10) ** BigInt(6 - decimals));
}

async function waitForZoneDeposit(authToken: Hex, tempoBlockNumber: bigint) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const status = await getZoneDepositStatus(authToken, tempoBlockNumber);
    if (
      status.processed ||
      status.deposits.some((deposit) => deposit.status === "processed")
    ) {
      return;
    }
    await delay(2000);
  }
  throw new Error("Deposit is still pending in Omega Zone. Refresh in a moment.");
}

async function pollZoneWithdrawalStatus(authToken: Hex, txHash: Hex) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const status = await getZoneWithdrawalStatus(authToken, txHash);
      if (
        status.status === "processed" ||
        status.status === "failed" ||
        status.status === "bounced"
      ) {
        return status;
      }
      if (attempt >= 2) return status;
    } catch {
      if (attempt >= 2) return null;
    }
    await delay(2000);
  }
  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Omega Zone request failed.";
}
