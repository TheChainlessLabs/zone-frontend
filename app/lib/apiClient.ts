import { config } from "./config";
import { ApiError } from "./apiError";
import { devLog, devError } from "./devLog";
import type {
  OrderBookResponse,
  TradesResponse,
  MarketOrdersResponse,
  CreateOrderPayload,
  CreateOrderResponse,
  CancelOrderPayload,
  CreateAccountPayload,
  CreateAccountResponse,
  AccountNonceResponse,
  AccountBalancesResponse,
} from "./apiTypes";

// In the browser, route through BFF proxy to avoid CORS and hide backend URL.
// On the server (SSR), call the backend directly for lower latency.
const BASE =
  typeof window !== "undefined"
    ? "/api/engine"
    : config.apiBaseUrl;

async function handleResponse<T>(res: Response, label?: string): Promise<T> {
  if (!res.ok) {
    const err = await ApiError.fromResponse(res);
    devError("api", `${label ?? "request"} failed: ${res.status} ${err.message}`);
    throw err;
  }
  devLog("api", `${label ?? "request"} → ${res.status}`);
  return res.json();
}

export async function getOrderBook(marketId: number): Promise<OrderBookResponse> {
  const res = await fetch(`${BASE}/markets/${marketId}/book`);
  return handleResponse<OrderBookResponse>(res, `GET /markets/${marketId}/book`);
}

export async function getTrades(marketId: number): Promise<TradesResponse> {
  const res = await fetch(`${BASE}/markets/${marketId}/trades`);
  return handleResponse<TradesResponse>(res, `GET /markets/${marketId}/trades`);
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  // price and quantity are u128 strings that exceed Number.MAX_SAFE_INTEGER.
  // JSON.stringify quotes them as strings, but backend expects raw JSON numbers.
  // We use a structured approach: build the object, then replace the quoted
  // numeric strings with raw numbers in the serialized output.
  const obj = {
    market_id: payload.market_id,
    side: payload.side,
    kind: payload.kind,
    price: `__BIGNUM_${payload.price}__`,
    quantity: `__BIGNUM_${payload.quantity}__`,
    extension: payload.extension,
    nonce: payload.nonce,
    signature: payload.signature,
  };
  const body = JSON.stringify(obj)
    .replace(/"__BIGNUM_(\d+)__"/g, "$1");

  devLog("api", `POST /orders — ${payload.side} ${payload.kind} price=${payload.price} qty=${payload.quantity} nonce=${payload.nonce}`);

  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const err = await ApiError.fromResponse(res);
    devError("api", `POST /orders failed: ${res.status} ${err.message}`);
    throw err;
  }
  const result = await res.json();
  devLog("api", `POST /orders → 201 order_id=${result.order_id}`);
  return result;
}

export async function cancelOrder(payload: CancelOrderPayload): Promise<void> {
  devLog("api", `POST /orders/cancel — order_id=${payload.order_id} nonce=${payload.nonce}`);
  const res = await fetch(`${BASE}/orders/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await ApiError.fromResponse(res);
    devError("api", `POST /orders/cancel failed: ${res.status} ${err.message}`);
    throw err;
  }
  devLog("api", `POST /orders/cancel → 204`);
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

export async function getMarketOrders(marketId: number): Promise<MarketOrdersResponse> {
  const res = await fetch(`${BASE}/markets/${marketId}/orders`);
  return handleResponse<MarketOrdersResponse>(res);
}

export async function getAccountNonce(accountId: number): Promise<AccountNonceResponse> {
  const res = await fetch(`${BASE}/accounts/${accountId}/nonce`);
  return handleResponse<AccountNonceResponse>(res);
}

export async function getAccountBalances(accountId: number): Promise<AccountBalancesResponse> {
  const res = await fetch(`${BASE}/accounts/${accountId}/balances`);
  return handleResponse<AccountBalancesResponse>(res);
}

export async function mockFund(accountId: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/accounts/${accountId}/fund`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await ApiError.fromResponse(res);
    devError("api", `POST /admin/accounts/${accountId}/fund failed: ${res.status} ${err.message}`);
    throw new Error(err.message || "Funding failed");
  }
  devLog("api", `POST /admin/accounts/${accountId}/fund → ${res.status}`);
}
