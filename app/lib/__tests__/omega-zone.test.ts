import { afterEach, describe, expect, it, vi } from "vitest";
import type { Address, Hex } from "viem";

import {
  OMEGA_ZONE_RPC_URLS,
  OMEGA_TEMPO_L1_CHAIN_ID,
  OMEGA_ZONE,
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  OMEGA_ZONE_RPC_PROXY_URLS,
  approveOalphaToDarkpoolRequest,
  approvePathUsdToDarkpoolRequest,
  approvePathUsdToPortalRequest,
  approveTokenToDarkpoolRequest,
  buildZoneRpcAuthToken,
  clearPersistedZoneRpcAuthToken,
  darkpoolCancelOrderRequest,
  darkpoolDepositRequest,
  darkpoolMarketBuyRequest,
  darkpoolMarketSellRequest,
  darkpoolPlaceOrderRequest,
  decodeZoneRpcAuthTokenFields,
  depositPathUsdToZoneRequest,
  encodeZoneRpcAuthFields,
  getZoneBatch,
  getZoneMarketConfig,
  getZoneMidpointHistory,
  getZoneMyFills,
  getZoneMyOrders,
  getZoneMyTransfers,
  getZoneOrder,
  getZoneTopOfBook,
  getZoneWithdrawalStatus,
  listZoneBatches,
  privateRpcFetch,
  publicRpcFetch,
  persistZoneRpcAuthToken,
  readPersistedZoneRpcAuthToken,
  searchZoneBatch,
  signAndSendPrivateZoneContractWrite,
  toBatchNumberHex,
  toRpcQuantity,
  zoneOutboxRequestWithdrawal,
  zonePrivateRpcUrl,
  zonePublicRpcUrl,
  zoneRpcAuthDigest,
} from "@/lib/omega-zone";
import type {
  ZoneMidpointHistoryResponse,
} from "@/lib/omega-zone";

const ACCOUNT =
  "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853" as Address;
const EXPECTED_FIELDS =
  "0x0000000023000000001922a1c300000000000000010000000000000002" as Hex;
const EXPECTED_DIGEST =
  "0x949455448f7a9e9d63892c01bab9b5f38d255bc7272377e3748f16d28b0c4463" as Hex;

afterEach(() => {
  vi.unstubAllGlobals();
  clearPersistedZoneRpcAuthToken();
});

describe("omega zone config", () => {
  it("pins the generated local zone identifiers", () => {
    expect(OMEGA_ZONE.zoneId).toBe(35);
    expect(OMEGA_ZONE.chainId).toBe(421700035);
    expect(OMEGA_ZONE.chainIdHex).toBe("0x1922a1c3");
    expect(OMEGA_ZONE_ADDRESSES.portal).toBe(
      "0xA6b5f8aF076DaAFBfd373a2629e4E46c8e03e6b2",
    );
    expect(OMEGA_ZONE_ADDRESSES.darkpool).toBe(
      "0x0b00000000000000000000000000000000000001",
    );
    expect(OMEGA_ZONE_ADDRESSES.pathUsd).toBe(
      "0x20c0000000000000000000000000000000000000",
    );
    expect(OMEGA_ZONE_ADDRESSES.oalpha).toBe(
      "0x20c000000000000000000000518ddadd37ed1d28",
    );
  });
});

describe("omega zone RPC routing", () => {
  it("routes browser RPC through same-origin proxies", () => {
    expect(zonePublicRpcUrl()).toBe(OMEGA_ZONE_RPC_PROXY_URLS.public);
    expect(zonePrivateRpcUrl()).toBe(OMEGA_ZONE_RPC_PROXY_URLS.private);
    expect(OMEGA_ZONE_RPC_URLS.publicBrowser).toBe(
      "https://omega-zone.example.com/",
    );
    expect(OMEGA_ZONE_RPC_URLS.privateBrowser).toBe(
      "https://omega-zone.example.com/private",
    );
    expect(OMEGA_ZONE_RPC_URLS.publicServer).toBe(
      "http://omega-zone-gateway:8080/",
    );
    expect(OMEGA_ZONE_RPC_URLS.privateServer).toBe(
      "http://omega-zone-gateway:8080/private",
    );
  });

  it("sends private RPC requests with the authorization token header", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ result: "0x2a" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await privateRpcFetch<Hex>("0x1234", {
      method: "zone_getAuthorizationTokenInfo",
      params: [],
    });

    expect(result).toBe("0x2a");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.private);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
      "x-authorization-token": "0x1234",
    });
    expect(JSON.parse(init.body as string)).toMatchObject({
      jsonrpc: "2.0",
      method: "zone_getAuthorizationTokenInfo",
      params: [],
    });
  });
});

describe("zone RPC auth token", () => {
  it("encodes token fields as version + zoneId + chainId + issuedAt + expiresAt", () => {
    expect(
      encodeZoneRpcAuthFields({
        issuedAt: BigInt(1),
        expiresAt: BigInt(2),
      }),
    ).toBe(EXPECTED_FIELDS);
  });

  it("hashes TempoZoneRPC padded to 32 bytes plus the token fields", () => {
    expect(zoneRpcAuthDigest(EXPECTED_FIELDS)).toBe(EXPECTED_DIGEST);
  });

  it("fallback-signs the raw 32-byte digest and appends the 29-byte fields", async () => {
    const signature = `0x${"11".repeat(65)}` as Hex;
    const signMessage = vi.fn(async () => signature);

    const token = await buildZoneRpcAuthToken({
      account: ACCOUNT,
      issuedAt: BigInt(1),
      expiresAt: BigInt(2),
      signMessage,
    });

    expect(signMessage).toHaveBeenCalledWith({
      account: ACCOUNT,
      message: { raw: EXPECTED_DIGEST },
    });
    expect(token).toBe(`${signature}${EXPECTED_FIELDS.slice(2)}`);
  });

  it("persists a valid token for reuse across app routes", () => {
    const fields = encodeZoneRpcAuthFields({
      issuedAt: BigInt(Math.floor(Date.now() / 1000)),
      expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60),
    });
    const token = `0x${"11".repeat(65)}${fields.slice(2)}` as Hex;

    persistZoneRpcAuthToken(token, ACCOUNT);

    expect(readPersistedZoneRpcAuthToken(ACCOUNT)).toBe(token);
    expect(
      readPersistedZoneRpcAuthToken(
        "0x0000000000000000000000000000000000000001",
      ),
    ).toBeNull();
  });

  it("rejects expired persisted auth tokens", () => {
    const fields = encodeZoneRpcAuthFields({
      issuedAt: BigInt(1),
      expiresAt: BigInt(2),
    });
    const token = `0x${"11".repeat(65)}${fields.slice(2)}` as Hex;

    persistZoneRpcAuthToken(token, ACCOUNT);

    expect(decodeZoneRpcAuthTokenFields(token).expiresAt).toBe(BigInt(2));
    expect(readPersistedZoneRpcAuthToken(ACCOUNT)).toBeNull();
  });

  it("prefers a native Tempo signer when the wallet exposes one", async () => {
    const signature = `0x${"22".repeat(72)}` as Hex;
    const signMessage = vi.fn(async () => {
      throw new Error("fallback should not run");
    });

    const token = await buildZoneRpcAuthToken({
      account: ACCOUNT,
      issuedAt: BigInt(1),
      expiresAt: BigInt(2),
      signMessage,
      nativeSigner: {
        signTempoZoneRpcAuthDigest: vi.fn(async () => signature),
      },
    });

    expect(signMessage).not.toHaveBeenCalled();
    expect(token).toBe(`${signature}${EXPECTED_FIELDS.slice(2)}`);
  });
});

describe("zone RPC helpers", () => {
  it("formats block numbers as JSON-RPC quantities", () => {
    expect(toRpcQuantity(421700035)).toBe("0x1922a1c3");
    expect(toRpcQuantity(BigInt(35))).toBe("0x23");
    expect(toRpcQuantity("0x2a")).toBe("0x2a");
  });

});

describe("zone contract requests", () => {
  it("builds the L1 approve + portal deposit requests", () => {
    const amount = BigInt(1_000_000);

    expect(approvePathUsdToPortalRequest(amount)).toMatchObject({
      chainId: OMEGA_TEMPO_L1_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.portal, amount],
    });
    expect(
      depositPathUsdToZoneRequest({
        to: ACCOUNT,
        amount,
      }),
    ).toMatchObject({
      chainId: OMEGA_TEMPO_L1_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.portal,
      functionName: "deposit",
      args: [
        OMEGA_ZONE_ADDRESSES.pathUsd,
        ACCOUNT,
        amount,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ],
    });
  });

  it("builds the zone approve + darkpool deposit requests", () => {
    const amount = BigInt(1_000_000);

    expect(approvePathUsdToDarkpoolRequest(amount)).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.darkpool, amount],
    });
    expect(darkpoolDepositRequest(amount)).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      functionName: "deposit",
      args: [OMEGA_ZONE_ADDRESSES.pathUsd, amount],
    });
    expect(approveOalphaToDarkpoolRequest(amount)).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.oalpha,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.darkpool, amount],
    });
    expect(
      approveTokenToDarkpoolRequest(OMEGA_ZONE_ADDRESSES.oalpha, amount),
    ).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.oalpha,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.darkpool, amount],
    });
  });

  it("pins darkpool place/market/cancel + zone outbox withdrawal to the zone chainId", () => {
    expect(
      darkpoolPlaceOrderRequest({
        base: OMEGA_ZONE_ADDRESSES.oalpha,
        amount: BigInt(2_000_000),
        price: BigInt(1),
        isBid: true,
      }),
    ).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      functionName: "place",
    });
    expect(
      darkpoolMarketBuyRequest({
        base: OMEGA_ZONE_ADDRESSES.oalpha,
        amount: BigInt(2_000_000),
        maxQuoteIn: BigInt(2_000_000),
      }),
    ).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      functionName: "marketBuy",
    });
    expect(
      darkpoolMarketSellRequest({
        base: OMEGA_ZONE_ADDRESSES.oalpha,
        amount: BigInt(2_000_000),
        minQuoteOut: BigInt(2_000_000),
      }),
    ).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      functionName: "marketSell",
    });
    expect(darkpoolCancelOrderRequest(BigInt(7))).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      functionName: "cancel",
    });
    expect(
      zoneOutboxRequestWithdrawal({
        to: ACCOUNT,
        amount: BigInt(1_000_000),
        gasLimit: BigInt(250_000),
        fallbackRecipient: ACCOUNT,
      }),
    ).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.zoneOutbox,
      functionName: "requestWithdrawal",
    });
  });
});

describe("zone write submission uses Tempo access-key raw transactions", () => {
  const SIGNED_TX = `0x${"cc".repeat(120)}` as Hex;
  const TX_HASH = `0x${"dd".repeat(32)}` as Hex;
  const ACCESS_KEY_ADDRESS =
    "0x00000000000000000000000000000000000000aa" as Address;

  function rpcResponse(result: string) {
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  function mockPrivateRpcSequence() {
    return vi
      .fn()
      .mockResolvedValueOnce(rpcResponse("0x5208")) // eth_estimateGas
      .mockResolvedValueOnce(rpcResponse(TX_HASH)); // eth_sendRawTransaction
  }

  function makeAccessKeySigner() {
    let accessKeys: readonly unknown[] = [];
    const signer = {
      request: vi.fn(
        async ({
          method,
          params,
        }: {
          method: string;
          params?: readonly unknown[];
        }) => {
          if (method !== "wallet_authorizeAccessKey") {
            throw new Error(`Unexpected wallet method ${method}`);
          }
          const [request] = params as readonly [
            {
              limits: readonly unknown[];
              scopes: readonly unknown[];
            },
          ];
          accessKeys = [
            {
              access: ACCOUNT,
              address: ACCESS_KEY_ADDRESS,
              keyPair: {},
              keyAuthorization: { chainId: BigInt(OMEGA_ZONE_CHAIN_ID) },
              limits: request.limits,
              scopes: request.scopes,
            },
          ];
        },
      ),
      store: {
        getState: vi.fn(() => ({ accessKeys })),
        setState: vi.fn((state: { accessKeys?: readonly unknown[] }) => {
          accessKeys = state.accessKeys ?? [];
        }),
      },
      getZoneTransactionDefaults: vi.fn(async () => ({
        chainId: OMEGA_ZONE_CHAIN_ID,
        nonce: 9,
        maxFeePerGas: BigInt(1_000_000_000),
        maxPriorityFeePerGas: BigInt(1_000_000),
      })),
      signTempoTransaction: vi.fn(async () => SIGNED_TX),
    };
    return signer;
  }

  const zoneWrites = [
    {
      label: "darkpool limit place",
      request: () =>
        darkpoolPlaceOrderRequest({
          base: OMEGA_ZONE_ADDRESSES.oalpha,
          amount: BigInt(2_000_000),
          price: BigInt(1),
          isBid: true,
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
    },
    {
      label: "darkpool market buy",
      request: () =>
        darkpoolMarketBuyRequest({
          base: OMEGA_ZONE_ADDRESSES.oalpha,
          amount: BigInt(2_000_000),
          maxQuoteIn: BigInt(2_000_000),
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
    },
    {
      label: "darkpool market sell",
      request: () =>
        darkpoolMarketSellRequest({
          base: OMEGA_ZONE_ADDRESSES.oalpha,
          amount: BigInt(2_000_000),
          minQuoteOut: BigInt(2_000_000),
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
    },
    {
      label: "zone outbox withdrawal",
      request: () =>
        zoneOutboxRequestWithdrawal({
          to: ACCOUNT,
          amount: BigInt(1_000_000),
          gasLimit: BigInt(250_000),
          fallbackRecipient: ACCOUNT,
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.zoneOutbox,
    },
  ] as const;

  it.each(zoneWrites)(
    "$label: estimates via private RPC, signs with a Tempo access key, broadcasts via eth_sendRawTransaction",
    async ({ request, expectedTo }) => {
      const signer = makeAccessKeySigner();
      const fetchMock = mockPrivateRpcSequence();
      vi.stubGlobal("fetch", fetchMock);

      const txHash = await signAndSendPrivateZoneContractWrite({
        authToken: "0x1234",
        signer: signer as unknown as Parameters<
          typeof signAndSendPrivateZoneContractWrite
        >[0]["signer"],
        account: ACCOUNT,
        request: request(),
      });

      expect(txHash).toBe(TX_HASH);

      const calls = fetchMock.mock.calls.map(([url, init]) => ({
        url: url as string,
        body: JSON.parse((init as RequestInit).body as string) as {
          method: string;
          params?: readonly unknown[];
        },
        headers: (init as RequestInit).headers,
      }));

      // Private-RPC sequence is the contract — no wallet-hosted tx method and
      // no third-party RPC must ever see a zone write.
      expect(calls.map((call) => call.body.method)).toEqual([
        "eth_estimateGas",
        "eth_sendRawTransaction",
      ]);
      for (const call of calls) {
        expect(call.url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.private);
        expect(call.headers).toMatchObject({
          "x-authorization-token": "0x1234",
        });
        expect(call.body.method).not.toBe("eth_sendTransaction");
        expect(call.body.method).not.toBe("eth_signTransaction");
      }

      // Wallet only authorizes a scoped Tempo access key. It does not host
      // eth_sendTransaction or eth_signTransaction for zone writes.
      expect(signer.request).toHaveBeenCalledOnce();
      const [accessKeyCall] = signer.request.mock.calls[0] as unknown as [
        { method: string; params?: readonly unknown[] },
      ];
      expect(accessKeyCall.method).toBe("wallet_authorizeAccessKey");
      expect(accessKeyCall.method).not.toBe("eth_signTransaction");
      expect(accessKeyCall.method).not.toBe("eth_sendTransaction");
      expect(signer.signTempoTransaction).toHaveBeenCalledOnce();
      expect(signer.signTempoTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          account: ACCOUNT,
          chainId: OMEGA_ZONE_CHAIN_ID,
          nonce: 9,
          to: expectedTo,
          maxFeePerGas: BigInt(1_000_000_000),
          maxPriorityFeePerGas: BigInt(1_000_000),
          keyAuthorization: { chainId: BigInt(OMEGA_ZONE_CHAIN_ID) },
        }),
      );

      // The raw broadcast carries exactly what the wallet returned.
      expect(calls[1].body.params).toEqual([SIGNED_TX]);
    },
  );
});

describe("zone RPC method wrappers", () => {
  const OTHER_ACCOUNT =
    "0x000000000000000000000000000000000000beef" as Address;
  const AUTH_TOKEN = "0xfeed" as Hex;

  function rpcResponse(result: unknown) {
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  function mockFetchOnce(result: unknown) {
    const fetchMock = vi.fn(async () => rpcResponse(result));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  function parseRequest(fetchMock: ReturnType<typeof vi.fn>, index = 0) {
    const [url, init] = fetchMock.mock.calls[index] as unknown as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(init.body as string) as {
      jsonrpc: string;
      method: string;
      params: readonly unknown[];
    };
    return { url, headers: init.headers, body };
  }

  it("zone_getMarketConfig is sent over private RPC with no params", async () => {
    const fetchMock = mockFetchOnce({ darkpool: OMEGA_ZONE_ADDRESSES.darkpool, markets: [] });
    await getZoneMarketConfig(AUTH_TOKEN);
    const { url, headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getMarketConfig");
    expect(body.params).toEqual([]);
    expect(url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.private);
    expect(headers).toMatchObject({ "x-authorization-token": AUTH_TOKEN });
  });

  it("zone_getTopOfBook forwards { base, quote } over private RPC", async () => {
    const fetchMock = mockFetchOnce({
      pair: "OALPHA/PATHUSD",
      base: OMEGA_ZONE_ADDRESSES.oalpha,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      bid: null,
      ask: null,
      midpoint: null,
      spread: null,
      asOfBlock: "0x1",
    });
    await getZoneTopOfBook(AUTH_TOKEN, {
      base: OMEGA_ZONE_ADDRESSES.oalpha,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
    });
    const { headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getTopOfBook");
    expect(body.params).toEqual([
      {
        base: OMEGA_ZONE_ADDRESSES.oalpha,
        quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      },
    ]);
    expect(headers).toMatchObject({ "x-authorization-token": AUTH_TOKEN });
  });

  it("zone_getMyOrders defaults to the authenticated account and strips undefined params", async () => {
    const fetchMock = mockFetchOnce({ items: [] });
    await getZoneMyOrders(AUTH_TOKEN, ACCOUNT);
    const { body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getMyOrders");
    expect(body.params).toEqual([{ account: ACCOUNT }]);
  });

  it("zone_getMyOrders forwards filters and pagination when supplied", async () => {
    const fetchMock = mockFetchOnce({ items: [], nextCursor: "next" });
    await getZoneMyOrders(AUTH_TOKEN, ACCOUNT, {
      pair: "OALPHA/PATHUSD",
      status: "open",
      cursor: "abc",
      limit: 10,
    });
    const { body } = parseRequest(fetchMock);
    expect(body.params).toEqual([
      {
        account: ACCOUNT,
        pair: "OALPHA/PATHUSD",
        status: "open",
        cursor: "abc",
        limit: 10,
      },
    ]);
  });

  it("zone_getMyOrders rejects callers passing a different account", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      getZoneMyOrders(AUTH_TOKEN, ACCOUNT, { account: OTHER_ACCOUNT }),
    ).rejects.toThrow(/does not match the authenticated account/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("zone_getMyFills and zone_getMyTransfers default to the authenticated account", async () => {
    const fillsMock = mockFetchOnce({ items: [] });
    await getZoneMyFills(AUTH_TOKEN, ACCOUNT);
    const fillsBody = parseRequest(fillsMock).body;
    expect(fillsBody.method).toBe("zone_getMyFills");
    expect(fillsBody.params).toEqual([{ account: ACCOUNT }]);

    vi.unstubAllGlobals();
    const transfersMock = mockFetchOnce({ items: [] });
    await getZoneMyTransfers(AUTH_TOKEN, ACCOUNT, { cursor: "c", limit: 5 });
    const transfersBody = parseRequest(transfersMock).body;
    expect(transfersBody.method).toBe("zone_getMyTransfers");
    expect(transfersBody.params).toEqual([
      { account: ACCOUNT, cursor: "c", limit: 5 },
    ]);
  });

  it("zone_getMyFills and zone_getMyTransfers reject mismatched accounts before RPC", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      getZoneMyFills(AUTH_TOKEN, ACCOUNT, { account: OTHER_ACCOUNT }),
    ).rejects.toThrow(/does not match the authenticated account/);
    await expect(
      getZoneMyTransfers(AUTH_TOKEN, ACCOUNT, { account: OTHER_ACCOUNT }),
    ).rejects.toThrow(/does not match the authenticated account/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("zone_getOrder forwards the orderId as a hex quantity over private RPC", async () => {
    const fetchMock = mockFetchOnce({ orderId: "42" });
    await getZoneOrder(AUTH_TOKEN, 42);
    const { headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getOrder");
    expect(body.params).toEqual(["0x2a"]);
    expect(headers).toMatchObject({ "x-authorization-token": AUTH_TOKEN });
  });

  it("zone_getWithdrawalStatus forwards the lookup key over private RPC", async () => {
    const fetchMock = mockFetchOnce({ withdrawalIndex: "1" });
    await getZoneWithdrawalStatus(AUTH_TOKEN, "0xabc");
    const { body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getWithdrawalStatus");
    expect(body.params).toEqual(["0xabc"]);
  });

  it("zone_listBatches uses the browser public RPC proxy without an auth header and omits empty pagination", async () => {
    const fetchMock = mockFetchOnce({ batches: [] });
    await listZoneBatches();
    const { url, headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_listBatches");
    expect(body.params).toEqual([]);
    expect(url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.public);
    expect(headers as Record<string, string>).not.toHaveProperty(
      "x-authorization-token",
    );
  });

  it("zone_listBatches forwards pagination object when supplied", async () => {
    const fetchMock = mockFetchOnce({ batches: [], nextCursor: "next" });
    await listZoneBatches({ cursor: "abc", limit: 2 });
    const { body } = parseRequest(fetchMock);
    expect(body.params).toEqual([{ cursor: "abc", limit: 2 }]);
  });

  it("zone_getBatch converts a numeric batch number to an RPC hex quantity", async () => {
    const fetchMock = mockFetchOnce({ batchNumber: "123" });
    await getZoneBatch(123);
    const { url, headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getBatch");
    expect(body.params).toEqual(["0x7b"]);
    expect(url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.public);
    expect(headers as Record<string, string>).not.toHaveProperty(
      "x-authorization-token",
    );
    expect(toBatchNumberHex(123)).toBe("0x7b");
    expect(toBatchNumberHex(BigInt(35))).toBe("0x23");
    expect(toBatchNumberHex("0x2a")).toBe("0x2a");
  });

  it("zone_searchBatch sends the raw query over public RPC", async () => {
    const fetchMock = mockFetchOnce(null);
    await searchZoneBatch("0xdeadbeef");
    const { url, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_searchBatch");
    expect(body.params).toEqual(["0xdeadbeef"]);
    expect(url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.public);
  });

  it("zone_getMidpointHistory forwards interval/cursor/limit and is sent over private RPC", async () => {
    const fetchMock = mockFetchOnce({
      pair: "OALPHA/PATHUSD",
      base: OMEGA_ZONE_ADDRESSES.oalpha,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      interval: "1m",
      samples: [],
      history: { enabled: true },
    });
    await getZoneMidpointHistory(AUTH_TOKEN, {
      base: OMEGA_ZONE_ADDRESSES.oalpha,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      interval: "1m",
      cursor: "c",
      limit: 50,
    });
    const { headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getMidpointHistory");
    expect(body.params).toEqual([
      {
        base: OMEGA_ZONE_ADDRESSES.oalpha,
        quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      },
      "1m",
      50,
      "c",
    ]);
    expect(headers).toMatchObject({ "x-authorization-token": AUTH_TOKEN });
  });

  it("zone_getMidpointHistory does not throw when the backend reports history disabled", async () => {
    mockFetchOnce({
      pair: "OALPHA/PATHUSD",
      base: OMEGA_ZONE_ADDRESSES.oalpha,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      interval: "1m",
      samples: [],
      history: { enabled: false, reason: "history-disabled" },
    });
    const result: ZoneMidpointHistoryResponse = await getZoneMidpointHistory(
      AUTH_TOKEN,
      {
        base: OMEGA_ZONE_ADDRESSES.oalpha,
        quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      },
    );
    expect(result.history).toEqual({
      enabled: false,
      reason: "history-disabled",
    });
    expect(result.samples).toEqual([]);
  });

  it("publicRpcFetch surfaces RPC errors as thrown Error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: { message: "batch not found", code: -32004 } }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    await expect(
      publicRpcFetch({ method: "zone_getBatch", params: ["0x1"] }),
    ).rejects.toThrow("batch not found");
  });
});
