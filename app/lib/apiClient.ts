import { config } from "./config";
import { ApiError } from "./apiError";
import type {
  OrderBookResponse,
  TradesResponse,
  CreateOrderPayload,
  CreateOrderResponse,
  CancelOrderPayload,
  CreateAccountPayload,
  CreateAccountResponse,
  AccountNonceResponse,
  AccountBalancesResponse,
} from "./apiTypes";

const BASE = config.apiBaseUrl;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await ApiError.fromResponse(res);
  return res.json();
}

export async function getOrderBook(marketId: number): Promise<OrderBookResponse> {
  const res = await fetch(`${BASE}/markets/${marketId}/book`);
  return handleResponse<OrderBookResponse>(res);
}

export async function getTrades(marketId: number): Promise<TradesResponse> {
  const res = await fetch(`${BASE}/markets/${marketId}/trades`);
  return handleResponse<TradesResponse>(res);
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await ApiError.fromResponse(res);
  return res.json();
}

export async function cancelOrder(payload: CancelOrderPayload): Promise<void> {
  const res = await fetch(`${BASE}/orders/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await ApiError.fromResponse(res);
}

export async function createAccount(payload: CreateAccountPayload): Promise<CreateAccountResponse> {
  const res = await fetch(`${BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await ApiError.fromResponse(res);
  return res.json();
}

export async function getAccountNonce(accountId: number): Promise<AccountNonceResponse> {
  const res = await fetch(`${BASE}/accounts/${accountId}/nonce`);
  return handleResponse<AccountNonceResponse>(res);
}

export async function getAccountBalances(accountId: number): Promise<AccountBalancesResponse> {
  const res = await fetch(`${BASE}/accounts/${accountId}/balances`);
  return handleResponse<AccountBalancesResponse>(res);
}
