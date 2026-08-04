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
 * live ALPHAUSD / PATH.USD fixture into the ported view.
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
  useSwitchChain,
  useWalletClient,
} from "wagmi";

import { PageLayout } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import {
  DepositModal,
  type DepositState,
  type DepositToken,
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
  OrderFixture,
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
  approveTokenToPortalRequest,
  bufferTempoGasEstimate,
  cancelPrivateZoneOrder,
  depositTokenToZoneRequest,
  estimatePrivateZoneContractWriteNetworkFee,
  fetchOmegaZoneActivity,
  formatNetworkFeeUsd,
  getOrCreateZoneRpcAuthToken,
  getZoneInfo,
  getZoneMarketConfig,
  getZoneDepositStatus,
  getZoneWithdrawalStatus,
  mergeOmegaZoneActivity,
  isZoneRpcAuthTokenExpired,
  waitForZoneTransactionReceipt,
  readPersistedZoneRpcAuthToken,
  readOmegaZoneActivity,
  readPrivateDarkpoolBalance,
  readPrivateTokenAllowance,
  readPrivateZoneWithdrawalFee,
  readPrivateZoneTokenBalance,
  readPrivateZoneAlphaUsdBalance,
  readPrivateZonePathUsdBalance,
  resolveZoneTransactionSigner,
  signAndSendPrivateZoneContractWrite,
  SIMPLE_WITHDRAWAL_GAS_LIMIT,
  submitPrivateZoneWithdrawal,
  TEMPO_L1_GAS_PRICE_DECIMALS,
  tempoL1Chain,
  tempoL1Client,
  useZoneLiveSnapshot,
  zoneWithdrawalStatusToFixture,
  zoneOutboxRequestWithdrawal,
} from "@/lib/zone";

import { PortfolioView, PortfolioSkeleton } from "./_components/PortfolioView";

const PORTAL_APPROVE_GAS_LIMIT = BigInt(500_000);

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
  const [depositToken, setDepositToken] = React.useState<DepositToken>("PATH.USD");
  const [permitSigned, setPermitSigned] = React.useState(false);
  const [depositTxHash, setDepositTxHash] = React.useState<Hex | undefined>();
  const [withdrawTxHash, setWithdrawTxHash] = React.useState<Hex | undefined>();
  const [withdrawBatchIndex, setWithdrawBatchIndex] = React.useState<
    string | undefined
  >();
  const [withdrawL1TxHash, setWithdrawL1TxHash] = React.useState<
    Hex | undefined
  >();
  const [depositError, setDepositError] = React.useState<string | undefined>();
  const [withdrawError, setWithdrawError] = React.useState<string | undefined>();
  const [depositNetworkFeeUsd, setDepositNetworkFeeUsd] =
    React.useState("—");
  const [withdrawNetworkFeeUsd, setWithdrawNetworkFeeUsd] =
    React.useState("—");
  const [withdrawDraft, setWithdrawDraft] = React.useState<WithdrawFormValues>({
    recipient: "",
    amount: "",
  });
  const [zoneAuthToken, setZoneAuthToken] = React.useState<Hex | null>(null);
  const [l1PathUsdBalance, setL1PathUsdBalance] = React.useState<bigint | null>(
    null,
  );
  const [l1AlphaUsdBalance, setL1AlphaUsdBalance] = React.useState<bigint | null>(
    null,
  );
  const [zonePathUsdBalance, setZonePathUsdBalance] =
    React.useState<bigint | null>(null);
  const [darkpoolPathUsdBalance, setDarkpoolPathUsdBalance] =
    React.useState<bigint | null>(null);
  const [zoneAlphaUsdBalance, setZoneAlphaUsdBalance] =
    React.useState<bigint | null>(null);
  const [darkpoolAlphaUsdBalance, setDarkpoolAlphaUsdBalance] =
    React.useState<bigint | null>(null);
  const [zoneTokenBalances, setZoneTokenBalances] =
    React.useState<ZonePortfolioTokenBalance[] | null>(null);
  const [activity, setActivity] = React.useState(() =>
    readOmegaZoneActivity(connectedAddress),
  );
  const [lastWithdrawForm, setLastWithdrawForm] =
    React.useState<WithdrawFormValues | null>(null);
  const zoneAuthTokenRef = React.useRef<Hex | null>(null);
  const zoneAuthTokenPromiseRef = React.useRef<Promise<Hex> | null>(null);
  const selectedDepositTokenAddress = depositTokenAddress(depositToken);

  React.useEffect(() => {
    const cachedAuthToken = readPersistedZoneRpcAuthToken(connectedAddress);
    zoneAuthTokenRef.current = cachedAuthToken;
    zoneAuthTokenPromiseRef.current = null;
    setZoneAuthToken(cachedAuthToken);
    setZoneTokenBalances(null);
    setZonePathUsdBalance(null);
    setDarkpoolPathUsdBalance(null);
    setZoneAlphaUsdBalance(null);
    setDarkpoolAlphaUsdBalance(null);
  }, [connectedAddress]);

  const refreshL1Balance = React.useCallback(async () => {
    if (!connectedAddress) return;
    const readBalance = async (token: Address) =>
      tempoL1Client.readContract({
        address: token,
        abi: TIP20_PARSED_ABI,
        functionName: "balanceOf",
        args: [connectedAddress],
      }) as Promise<bigint>;
    const [pathUsd, alphaUsd] = await Promise.allSettled([
      readBalance(OMEGA_ZONE_ADDRESSES.pathUsd),
      readBalance(OMEGA_ZONE_ADDRESSES.alphaUsd),
    ]);
    setL1PathUsdBalance(pathUsd.status === "fulfilled" ? pathUsd.value : null);
    setL1AlphaUsdBalance(alphaUsd.status === "fulfilled" ? alphaUsd.value : null);
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
      const alphaUsdBalance = byAddress.get(
        OMEGA_ZONE_ADDRESSES.alphaUsd.toLowerCase(),
      );
      const [
        pathUsdWalletBalance,
        pathUsdDarkpoolBalance,
        alphaUsdWalletBalance,
        alphaUsdDarkpoolBalance,
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
          alphaUsdBalance?.available ??
            readPrivateZoneAlphaUsdBalance(authToken, connectedAddress),
        ),
        settle(
          alphaUsdBalance?.locked ??
            readPrivateDarkpoolBalance(
              authToken,
              connectedAddress,
              OMEGA_ZONE_ADDRESSES.alphaUsd,
            ),
        ),
      ]);
      setZoneTokenBalances(tokenBalances);
      setZonePathUsdBalance(pathUsdWalletBalance);
      setDarkpoolPathUsdBalance(pathUsdDarkpoolBalance);
      setZoneAlphaUsdBalance(alphaUsdWalletBalance);
      setDarkpoolAlphaUsdBalance(alphaUsdDarkpoolBalance);
    },
    [connectedAddress],
  );

  const refreshZoneActivity = React.useCallback(
    async (authToken: Hex) => {
      if (!connectedAddress) return;
      const nextActivity = await fetchOmegaZoneActivity({
        authToken,
      });
      // The index response is authoritative. Replace the resting-order set so
      // filled/cancelled orders drop out instead of lingering.
      setActivity(
        mergeOmegaZoneActivity(connectedAddress, nextActivity, {
          ordersAuthoritative: true,
          depositsAuthoritative: true,
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

  const ensureZoneAuthToken = React.useCallback(async (
    { forceRefresh = false }: { forceRefresh?: boolean } = {},
  ) => {
    const usable = (token: Hex | null | undefined): token is Hex =>
      Boolean(token) && !isZoneRpcAuthTokenExpired(token as Hex);

    if (forceRefresh) {
      zoneAuthTokenRef.current = null;
      zoneAuthTokenPromiseRef.current = null;
      setZoneAuthToken(null);
    } else {
      if (usable(zoneAuthTokenRef.current)) return zoneAuthTokenRef.current;
      if (usable(zoneAuthToken)) {
        zoneAuthTokenRef.current = zoneAuthToken;
        return zoneAuthToken;
      }
      if (zoneAuthTokenPromiseRef.current) {
        return zoneAuthTokenPromiseRef.current;
      }
      const cachedAuthToken = readPersistedZoneRpcAuthToken(connectedAddress);
      if (usable(cachedAuthToken)) {
        zoneAuthTokenRef.current = cachedAuthToken;
        setZoneAuthToken(cachedAuthToken);
        return cachedAuthToken;
      }
    }
    if (!connectedAddress) throw new Error("Connect Tempo Wallet first.");

    const authTokenPromise = getOrCreateZoneRpcAuthToken({
      account: connectedAddress,
      forceRefresh,
      getProvider: () =>
        resolveZoneTransactionSigner({
          connector: account.connector ?? connections[0]?.connector,
          fallback: walletClient,
        }),
      onToken: (authToken) => {
        zoneAuthTokenRef.current = authToken;
        setZoneAuthToken(authToken);
      },
    });

    zoneAuthTokenPromiseRef.current = authTokenPromise;
    try {
      return await authTokenPromise;
    } finally {
      zoneAuthTokenPromiseRef.current = null;
    }
    // `zoneAuthToken` is intentionally not a dependency: the current token is
    // read from the ref/cache and mirrored to state only for rendering.
  }, [
    account.connector,
    connectedAddress,
    connections,
    walletClient,
  ]);

  const loadLiveSnapshot = React.useCallback(async () => {
    const authToken = await ensureZoneAuthToken();
    // Balances are the live-data signal. Secondary reads stay in the background
    // so slow activity or Tempo L1 requests cannot hold the page in loading.
    await refreshZoneBalances(authToken);
    void refreshL1Balance().catch(() => {});
    void refreshZoneActivity(authToken).catch(() => {});
  }, [
    ensureZoneAuthToken,
    refreshL1Balance,
    refreshZoneActivity,
    refreshZoneBalances,
  ]);
  const { state: liveState, error: liveError } = useZoneLiveSnapshot({
    enabled: Boolean(connectedAddress) && wallet.state === "connected",
    identity: connectedAddress,
    load: loadLiveSnapshot,
  });

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

  // Keep the withdraw modal's settlement status live while it's open in the
  // `queued` state. A fresh withdrawal lands in `queued` as soon as the L2
  // request confirms, but L1 settlement (batch post + processWithdrawal)
  // takes minutes to hours. Without this poll the modal would sit on
  // "Awaiting L1 settlement" forever — even after the batch has settled on
  // L1 (the activity table updates via the 8s tick above, but the modal
  // itself is driven by `withdrawState`, which this effect advances to
  // `success`/`failed` once the zone reports `processed`/`failed`/`bounced`).
  React.useEffect(() => {
    if (!withdrawOpen || withdrawState !== "queued" || !withdrawTxHash) return;
    let cancelled = false;
    const poll = async () => {
      const token = zoneAuthTokenRef.current;
      if (!token || isZoneRpcAuthTokenExpired(token)) return;
      try {
        const status = await getZoneWithdrawalStatus(token, withdrawTxHash);
        if (cancelled || !status) return;
        if (status.withdrawalBatchIndex)
          setWithdrawBatchIndex(status.withdrawalBatchIndex);
        const l1 =
          status.l1ProcessWithdrawalTxHash ?? status.l1SubmitBatchTxHash;
        if (l1) setWithdrawL1TxHash(l1);
        if (status.status === "processed") {
          setWithdrawState("success");
        } else if (status.status === "failed" || status.status === "bounced") {
          setWithdrawError(status.error ?? "Withdrawal did not settle on L1.");
          setWithdrawState("failed");
        }
      } catch {
        // Transient RPC error — retry on the next tick.
      }
    };
    void poll();
    const iv = window.setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawOpen, withdrawState, withdrawTxHash]);

  const ensureChain = React.useCallback(
    async (chainId: number) => {
      if (account.chainId === chainId) return;
      await switchChain.switchChainAsync({ chainId });
    },
    [account.chainId, switchChain],
  );

  const readPortalAllowance = React.useCallback(async (owner: Address, token: Address) => {
    const allowance = await tempoL1Client.readContract({
      address: token,
      abi: TIP20_PARSED_ABI,
      functionName: "allowance",
      args: [owner, OMEGA_ZONE_ADDRESSES.portal],
      account: owner,
    });
    return allowance as bigint;
  }, []);

  const waitForPortalAllowance = React.useCallback(
    async (owner: Address, token: Address, required: bigint) => {
      const deadline = Date.now() + 30_000;
      let latest = BigInt(0);
      while (Date.now() < deadline) {
        latest = await readPortalAllowance(owner, token);
        if (latest >= required) return latest;
        await delay(800);
      }
      return latest;
    },
    [readPortalAllowance],
  );

  React.useEffect(() => {
    if (!depositOpen || !connectedAddress) {
      setDepositNetworkFeeUsd("—");
      return;
    }

    let cancelled = false;

    async function estimateDepositFee() {
      try {
        const address = connectedAddress as Address;
        const amount = parseDepositAmount(depositAmount, depositToken);
        const [estimatedGas, gasPrice] = await Promise.all([
          permitSigned
            ? tempoL1Client.estimateContractGas({
                account: address,
                ...depositTokenToZoneRequest({
                  token: selectedDepositTokenAddress,
                  to: address,
                  amount,
                  bouncebackRecipient: address,
                }),
              })
            : tempoL1Client.estimateContractGas({
                account: address,
                ...approveTokenToPortalRequest(selectedDepositTokenAddress, amount),
              }),
          tempoL1Client.getGasPrice(),
        ]);
        if (!cancelled) {
          setDepositNetworkFeeUsd(
            formatNetworkFeeUsd(
              bufferTempoGasEstimate(estimatedGas) * gasPrice,
              TEMPO_L1_GAS_PRICE_DECIMALS,
            ),
          );
        }
      } catch {
        if (!cancelled) setDepositNetworkFeeUsd("—");
      }
    }

    void estimateDepositFee();
    return () => {
      cancelled = true;
    };
  }, [
    connectedAddress,
    depositAmount,
    depositOpen,
    depositToken,
    permitSigned,
    selectedDepositTokenAddress,
  ]);

  React.useEffect(() => {
    if (!withdrawOpen || !connectedAddress) {
      setWithdrawNetworkFeeUsd("—");
      return;
    }

    const authToken = zoneAuthTokenRef.current;
    if (!authToken || isZoneRpcAuthTokenExpired(authToken)) {
      setWithdrawNetworkFeeUsd("—");
      return;
    }

    let cancelled = false;

    async function estimateWithdrawFee() {
      try {
        const address = connectedAddress as Address;
        if (!isAddress(withdrawDraft.recipient)) {
          throw new Error("Recipient required.");
        }
        const recipient = withdrawDraft.recipient as Address;
        const amount = parsePathUsdAmount(withdrawDraft.amount);
        const [withdrawalFee, allowance] = await Promise.all([
          readPrivateZoneWithdrawalFee(
            authToken as Hex,
            address,
            SIMPLE_WITHDRAWAL_GAS_LIMIT,
          ),
          readPrivateTokenAllowance(
            authToken as Hex,
            address,
            OMEGA_ZONE_ADDRESSES.pathUsd,
            OMEGA_ZONE_ADDRESSES.zoneOutbox,
          ),
        ]);
        if (allowance < amount + withdrawalFee) {
          if (!cancelled) setWithdrawNetworkFeeUsd("—");
          return;
        }
        const fee = await estimatePrivateZoneContractWriteNetworkFee({
          authToken: authToken as Hex,
          account: address,
          request: zoneOutboxRequestWithdrawal({
            to: recipient,
            amount,
            gasLimit: SIMPLE_WITHDRAWAL_GAS_LIMIT,
            withdrawalFee,
            fallbackRecipient: recipient,
          }),
        });
        if (!cancelled) setWithdrawNetworkFeeUsd(formatNetworkFeeUsd(fee));
      } catch {
        if (!cancelled) setWithdrawNetworkFeeUsd("—");
      }
    }

    void estimateWithdrawFee();
    return () => {
      cancelled = true;
    };
  }, [connectedAddress, withdrawDraft, withdrawOpen]);

  const handleSignPermit = React.useCallback(async () => {
    setDepositError(undefined);
    try {
      const { address, walletClient: client } = requireWallet();
      const amount = parseDepositAmount(depositAmount, depositToken);

      await ensureChain(OMEGA_TEMPO_L1_CHAIN_ID);
      const currentAllowance = await readPortalAllowance(address, selectedDepositTokenAddress);
      if (currentAllowance >= amount) {
        setPermitSigned(true);
        setDepositState("idle");
        return;
      }

      setDepositState("approving");
      const nonce = await tempoL1Client.getTransactionCount({
        address,
        blockTag: "pending",
      });
      const txHash = await client.writeContract({
        account: address,
        chain: tempoL1Chain,
        nonce,
        gas: PORTAL_APPROVE_GAS_LIMIT,
        ...approveTokenToPortalRequest(selectedDepositTokenAddress, amount),
      });
      setDepositTxHash(txHash);
      const receipt = await tempoL1Client.waitForTransactionReceipt({
        hash: txHash,
      });
      if (!receiptSucceeded(receipt.status)) {
        throw new Error("Approval transaction reverted. Deposit was not submitted.");
      }

      const nextAllowance = await waitForPortalAllowance(address, selectedDepositTokenAddress, amount);
      if (nextAllowance < amount) {
        throw new Error(
          `Approval confirmed, but portal allowance is still ${formatTokenAmount(
            nextAllowance,
            6,
          )} ${depositToken}. Wait a few seconds and retry.`,
        );
      }
      setPermitSigned(true);
      setDepositState("idle");
      await refreshL1Balance();
    } catch (error) {
      setDepositError(getErrorMessage(error));
      setDepositState("failed");
    }
  }, [
    depositAmount,
    depositToken,
    ensureChain,
    readPortalAllowance,
    refreshL1Balance,
    requireWallet,
    selectedDepositTokenAddress,
    waitForPortalAllowance,
  ]);

  const handleSignDeposit = React.useCallback(async () => {
    setDepositError(undefined);
    try {
      const { address, walletClient: client } = requireWallet();
      const amount = parseDepositAmount(depositAmount, depositToken);
      const authToken = await ensureZoneAuthToken();

      await ensureChain(OMEGA_TEMPO_L1_CHAIN_ID);
      const currentAllowance = await readPortalAllowance(address, selectedDepositTokenAddress);
      if (currentAllowance < amount) {
        throw new Error("Sign the permit before signing the deposit.");
      }

      setDepositState("depositing");
      const depositRequest = depositTokenToZoneRequest({
        token: selectedDepositTokenAddress,
        to: address,
        amount,
        bouncebackRecipient: address,
      });
      const estimatedGas = await tempoL1Client.estimateContractGas({
        account: address,
        ...depositRequest,
      });
      const nonce = await tempoL1Client.getTransactionCount({
        address,
        blockTag: "pending",
      });
      const txHash = await client.writeContract({
        account: address,
        chain: tempoL1Chain,
        nonce,
        gas: bufferTempoGasEstimate(estimatedGas),
        ...depositRequest,
      });
      setDepositTxHash(txHash);

      setDepositState("pending");
      const receipt = await tempoL1Client.waitForTransactionReceipt({
        hash: txHash,
      });
      if (!receiptSucceeded(receipt.status)) {
        throw new Error("Deposit transaction reverted.");
      }
      const deposit: DepositFixture = {
        id: `d-${txHash.slice(2, 10)}`,
        token: depositToken,
        amount: formatTokenAmount(amount, 6),
        status: "pending",
        initiatedAt: new Date().toISOString(),
        txHash,
      };
      setActivity(mergeOmegaZoneActivity(address, { deposits: [deposit] }));
      setDepositState("queued");
      void refreshL1Balance().catch(() => {});
      void reconcileZoneDeposit({
        authToken,
        account: address,
        tempoBlockNumber: receipt.blockNumber,
        deposit,
        refreshZoneBalances,
        refreshZoneActivity,
        setActivity,
        onCredited: () => setDepositState((current) => (current === "queued" ? "success" : current)),
      });
    } catch (error) {
      setDepositError(getErrorMessage(error));
      setDepositState("failed");
    }
  }, [
    depositAmount,
    depositToken,
    ensureChain,
    ensureZoneAuthToken,
    readPortalAllowance,
    refreshL1Balance,
    refreshZoneActivity,
    refreshZoneBalances,
    requireWallet,
    selectedDepositTokenAddress,
  ]);

  const getZoneTransactionSigner = React.useCallback(async () => {
    const connector = account.connector ?? connections[0]?.connector;
    return resolveZoneTransactionSigner({
      connector,
      fallback: walletClient,
      chainId: OMEGA_ZONE_CHAIN_ID,
    });
  }, [account.connector, connections, walletClient]);

  const handleCancelOrder = React.useCallback(
    async (order: OrderFixture) => {
      const { address } = requireWallet();
      const signer = await getZoneTransactionSigner();
      await cancelPrivateZoneOrder({
        orderFixtureId: order.id,
        account: address,
        signer,
        getAuthToken: ensureZoneAuthToken,
        refresh: async (authToken) => {
          await Promise.all([
            refreshZoneActivity(authToken),
            refreshZoneBalances(authToken),
          ]);
        },
      });
    },
    [
      ensureZoneAuthToken,
      getZoneTransactionSigner,
      refreshZoneActivity,
      refreshZoneBalances,
      requireWallet,
    ],
  );

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
        const { txHash } = await submitPrivateZoneWithdrawal({
          authToken,
          signer,
          account: address,
          to: values.recipient,
          amount,
        });
        setWithdrawTxHash(txHash);

        setWithdrawState("pending");
        await waitForZoneTransactionReceipt(txHash, { authToken });
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
        setWithdrawBatchIndex(withdrawalStatus?.withdrawalBatchIndex);
        setWithdrawL1TxHash(
          (withdrawalStatus?.l1ProcessWithdrawalTxHash ??
            withdrawalStatus?.l1SubmitBatchTxHash) as Hex | undefined,
        );
        setActivity(mergeOmegaZoneActivity(address, { withdrawals: [withdrawal] }));
        await Promise.all([
          refreshZoneBalances(authToken),
          refreshZoneActivity(authToken),
        ]);
        // Only show "Settled" once the withdrawal is actually processed on L1.
        // A fresh withdrawal almost always lands here as `queued` (L2 confirmed,
        // awaiting batch settlement on L1); `success` is reserved for the rare
        // case where `processed` is already reported within the poll window.
        const terminal: WithdrawState =
          withdrawalStatus?.status === "processed"
            ? "success"
            : withdrawalStatus?.status === "failed" ||
                withdrawalStatus?.status === "bounced"
              ? "failed"
              : "queued";
        if (terminal === "failed") {
          setWithdrawError(
            withdrawalStatus?.error ?? "Withdrawal did not settle on L1.",
          );
        }
        setWithdrawState(terminal);
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
    setWithdrawTxHash(undefined);
    setWithdrawBatchIndex(undefined);
    setWithdrawL1TxHash(undefined);
    setLastWithdrawForm(null);
    setWithdrawDraft({ recipient: "", amount: "" });
  }, []);

  const livePortfolio = React.useMemo(
    () =>
      buildOmegaZonePortfolioFixture({
        tokenBalances: zoneTokenBalances,
        zonePathUsdBalance,
        darkpoolPathUsdBalance,
        zoneAlphaUsdBalance,
        darkpoolAlphaUsdBalance,
        activity,
      }),
    [
      activity,
      darkpoolAlphaUsdBalance,
      darkpoolPathUsdBalance,
      zoneAlphaUsdBalance,
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
      zoneAlphaUsdBalance !== null ||
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
        onAction={() => wallet.reviewLogin()}
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
            onCancelOrder={handleCancelOrder}
          />
        )}
      </PageLayout>

      <DepositModal
        open={depositOpen}
        onClose={closeDeposit}
        state={depositState}
        token={depositToken}
        amount={depositAmount}
        walletBalance={formatPathUsdAmount(selectedDepositL1Balance({
          token: depositToken,
          pathUsd: l1PathUsdBalance,
          alphaUsd: l1AlphaUsdBalance,
        }))}
        networkFeeUsd={depositNetworkFeeUsd}
        permitSigned={permitSigned}
        txHash={depositTxHash}
        errorMessage={depositError}
        onTokenChange={(next) => {
          setDepositToken(next);
          setPermitSigned(false);
          setDepositError(undefined);
          if (depositState === "failed") setDepositState("idle");
        }}
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
        defaultRecipient={connectedAddress}
        available={formatPathUsdAmount(zonePathUsdBalance)}
        networkFeeUsd={withdrawNetworkFeeUsd}
        txHash={withdrawTxHash}
        withdrawalBatchIndex={withdrawBatchIndex}
        l1SettlementTxHash={withdrawL1TxHash}
        errorMessage={withdrawError}
        onValuesChange={setWithdrawDraft}
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

function parseDepositAmount(value: string, token: DepositToken): bigint {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) throw new Error("Enter an amount.");
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    throw new Error(`Enter a ${token} amount with up to 6 decimals.`);
  }
  const amount = parseUnits(trimmed, 6);
  if (amount <= BigInt(0)) throw new Error("Amount must be greater than zero.");
  return amount;
}

function parsePathUsdAmount(value: string): bigint {
  return parseDepositAmount(value, "PATH.USD");
}

function depositTokenAddress(token: DepositToken): Address {
  return token === "ALPHAUSD"
    ? OMEGA_ZONE_ADDRESSES.alphaUsd
    : OMEGA_ZONE_ADDRESSES.pathUsd;
}

function selectedDepositL1Balance({
  token,
  pathUsd,
  alphaUsd,
}: {
  token: DepositToken;
  pathUsd: bigint | null;
  alphaUsd: bigint | null;
}): bigint | null {
  return token === "ALPHAUSD" ? alphaUsd : pathUsd;
}

function buildOmegaZonePortfolioFixture({
  tokenBalances,
  zonePathUsdBalance,
  darkpoolPathUsdBalance,
  zoneAlphaUsdBalance,
  darkpoolAlphaUsdBalance,
  activity,
}: {
  tokenBalances: ZonePortfolioTokenBalance[] | null;
  zonePathUsdBalance: bigint | null;
  darkpoolPathUsdBalance: bigint | null;
  zoneAlphaUsdBalance: bigint | null;
  darkpoolAlphaUsdBalance: bigint | null;
  activity: {
    orders: PortfolioFixture["openOrders"];
    orderHistory: NonNullable<PortfolioFixture["activityOrders"]>;
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
      activityOrders: activity.orderHistory,
      recentFills: activity.fills,
      deposits: activity.deposits,
      withdrawals: activity.withdrawals,
    };
  }

  const pathUsdAvailable = zonePathUsdBalance ?? BigInt(0);
  const pathUsdLocked = darkpoolPathUsdBalance ?? BigInt(0);
  const pathUsdTotal = pathUsdAvailable + pathUsdLocked;
  const alphaUsdAvailable = zoneAlphaUsdBalance ?? BigInt(0);
  const alphaUsdLocked = darkpoolAlphaUsdBalance ?? BigInt(0);
  const alphaUsdTotal = alphaUsdAvailable + alphaUsdLocked;
  const total = pathUsdTotal + alphaUsdTotal;

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
        token: "ALPHAUSD",
        available: formatPathUsdAmount(alphaUsdAvailable),
        locked: formatPathUsdAmount(alphaUsdLocked),
        total: formatPathUsdAmount(alphaUsdTotal),
      },
    ],
    openOrders: activity.orders,
    activityOrders: activity.orderHistory,
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
      token: "ALPHAUSD",
      address: OMEGA_ZONE_ADDRESSES.alphaUsd,
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
    "ALPHAUSD",
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

async function waitForZoneDeposit(
  authToken: Hex,
  tempoBlockNumber: bigint,
): Promise<DepositFixture["status"]> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const status = await getZoneDepositStatus(authToken, tempoBlockNumber).catch(
      () => null,
    );
    if (!status) {
      await delay(2000);
      continue;
    }
    if (status.deposits.some((deposit) => deposit.status === "failed")) {
      throw new Error("Deposit failed while processing in Omega Zone.");
    }
    if (
      status.processed ||
      status.deposits.some((deposit) => deposit.status === "processed")
    ) {
      return "credited";
    }
    await delay(2000);
  }
  return "pending";
}

async function reconcileZoneDeposit({
  authToken,
  account,
  tempoBlockNumber,
  deposit,
  refreshZoneBalances,
  refreshZoneActivity,
  setActivity,
  onCredited,
}: {
  authToken: Hex;
  account: Address;
  tempoBlockNumber: bigint;
  deposit: DepositFixture;
  refreshZoneBalances: (authToken: Hex) => Promise<void>;
  refreshZoneActivity: (authToken: Hex) => Promise<void>;
  setActivity: (activity: ReturnType<typeof mergeOmegaZoneActivity>) => void;
  onCredited: () => void;
}) {
  try {
    const status = await waitForZoneDeposit(authToken, tempoBlockNumber);
    if (status === "pending") return;

    setActivity(
      mergeOmegaZoneActivity(account, {
        deposits: [{ ...deposit, status }],
      }),
    );
    onCredited();
    await Promise.allSettled([
      refreshZoneBalances(authToken),
      refreshZoneActivity(authToken),
    ]);
  } catch {
    setActivity(
      mergeOmegaZoneActivity(account, {
        deposits: [{ ...deposit, status: "failed" }],
      }),
    );
  }
}

async function pollZoneWithdrawalStatus(authToken: Hex, txHash: Hex) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const status = await getZoneWithdrawalStatus(authToken, txHash);
      if (!status) {
        if (attempt >= 2) return null;
        await delay(2000);
        continue;
      }
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

function receiptSucceeded(status: unknown): boolean {
  const normalized = String(status ?? "");
  return normalized === "success" || normalized === "0x1";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Omega Zone request failed.";
}
