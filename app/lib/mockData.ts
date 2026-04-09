import type {
  Trade,
  Position,
  MarketPrice,
  PipelineState,
  Balance,
  ChainBalance,
  OrderHistoryEntry,
  Batch,
  BatchTransaction,
  ExchangeStats,
  PairInfo,
  PortfolioBalance,
  FundTransaction,
  WithdrawalInfo,
  OrderDetail,
  TxDetail,
} from "./types";

// ── Pairs ──

export const mockPairs: PairInfo[] = [
  { pair: "EUR/USD", base: "EUR", quote: "USD", price: 1.0856, change: 0.42, fullName: "Euro / US Dollar" },
  { pair: "GBP/USD", base: "GBP", quote: "USD", price: 1.2645, change: -0.18, fullName: "British Pound / US Dollar" },
  { pair: "USD/JPY", base: "USD", quote: "JPY", price: 149.85, change: 0.31, fullName: "US Dollar / Japanese Yen" },
  { pair: "USD/CHF", base: "USD", quote: "CHF", price: 0.8842, change: -0.05, fullName: "US Dollar / Swiss Franc" },
  { pair: "AUD/USD", base: "AUD", quote: "USD", price: 0.6523, change: 0.67, fullName: "Australian Dollar / US Dollar" },
  { pair: "NZD/USD", base: "NZD", quote: "USD", price: 0.5912, change: 0.15, fullName: "New Zealand Dollar / US Dollar" },
  { pair: "USD/CAD", base: "USD", quote: "CAD", price: 1.3567, change: -0.11, fullName: "US Dollar / Canadian Dollar" },
];

// ── Recent Trades (with € sizes) ──

function generateTrades(): Trade[] {
  const now = new Date();
  const sizes = [125000, 250000, 75000, 500000, 100000, 200000, 50000, 350000, 150000, 180000, 90000, 275000, 325000, 60000, 400000];
  return Array.from({ length: 15 }, (_, i) => {
    const side = Math.random() > 0.5 ? "buy" : ("sell" as const);
    const time = new Date(now.getTime() - i * 12000);
    const size = sizes[i];
    return {
      time: time.toLocaleTimeString("en-US", { hour12: false }),
      timestamp: Math.floor(time.getTime() / 1000),
      pair: "EUR/USD",
      price: +(1.0845 + Math.random() * 0.002).toFixed(4),
      size,
      sizeFormatted: `€${(size / 1000).toFixed(0)}K`,
      side,
    };
  });
}

export const recentTrades = generateTrades();

// ── Positions ──

export const openPositions: Position[] = [
  { pair: "EUR/USD", side: "long", size: 125000, entry: 1.0832, current: 1.0856, pnl: 300, pnlPercent: 0.22 },
  { pair: "GBP/USD", side: "short", size: 75000, entry: 1.2680, current: 1.2645, pnl: 262.5, pnlPercent: 0.28 },
  { pair: "USD/JPY", side: "long", size: 200000, entry: 149.50, current: 149.85, pnl: 467.22, pnlPercent: 0.23 },
];

// ── Stats ──

export const stats = {
  pair: "EUR/USD",
  price: 1.0856,
  change: 0.42,
  high: 1.0901,
  low: 1.0812,
  volume: "2.85B",
};

// ── Market Prices ──

export const mockMarketPrices: MarketPrice[] = [
  { source: "Wise", bid: 1.0848, ask: 1.0854, spread: 0.0006 },
  { source: "OFX", bid: 1.0845, ask: 1.0858, spread: 0.0013 },
  { source: "Revolut", bid: 1.0847, ask: 1.0856, spread: 0.0009 },
  { source: "Omega", bid: 1.085, ask: 1.0852, spread: 0.0002 },
];

// ── Pipeline ──

export const mockPipelineState: PipelineState = {
  currentStep: "matched",
  completedSteps: ["submitted", "matched"],
  orderId: "ORD-20260306-0042",
};

// ── Balances ──

export const mockBalances: Balance[] = [
  { currency: "EUR", available: 12450.0, reserved: 3200.0 },
  { currency: "USD", available: 28750.5, reserved: 5100.0 },
  { currency: "GBP", available: 4320.75, reserved: 0 },
];

export const mockChainBalances: ChainBalance[] = [
  {
    chain: "Ethereum",
    balances: [
      { currency: "USDC", available: 15000, reserved: 0 },
      { currency: "USDT", available: 8200, reserved: 0 },
    ],
  },
  {
    chain: "Polygon",
    balances: [
      { currency: "USDC", available: 5400, reserved: 0 },
      { currency: "USDT", available: 2100, reserved: 0 },
    ],
  },
  {
    chain: "Arbitrum",
    balances: [
      { currency: "USDC", available: 9800, reserved: 0 },
      { currency: "USDT", available: 3300, reserved: 0 },
    ],
  },
];

// ── Portfolio ──

export const mockPortfolioValue = {
  total: 45520.75,
  change: 1247.82,
  changePercent: 2.82,
};

export const mockPortfolioBalances: PortfolioBalance[] = [
  { token: "USDC", color: "#2775CA", total: 25000.00, available: 20000.00, reserved: 5000.00, pendingPrivacy: 0 },
  { token: "USDT", color: "#26A17B", total: 13200.00, available: 10200.00, reserved: 3000.00, pendingPrivacy: 0 },
  { token: "EURC", color: "#1434CB", total: 7320.75, available: 5320.75, reserved: 0, pendingPrivacy: 2000.00 },
];

// ── Orders ──

export const mockOrderHistory: OrderHistoryEntry[] = [
  { id: "ORD-001", time: "14:32:05", pair: "EUR/USD", type: "limit", side: "buy", amount: 5000, price: 1.085, filledPercent: 100, status: "filled" },
  { id: "ORD-002", time: "14:28:17", pair: "EUR/USD", type: "midpoint", side: "sell", amount: 2500, price: 1.0853, filledPercent: 100, status: "filled" },
  { id: "ORD-003", time: "14:15:42", pair: "EUR/USD", type: "limit", side: "buy", amount: 10000, price: 1.084, filledPercent: 0, status: "open" },
  { id: "ORD-004", time: "13:58:09", pair: "GBP/USD", type: "twap", side: "buy", amount: 8000, price: 1.2645, filledPercent: 35, status: "aggregation-locked" },
  { id: "ORD-005", time: "13:45:33", pair: "EUR/USD", type: "limit", side: "sell", amount: 3000, price: 1.087, filledPercent: 0, status: "cancelled" },
  { id: "ORD-006", time: "13:22:11", pair: "EUR/USD", type: "midpoint", side: "buy", amount: 1500, price: 1.0848, filledPercent: 100, status: "filled" },
  { id: "ORD-007", time: "12:55:28", pair: "GBP/USD", type: "limit", side: "sell", amount: 6000, price: 1.268, filledPercent: 60, status: "aggregation-locked" },
  { id: "ORD-008", time: "12:40:15", pair: "EUR/USD", type: "twap", side: "sell", amount: 4000, price: 1.0855, filledPercent: 100, status: "filled" },
  { id: "ORD-009", time: "12:18:44", pair: "EUR/USD", type: "limit", side: "buy", amount: 7500, price: 1.0835, filledPercent: 0, status: "open" },
  { id: "ORD-010", time: "11:52:30", pair: "GBP/USD", type: "midpoint", side: "buy", amount: 2000, price: 1.2638, filledPercent: 100, status: "filled" },
  { id: "ORD-011", time: "11:30:08", pair: "EUR/USD", type: "limit", side: "sell", amount: 5500, price: 1.0875, filledPercent: 0, status: "cancelled" },
  { id: "ORD-012", time: "11:05:19", pair: "EUR/USD", type: "limit", side: "buy", amount: 9000, price: 1.083, filledPercent: 0, status: "open" },
  { id: "ORD-013", time: "10:42:55", pair: "EUR/USD", type: "twap", side: "buy", amount: 12000, price: 1.0842, filledPercent: 78, status: "aggregation-locked" },
  { id: "ORD-014", time: "10:15:03", pair: "GBP/USD", type: "limit", side: "sell", amount: 3500, price: 1.2695, filledPercent: 0, status: "cancelled" },
  { id: "ORD-015", time: "09:48:37", pair: "EUR/USD", type: "midpoint", side: "sell", amount: 1800, price: 1.0846, filledPercent: 100, status: "filled" },
];

// ── Funding Transactions ──

export const mockFundTransactions: FundTransaction[] = [
  { id: "FT-001", type: "deposit", amount: 10000, token: "USDC", status: "completed", mode: "standard", time: "2026-03-11 09:15:00" },
  { id: "FT-002", type: "withdraw", amount: 5000, token: "USDT", status: "pending", mode: "privacy", time: "2026-03-11 08:42:00" },
  { id: "FT-003", type: "transfer", amount: 2500, token: "USDC", status: "completed", mode: "standard", time: "2026-03-10 16:30:00" },
  { id: "FT-004", type: "deposit", amount: 15000, token: "EURC", status: "completed", mode: "standard", time: "2026-03-10 14:22:00" },
  { id: "FT-005", type: "withdraw", amount: 3000, token: "USDC", status: "failed", mode: "privacy", time: "2026-03-09 11:05:00" },
  { id: "FT-006", type: "withdraw", amount: 7500, token: "USDT", status: "claimable", mode: "privacy", time: "2026-03-09 09:30:00" },
];

// ── Withdrawal Detail ──

export const mockWithdrawal: WithdrawalInfo = {
  id: "WD-001",
  amount: 5000,
  token: "USDT",
  destination: "0x1234...5678",
  chain: "Ethereum",
  mode: "privacy",
  fee: 2.50,
  status: "claimable",
  initiatedAt: "2026-03-11 08:42:00",
  timeline: [
    { step: "initiated", label: "Withdrawal Initiated", time: "2026-03-11 08:42:00" },
    { step: "proof-generated", label: "ZK Proof Generated", time: "2026-03-11 08:43:15" },
    { step: "claimable", label: "Funds Claimable", time: "2026-03-11 08:44:30" },
    { step: "claimed", label: "Claimed", time: null },
    { step: "confirmed", label: "On-chain Confirmed", time: null },
  ],
};

// ── Order Detail ──

export const mockOrderDetail: OrderDetail = {
  id: "ORD-003",
  pair: "EUR/USD",
  side: "buy",
  type: "limit",
  size: 10000,
  price: 1.084,
  midpointRate: 1.0856,
  slippage: 0.1,
  filledPercent: 45,
  status: "open",
  submittedAt: "2026-03-11 14:15:42",
  fills: [
    { time: "14:18:05", price: 1.0842, size: 3000, batchId: "BATCH-001" },
    { time: "14:22:33", price: 1.0841, size: 1500, batchId: "BATCH-002" },
  ],
};

// ── Transaction Detail ──

export const mockTxDetail: TxDetail = {
  id: "TX-001-1",
  pair: "EUR/USD",
  side: "buy",
  amount: 5000,
  price: 1.085,
  totalUsd: 5425.00,
  orderType: "midpoint",
  mode: "privacy",
  submittedAt: "2026-03-11 14:32:05",
  matchedAt: "2026-03-11 14:32:08",
  midpointPrice: 1.0851,
  priceImprovement: 0.0001,
  slippage: 0.01,
  counterparty: "Anonymous",
  venue: "Omega Darkpool",
  fee: 0.50,
  batchId: "BATCH-001",
  batchStatus: "finalized",
  proofHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  settlementChain: "Ethereum",
};

// ── Batches ──

export const mockBatches: Batch[] = [
  { id: "BATCH-001", txCount: 42, status: "finalized", timestamp: "2026-03-06 14:00:00", proofLink: "https://etherscan.io/tx/0xabc1" },
  { id: "BATCH-002", txCount: 38, status: "finalized", timestamp: "2026-03-06 13:30:00", proofLink: "https://etherscan.io/tx/0xabc2" },
  { id: "BATCH-003", txCount: 55, status: "settled", timestamp: "2026-03-06 13:00:00", proofLink: "https://etherscan.io/tx/0xabc3" },
  { id: "BATCH-004", txCount: 27, status: "settled", timestamp: "2026-03-06 12:30:00", proofLink: null },
  { id: "BATCH-005", txCount: 63, status: "proved", timestamp: "2026-03-06 12:00:00", proofLink: null },
  { id: "BATCH-006", txCount: 19, status: "processing", timestamp: "2026-03-06 11:30:00", proofLink: null },
  { id: "BATCH-007", txCount: 34, status: "proposed", timestamp: "2026-03-06 11:00:00", proofLink: null },
  { id: "BATCH-008", txCount: 48, status: "proposed", timestamp: "2026-03-06 10:30:00", proofLink: null },
];

export const mockBatchTransactions: Record<string, BatchTransaction[]> = {
  "BATCH-001": [
    { id: "TX-001-1", batchId: "BATCH-001", pair: "EUR/USD", side: "buy", amount: 5000, price: 1.085, status: "settled" },
    { id: "TX-001-2", batchId: "BATCH-001", pair: "EUR/USD", side: "sell", amount: 3200, price: 1.0853, status: "settled" },
    { id: "TX-001-3", batchId: "BATCH-001", pair: "GBP/USD", side: "buy", amount: 8000, price: 1.2645, status: "settled" },
    { id: "TX-001-4", batchId: "BATCH-001", pair: "EUR/USD", side: "buy", amount: 1500, price: 1.0848, status: "settled" },
  ],
  "BATCH-002": [
    { id: "TX-002-1", batchId: "BATCH-002", pair: "EUR/USD", side: "sell", amount: 4500, price: 1.0855, status: "settled" },
    { id: "TX-002-2", batchId: "BATCH-002", pair: "GBP/USD", side: "buy", amount: 2000, price: 1.2638, status: "settled" },
    { id: "TX-002-3", batchId: "BATCH-002", pair: "EUR/USD", side: "buy", amount: 7200, price: 1.0842, status: "settled" },
  ],
  "BATCH-007": [
    { id: "TX-007-1", batchId: "BATCH-007", pair: "EUR/USD", side: "buy", amount: 10000, price: 1.084, status: "pending" },
    { id: "TX-007-2", batchId: "BATCH-007", pair: "EUR/USD", side: "sell", amount: 5500, price: 1.0875, status: "pending" },
    { id: "TX-007-3", batchId: "BATCH-007", pair: "GBP/USD", side: "sell", amount: 3500, price: 1.2695, status: "pending" },
    { id: "TX-007-4", batchId: "BATCH-007", pair: "EUR/USD", side: "buy", amount: 9000, price: 1.083, status: "pending" },
    { id: "TX-007-5", batchId: "BATCH-007", pair: "EUR/USD", side: "buy", amount: 6000, price: 1.0838, status: "pending" },
  ],
  "BATCH-008": [
    { id: "TX-008-1", batchId: "BATCH-008", pair: "EUR/USD", side: "sell", amount: 1800, price: 1.0846, status: "pending" },
    { id: "TX-008-2", batchId: "BATCH-008", pair: "GBP/USD", side: "buy", amount: 4200, price: 1.2652, status: "pending" },
    { id: "TX-008-3", batchId: "BATCH-008", pair: "EUR/USD", side: "buy", amount: 3300, price: 1.0844, status: "pending" },
  ],
};

// ── Exchange Stats ──

export const mockExchangeStats: ExchangeStats = {
  volume: "$142.5M",
  trades: 12847,
  activePairs: 6,
  batches: 1247,
  avgSettlement: "4.2s",
};
