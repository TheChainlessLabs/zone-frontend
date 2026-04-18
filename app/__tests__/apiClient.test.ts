import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError } from "../lib/apiError";
import type { CreateOrderPayload, CancelOrderPayload, CreateAccountPayload } from "../lib/apiTypes";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const API_BASE_URL = "http://127.0.0.1:3001";
// In jsdom (browser-like) environment, apiClient routes through the BFF proxy.
const EXPECTED_BASE = "/api/engine";
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

async function loadApiClient() {
  vi.resetModules();
  return import("../lib/apiClient");
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: "OK",
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    statusText: "Error",
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;
  process.env.NEXT_PUBLIC_BRIDGE_ADDRESS =
    "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  mockFetch.mockReset();
});

afterEach(() => {
  if (originalApiUrl === undefined) {
    delete process.env.NEXT_PUBLIC_API_URL;
    return;
  }

  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

describe("apiClient config", () => {
  it("requires NEXT_PUBLIC_API_URL", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    await expect(loadApiClient()).rejects.toThrow(
      "Missing required environment variable: NEXT_PUBLIC_API_URL",
    );
  });

  it("routes through BFF proxy in browser environment", async () => {
    process.env.NEXT_PUBLIC_API_URL = `${API_BASE_URL}/`;
    mockFetch.mockResolvedValue(jsonResponse({ market_id: 1, bids: [], asks: [] }));

    const { getOrderBook } = await loadApiClient();
    await getOrderBook(1);

    // In jsdom (browser), BASE is /api/engine regardless of env var
    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/markets/1/book`);
  });
});

describe("getOrderBook", () => {
  it("fetches GET /markets/{id}/book", async () => {
    const data = { market_id: 1, bids: [], asks: [] };
    mockFetch.mockResolvedValue(jsonResponse(data));

    const { getOrderBook } = await loadApiClient();
    const result = await getOrderBook(1);

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/markets/1/book`);
    expect(result).toEqual(data);
  });

  it("throws ApiError on failure", async () => {
    mockFetch.mockResolvedValue(errorResponse("not found", 404));

    const { getOrderBook } = await loadApiClient();

    await expect(getOrderBook(999)).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "not found",
    });
  });
});

describe("getTrades", () => {
  it("fetches GET /markets/{id}/trades", async () => {
    const data = { market_id: 1, trades: [] };
    mockFetch.mockResolvedValue(jsonResponse(data));

    const { getTrades } = await loadApiClient();
    const result = await getTrades(1);

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/markets/1/trades`);
    expect(result).toEqual(data);
  });
});

describe("createOrder", () => {
  const payload: CreateOrderPayload = {
    market_id: 1,
    side: "Buy",
    kind: "Limit",
    price: "1085600000000000000",
    quantity: "100000000",
    extension: null,
    nonce: 1,
    signature: "0xabc",
  };

  it("POSTs to /orders with correct body", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ order_id: 7 }, 201));

    const { createOrder } = await loadApiClient();
    const result = await createOrder(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      `${EXPECTED_BASE}/orders`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    // Verify the body contains the correct values as raw JSON numbers (not quoted strings)
    const callBody = mockFetch.mock.calls[0][1].body;
    expect(callBody).toContain('"market_id":1');
    expect(callBody).toContain('"side":"Buy"');
    expect(callBody).toContain('"kind":"Limit"');
    expect(callBody).toContain('"nonce":1');
    // Price and quantity are sent as raw JSON numbers, not quoted strings
    expect(callBody).toContain(':1085600000000000000,');
    expect(callBody).toContain(':100000000,');
    expect(result).toEqual({ order_id: 7 });
  });

  it("throws ApiError on 400", async () => {
    mockFetch.mockResolvedValue(errorResponse("insufficient balance", 400));

    const { createOrder } = await loadApiClient();

    await expect(createOrder(payload)).rejects.toMatchObject({
      status: 400,
      message: "insufficient balance",
    });
  });
});

describe("cancelOrder", () => {
  const payload: CancelOrderPayload = {
    market_id: 1,
    order_id: 7,
    nonce: 2,
    signature: "0xdef",
  };

  it("POSTs to /orders/cancel and handles 204", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204, statusText: "No Content" }));

    const { cancelOrder } = await loadApiClient();

    await expect(cancelOrder(payload)).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/orders/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  });

  it("throws ApiError on failure", async () => {
    mockFetch.mockResolvedValue(errorResponse("order not found", 404));

    const { cancelOrder } = await loadApiClient();

    await expect(cancelOrder(payload)).rejects.toMatchObject({ status: 404 });
  });
});

describe("getMarketOrders", () => {
  it("fetches GET /markets/{id}/orders", async () => {
    const data = { market_id: 1, orders: [] };
    mockFetch.mockResolvedValue(jsonResponse(data));

    const { getMarketOrders } = await loadApiClient();
    const result = await getMarketOrders(1);

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/markets/1/orders`);
    expect(result).toEqual(data);
  });

  it("throws ApiError on failure", async () => {
    mockFetch.mockResolvedValue(errorResponse("not found", 404));

    const { getMarketOrders } = await loadApiClient();

    await expect(getMarketOrders(999)).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "not found",
    });
  });
});

describe("getAccountNonce", () => {
  it("fetches GET /accounts/{id}/nonce", async () => {
    const data = { account_id: 1, nonce: 5 };
    mockFetch.mockResolvedValue(jsonResponse(data));

    const { getAccountNonce } = await loadApiClient();
    const result = await getAccountNonce(1);

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/accounts/1/nonce`);
    expect(result).toEqual(data);
  });

  it("throws ApiError on 404", async () => {
    mockFetch.mockResolvedValue(errorResponse("Account not found", 404));

    const { getAccountNonce } = await loadApiClient();

    await expect(getAccountNonce(999)).rejects.toMatchObject({ status: 404 });
  });
});

describe("getAccountBalances", () => {
  it("fetches GET /accounts/{id}/balances", async () => {
    const data = {
      account_id: 1,
      balances: [
        { token_id: 1, available: "10000000000", collateral: "0", total: "10000000000" },
      ],
    };
    mockFetch.mockResolvedValue(jsonResponse(data));

    const { getAccountBalances } = await loadApiClient();
    const result = await getAccountBalances(1);

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/accounts/1/balances`);
    expect(result).toEqual(data);
  });

  it("throws ApiError on 404", async () => {
    mockFetch.mockResolvedValue(errorResponse("Account not found", 404));

    const { getAccountBalances } = await loadApiClient();

    await expect(getAccountBalances(999)).rejects.toMatchObject({ status: 404 });
  });
});

describe("createAccount", () => {
  const payload: CreateAccountPayload = {
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    signature: "0xsig",
    nonce: 0,
  };

  it("POSTs to /accounts with correct body", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ account_id: 1 }, 201));

    const { createAccount } = await loadApiClient();
    const result = await createAccount(payload);

    expect(mockFetch).toHaveBeenCalledWith(`${EXPECTED_BASE}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ account_id: 1 });
  });

  it("throws ApiError on 409 conflict", async () => {
    mockFetch.mockResolvedValue(errorResponse("account already exists", 409));

    const { createAccount } = await loadApiClient();

    await expect(createAccount(payload)).rejects.toMatchObject({
      status: 409,
      message: "account already exists",
    });
  });

  it("throws ApiError on 500", async () => {
    mockFetch.mockResolvedValue(errorResponse("internal error", 500));

    const { createAccount } = await loadApiClient();

    await expect(createAccount(payload)).rejects.toMatchObject({
      status: 500,
    });
  });
});

describe("mockFund", () => {
  it("POSTs to /admin/accounts/{id}/fund with no body", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204, statusText: "No Content" }));

    const { mockFund } = await loadApiClient();

    await expect(mockFund("42")).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith(
      `${EXPECTED_BASE}/admin/accounts/42/fund`,
      { method: "POST" },
    );
  });
});
