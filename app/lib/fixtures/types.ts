/**
 * Fixture data registry — shared types.
 *
 * These shapes are the contract between fixture files and the M3 page
 * components that consume them. They're modelled to match what the
 * `omega-markets` REST gateway will eventually return (see
 * `omega-markets/omega-api/openapi.yaml` once available); fixture-only
 * fields (e.g. `error`, `isLoading`) are sentinels the pages read to
 * decide which view to render.
 *
 * u128 quantities are serialised as decimal strings so fixture files
 * stay JSON-friendly. Pages convert to BigInt at the boundary.
 */

import type { StatusState } from "@/components/ui/status";

export type MarketPair =
  | "USDC/EURC"
  | "USDC/USDT"
  | "USDT/EURC"
  | "ETH/USDC"
  | "BTC/USDC";

export type PageState =
  | "default"
  | "empty"
  | "loading"
  | "error"
  | "skeleton"
  | "disconnected"
  | "wrong-network";

export type Side = "buy" | "sell";
export type OrderType = "market" | "limit" | "midpoint";

export type OrderStatus = Extract<
  StatusState,
  "pending" | "matched" | "settled" | "cancelled" | "failed"
>;

export interface ErrorEnvelope {
  message: string;
  code: string;
}

export interface OrderFixture {
  id: string;
  pair: MarketPair;
  side: Side;
  type: OrderType;
  /** Decimal string of base-token amount (e.g. "5000.00" USDC). */
  amount: string;
  /** Decimal string of QUOTE-per-1-BASE price (e.g. "0.9215"). */
  price: string;
  filledPercent: number;
  status: OrderStatus;
  /** ISO8601. */
  submittedAt: string;
}

export interface FillFixture {
  id: string;
  orderId: string;
  pair: MarketPair;
  side: Side;
  /** Decimal string of base-token amount filled. */
  amount: string;
  /** Decimal string of midpoint price the fill cleared at. */
  price: string;
  /** ISO8601. */
  matchedAt: string;
  /** Settlement state — drives the badge in the timeline. */
  status: Extract<StatusState, "matched" | "settled" | "proven">;
}

export type BatchStatus = "pending" | "verified" | "failed";

export interface BatchFixture {
  /** Sequential batch number (e.g. 4821). */
  number: number;
  /** Hex digest of batch root (0x… 32-byte). */
  root: `0x${string}`;
  status: BatchStatus;
  /** ISO8601 of seal time. */
  sealedAt: string;
  /** Number of orders included. */
  orderCount: number;
  /** Number of fills included. */
  fillCount: number;
  /** Hex tx hash if settled, null otherwise. */
  settlementTx: `0x${string}` | null;
  /** Optional proof reference for verified batches. */
  proofRef?: `0x${string}`;
  /**
   * Aggregate pairs that cleared in this batch. Aggregate-only — never
   * paired with counterparty IDs. The list view renders a chip cluster;
   * the detail page renders a pair-level fill breakdown.
   */
  pairs?: MarketPair[];
  /**
   * Aggregate USD-equivalent volume across all fills, decimal string.
   * Fixture-only field for the wireframe; M6 sources from the price
   * oracle.
   */
  volumeUsd?: string;
  /**
   * Human-readable failure reason for `status: "failed"` batches. Surfaced
   * in the detail-page banner. Aggregate context only — never references
   * an individual order/fill counterparty.
   */
  failureReason?: string;
}

export interface BalanceFixture {
  token: "USDC" | "EURC" | "USDT" | "ETH" | "BTC";
  /** Decimal string. Available to trade. */
  available: string;
  /** Decimal string. Locked in open orders. */
  locked: string;
  /** Decimal string. available + locked. */
  total: string;
}

export type DepositStatus = Extract<
  StatusState,
  "pending" | "settled" | "failed"
>;

export interface DepositFixture {
  id: string;
  token: BalanceFixture["token"];
  amount: string;
  status: DepositStatus;
  /** ISO8601. */
  initiatedAt: string;
  /** L1 tx hash. */
  txHash: `0x${string}`;
}

export type WithdrawalStatus = Extract<
  StatusState,
  "awaiting-signature" | "pending" | "settled" | "failed"
>;

export interface WithdrawalFixture {
  id: string;
  token: BalanceFixture["token"];
  amount: string;
  status: WithdrawalStatus;
  /** ISO8601. */
  initiatedAt: string;
  /** L1 tx hash if broadcast, null if still awaiting sig. */
  txHash: `0x${string}` | null;
}

export interface OrderBookLevel {
  /** Decimal string of price. */
  price: string;
  /** Decimal string of cumulative depth at this level. */
  size: string;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Per-page fixture shapes                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export interface TradeFixture {
  pair: MarketPair;
  /** Decimal string of latest cleared midpoint. */
  midpoint: string;
  /** A short list of recent fills the user is permitted to see (own + own-batch only — no global feed). */
  recentFills: FillFixture[];
  /** Order-book ladder, top-of-book first. */
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  /** User's own resting orders on this pair, if connected. */
  myOpenOrders: OrderFixture[];
  isLoading?: boolean;
  error?: ErrorEnvelope;
}

export interface PortfolioFixture {
  /** Decimal string aggregated to USD via mark-to-midpoint. */
  totalValueUSD: string;
  balances: BalanceFixture[];
  openOrders: OrderFixture[];
  recentFills: FillFixture[];
  deposits: DepositFixture[];
  withdrawals: WithdrawalFixture[];
  isLoading?: boolean;
  error?: ErrorEnvelope;
}

export interface BatchesListFixture {
  batches: BatchFixture[];
  isLoading?: boolean;
  error?: ErrorEnvelope;
}

export interface BatchesDetailFixture {
  batch: BatchFixture;
  /** Orders included in this batch. */
  orders: OrderFixture[];
  /** Fills produced by this batch. */
  fills: FillFixture[];
  isLoading?: boolean;
  error?: ErrorEnvelope;
}

export interface BatchesSearchFixture {
  query: string;
  results: BatchFixture[];
}

export interface AccountFixture {
  /** Truncated address (e.g. "0x1234…abcd") — never the full address in fixtures. */
  address: `0x${string}` | null;
  ensName?: string;
  /** Whether the connected wallet holds an Omega NFT pass. */
  hasNftPass: boolean;
  /** ISO8601 of last sign-in via SIWE-equivalent. */
  sessionStartedAt?: string;
  /** Notification + display preferences. */
  preferences: {
    reduceMotion: boolean;
    showAdvancedOrderTypes: boolean;
  };
  isLoading?: boolean;
  error?: ErrorEnvelope;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Modal fixture shapes                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export type ConnectModalState =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "no-nft-pass";

export interface ConnectModalFixture {
  state: ConnectModalState;
  address?: `0x${string}`;
  error?: ErrorEnvelope;
}

export type DepositModalState =
  | "idle"
  | "approving"
  | "depositing"
  | "pending"
  | "success"
  | "failed";

export interface DepositModalFixture {
  state: DepositModalState;
  token: BalanceFixture["token"];
  amount: string;
  /** L1 tx hash once broadcast. */
  txHash?: `0x${string}`;
  error?: ErrorEnvelope;
}

export type WithdrawModalState =
  | "idle"
  | "signing"
  | "pending"
  | "success"
  | "failed";

export interface WithdrawModalFixture {
  state: WithdrawModalState;
  token: BalanceFixture["token"];
  amount: string;
  txHash?: `0x${string}`;
  error?: ErrorEnvelope;
}

export type OrderConfirmationModalState =
  | "idle"
  | "signing"
  | "submitting"
  | "failed";

export interface OrderConfirmationModalFixture {
  state: OrderConfirmationModalState;
  pair: MarketPair;
  side: Side;
  type: OrderType;
  amount: string;
  /** Limit price (limit only). Empty string for market. */
  price: string;
  /** Decimal string of estimated fees in QUOTE token. */
  estimatedFee: string;
  error?: ErrorEnvelope;
}
