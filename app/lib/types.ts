// ── Core types ──

export type Side = "buy" | "sell";
export type OrderType = "midpoint" | "limit" | "twap";
export type OrderStatus = "open" | "filled" | "cancelled" | "aggregation-locked";
export type BatchStatus = "processing" | "proposed" | "proved" | "settled" | "finalized";
export type WithdrawalStatus = "initiated" | "proof-generated" | "claimable" | "claimed" | "confirmed";
export type ToastType = "success" | "error" | "warning" | "info";

// ── Market data ──

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface Trade {
  time: string;
  pair: string;
  price: number;
  size: number;
  sizeFormatted?: string; // e.g. "€125,000"
  side: Side;
}

export interface Position {
  pair: string;
  side: "long" | "short";
  size: number;
  entry: number;
  current: number;
  pnl: number;
  pnlPercent: number;
}

export interface MarketPrice {
  source: string;
  bid: number;
  ask: number;
  spread: number;
}

export interface PairInfo {
  pair: string;
  base: string;
  quote: string;
  price: number;
  change: number;
  fullName: string;
}

// ── Pipeline ──

export type PipelineStep =
  | "submitted"
  | "matched"
  | "aggregation-locked"
  | "batched"
  | "settled"
  | "proven";

export interface PipelineState {
  currentStep: PipelineStep;
  completedSteps: PipelineStep[];
  orderId: string;
}

// ── Balances ──

export interface Balance {
  currency: string;
  available: number;
  reserved: number;
}

export interface ChainBalance {
  chain: string;
  balances: Balance[];
}

export interface PortfolioBalance {
  token: string;
  color: string;
  total: number;
  available: number;
  reserved: number;
  pendingPrivacy: number;
}

// ── Orders ──

export interface OrderHistoryEntry {
  id: string;
  time: string;
  pair: string;
  type: OrderType;
  side: Side;
  amount: number;
  price: number;
  filledPercent: number;
  status: OrderStatus;
}

export interface Fill {
  time: string;
  price: number;
  size: number;
  batchId: string;
}

export interface OrderDetail {
  id: string;
  pair: string;
  side: Side;
  type: OrderType;
  size: number;
  price: number;
  midpointRate: number;
  slippage: number;
  filledPercent: number;
  status: OrderStatus;
  submittedAt: string;
  fills: Fill[];
}

// ── Batches ──

export interface Batch {
  id: string;
  txCount: number;
  status: BatchStatus;
  timestamp: string;
  proofLink: string | null;
}

export interface BatchTransaction {
  id: string;
  batchId: string;
  pair: string;
  side: Side;
  amount: number;
  price: number;
  status: string;
}

// ── Funding ──

export interface FundTransaction {
  id: string;
  type: "deposit" | "withdraw" | "transfer";
  amount: number;
  token: string;
  status: "pending" | "completed" | "failed";
  mode: "standard" | "privacy";
  time: string;
}

export interface WithdrawalTimeline {
  step: WithdrawalStatus;
  label: string;
  time: string | null;
}

export interface WithdrawalInfo {
  id: string;
  amount: number;
  token: string;
  destination: string;
  chain: string;
  mode: "standard" | "privacy";
  fee: number;
  status: WithdrawalStatus;
  initiatedAt: string;
  timeline: WithdrawalTimeline[];
}

// ── Transaction detail ──

export interface TxDetail {
  id: string;
  pair: string;
  side: Side;
  amount: number;
  price: number;
  totalUsd: number;
  orderType: OrderType;
  mode: "standard" | "privacy";
  submittedAt: string;
  matchedAt: string;
  midpointPrice: number;
  priceImprovement: number;
  slippage: number;
  counterparty: string;
  venue: string;
  fee: number;
  batchId: string;
  batchStatus: BatchStatus;
  proofHash: string;
  settlementChain: string;
}

// ── Exchange stats ──

export interface ExchangeStats {
  volume: string;
  trades: number;
  activePairs: number;
  batches: number;
  avgSettlement: string;
}

// ── Toasts ──

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}
