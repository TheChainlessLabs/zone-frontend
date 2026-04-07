// Wire-format types matching the Rust backend exactly.
// Separate from types.ts which defines UI-facing types.

export type ApiSide = "Buy" | "Sell";
export type ApiOrderKind = "Limit" | "Market" | "Flip";

// ── GET /markets/{id}/book ──

export interface OrderEntry {
  id: number;
  owner_account_id: number;
  side: ApiSide;
  kind: ApiOrderKind;
  price: string;
  remaining_quantity: string;
}

export interface OrderBookResponse {
  market_id: number;
  bids: OrderEntry[];
  asks: OrderEntry[];
}

// ── GET /markets/{id}/trades ──

export interface ApiTrade {
  id: number;
  market_id: number;
  timestamp: number;
  maker_order_id: number;
  taker_order_id: number;
  maker_account_id: number;
  taker_account_id: number;
  price: string;
  quantity: string;
  maker_side: ApiSide;
}

export interface TradesResponse {
  market_id: number;
  trades: ApiTrade[];
}

// ── POST /orders ──

export interface OrderExtension {
  max_slippage_bps?: number;
  flip_price?: string;
}

export interface CreateOrderPayload {
  market_id: number;
  side: ApiSide;
  kind: ApiOrderKind;
  price: string;
  quantity: string;
  extension: OrderExtension | null;
  nonce: number;
  signature: string;
}

export interface CreateOrderResponse {
  order_id: number;
}

// ── POST /orders/cancel ──

export interface CancelOrderPayload {
  market_id: number;
  order_id: number;
  nonce: number;
  signature: string;
}

// ── POST /accounts ──

export interface CreateAccountPayload {
  owner: string;
  signature: string;
  nonce: number;
}

export interface CreateAccountResponse {
  account_id: number;
}

// ── GET /accounts/{id}/balances ──

export interface TokenBalance {
  token_id: number;
  available: string;
  collateral: string;
  total: string;
}

export interface AccountBalancesResponse {
  account_id: number;
  balances: TokenBalance[];
}

// ── GET /accounts/{id}/nonce ──

export interface AccountNonceResponse {
  account_id: number;
  nonce: number;
}
