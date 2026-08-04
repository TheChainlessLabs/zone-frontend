import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TransactionReceiptNotFoundError,
  hashTypedData,
  serializeTypedData,
  toFunctionSelector,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";

import {
  OMEGA_ZONE_RPC_URLS,
  OMEGA_TEMPO_L1_CHAIN_ID,
  OMEGA_ZONE,
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  OMEGA_ZONE_RPC_PROXY_URLS,
  approveAlphaUsdToDarkpoolRequest,
  approvePathUsdToDarkpoolRequest,
  approvePathUsdToPortalRequest,
  approveTokenToDarkpoolRequest,
  buildZoneRpcAuthToken,
  buildZoneRpcAuthTypedData,
  bufferTempoGasEstimate,
  clearPersistedZoneRpcAuthToken,
  darkpoolCancelOrderRequest,
  darkpoolDepositRequest,
  darkpoolMarketBuyRequest,
  darkpoolMarketSellRequest,
  darkpoolPlaceOrderRequest,
  decodeZoneRpcAuthTokenFields,
  depositPathUsdToZoneRequest,
  encodeZoneRpcAuthFields,
  ensurePrivateZoneTradeBalance,
  ensureZoneSessionAccessKey,
  formatNetworkFeeUsd,
  isZoneAuthError,
  isZoneRpcAuthTokenExpired,
  ZoneRpcHttpError,
  ZoneRpcError,
  ZONE_TRANSACTION_RECEIPT_TIMEOUT_MS,
  getZoneBatch,
  getZoneMarketConfig,
  getZoneMidpointHistory,
  getZoneMyActivity,
  getZoneMyFills,
  getZoneMyOrders,
  getZoneMyTransfers,
  getZoneOrder,
  getOrCreateZoneRpcAuthToken,
  getZoneTopOfBook,
  getZoneWithdrawalStatus,
  listZoneBatches,
  privateRpcFetch,
  publicZoneClient,
  publicRpcFetch,
  persistZoneRpcAuthToken,
  pathUsdPermitTypedData,
  permitPathUsdToPortalRequest,
  readPersistedZoneRpcAuthToken,
  readPrivateZoneWithdrawalFee,
  resolveZoneTransactionSigner,
  searchZoneBatch,
  signAndSendPrivateZoneContractWrite,
  TEMPO_L1_GAS_PRICE_DECIMALS,
  toBatchNumberHex,
  toRpcQuantity,
  requestToCall,
  zoneOutboxRequestWithdrawal,
  zonePrivateRpcUrl,
  zonePublicRpcUrl,
  zoneRpcAuthDigest,
  ZoneTransactionSignerUnavailableError,
  waitForZoneTransactionReceipt,
  verifyOmegaZoneAuthToken,
  zoneSessionAccessKeyAuthorizationRequest,
} from "@/lib/omega-zone";
import type {
  ZoneMidpointHistoryResponse,
} from "@/lib/omega-zone";

const ACCOUNT =
  "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853" as Address;
const EXPECTED_FIELDS =
  "0x0100000023000000001922a1c300000000000000010000000000000002" as Hex;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
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
    expect(OMEGA_ZONE_ADDRESSES.alphaUsd).toBe(
      "0x20c0000000000000000000000000000000000001",
    );
  });
});

describe("omega zone RPC routing", () => {
  it("routes browser RPC through same-origin proxies", () => {
    expect(zonePublicRpcUrl()).toBe(OMEGA_ZONE_RPC_PROXY_URLS.public);
    expect(zonePrivateRpcUrl()).toBe(OMEGA_ZONE_RPC_PROXY_URLS.private);
    expect(OMEGA_ZONE_RPC_URLS.publicBrowser).toBe(
      "http://localhost:8546",
    );
    expect(OMEGA_ZONE_RPC_URLS.privateBrowser).toBe(
      "http://localhost:8544",
    );
    expect(OMEGA_ZONE_RPC_URLS.publicServer).toBe(
      "http://localhost:8546",
    );
    expect(OMEGA_ZONE_RPC_URLS.privateServer).toBe(
      "http://localhost:8544",
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

  it("includes proxy failure details in private RPC errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: "Omega Zone RPC upstream is unavailable.",
            detail: "http://localhost:8544: connect ECONNREFUSED",
          }),
          {
            status: 502,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    await expect(
      privateRpcFetch<Hex>("0x1234", {
        method: "zone_getAuthorizationTokenInfo",
        params: [],
      }),
    ).rejects.toThrow(
      "Private zone RPC failed with HTTP 502: http://localhost:8544: connect ECONNREFUSED",
    );
  });

  it("preserves private JSON-RPC error codes and data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              code: -32007,
              message: "Activity index not ready",
              data: { status: "backfilling" },
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const error = await privateRpcFetch("0x1234", {
      method: "zone_getMyActivity",
      params: [{}],
    }).catch((caught) => caught);
    expect(error).toBeInstanceOf(ZoneRpcError);
    expect(error).toMatchObject({
      code: -32007,
      message: "Activity index not ready",
      data: { status: "backfilling" },
    });
  });

  it("verifies the token account and configured zone metadata", async () => {
    vi.stubGlobal(
      "fetch",
      mockZoneSessionFetch({
        account: ACCOUNT,
        zoneId: OMEGA_ZONE.zoneId,
        chainId: OMEGA_ZONE.chainId,
      }),
    );

    await expect(
      verifyOmegaZoneAuthToken({ authToken: "0x1234", account: ACCOUNT }),
    ).resolves.toMatchObject({
      authorization: { account: ACCOUNT },
      zone: {
        zoneId: numberToQuantity(OMEGA_ZONE.zoneId),
        chainId: numberToQuantity(OMEGA_ZONE.chainId),
      },
    });
  });

  it("rejects a token recovered to a different account", async () => {
    vi.stubGlobal(
      "fetch",
      mockZoneSessionFetch({
        account: "0x0000000000000000000000000000000000000001",
        zoneId: OMEGA_ZONE.zoneId,
        chainId: OMEGA_ZONE.chainId,
      }),
    );

    await expect(
      verifyOmegaZoneAuthToken({ authToken: "0x1234", account: ACCOUNT }),
    ).rejects.toThrow("different wallet account");
  });

  it("rejects private RPC metadata for a different zone", async () => {
    vi.stubGlobal(
      "fetch",
      mockZoneSessionFetch({
        account: ACCOUNT,
        zoneId: OMEGA_ZONE.zoneId + 1,
        chainId: OMEGA_ZONE.chainId,
      }),
    );

    await expect(
      verifyOmegaZoneAuthToken({ authToken: "0x1234", account: ACCOUNT }),
    ).rejects.toThrow("metadata mismatch");
  });
});

function mockZoneSessionFetch({
  account,
  zoneId,
  chainId,
}: {
  account: string;
  zoneId: number;
  chainId: number;
}) {
  return vi.fn(async (_url: string, init?: RequestInit) => {
    const request = JSON.parse(String(init?.body)) as { method: string };
    const result =
      request.method === "zone_getAuthorizationTokenInfo"
        ? { account, expiresAt: "0xffffffff" }
        : {
            zoneId: numberToQuantity(zoneId),
            chainId: numberToQuantity(chainId),
            zoneTokens: [],
          };
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

function numberToQuantity(value: number): Hex {
  return `0x${value.toString(16)}` as Hex;
}

describe("network fee formatting", () => {
  it("buffers the observed portal deposit estimate above the failed fixed limit", () => {
    const observedEstimate = BigInt(1_085_585);

    expect(bufferTempoGasEstimate(observedEstimate)).toBe(BigInt(1_461_260));
    expect(bufferTempoGasEstimate(observedEstimate)).toBeGreaterThan(
      BigInt(900_000),
    );
  });

  it("formats Tempo L1 gas fees with 18-decimal gas price units", () => {
    expect(
      formatNetworkFeeUsd(
        BigInt("30704107247020000"),
        TEMPO_L1_GAS_PRICE_DECIMALS,
      ),
    ).toBe("$0.0307");
  });

  it("keeps Omega Zone native fee display on 6-decimal USD units", () => {
    expect(formatNetworkFeeUsd(BigInt(12_345))).toBe("$0.0123");
  });
});

describe("zone transaction signer resolution", () => {
  it("resolves a connector provider with the requested zone chain", async () => {
    const signer = { request: vi.fn(async () => "0x1") };
    const connector = {
      getProvider: vi.fn(async () => signer),
    };

    await expect(
      resolveZoneTransactionSigner({
        connector,
        chainId: OMEGA_ZONE_CHAIN_ID,
      }),
    ).resolves.toBe(signer);
    expect(connector.getProvider).toHaveBeenCalledWith({
      chainId: OMEGA_ZONE_CHAIN_ID,
    });
  });

  it("retries connector provider resolution without a chain hint", async () => {
    const signer = { request: vi.fn(async () => "0x1") };
    const connector = {
      getProvider: vi
        .fn()
        .mockRejectedValueOnce(new Error("chain hint unsupported"))
        .mockResolvedValueOnce(signer),
    };

    await expect(
      resolveZoneTransactionSigner({
        connector,
        chainId: OMEGA_ZONE_CHAIN_ID,
      }),
    ).resolves.toBe(signer);
    expect(connector.getProvider.mock.calls).toEqual([
      [{ chainId: OMEGA_ZONE_CHAIN_ID }],
      [],
    ]);
  });

  it("falls back to a wallet client when the connector has no getProvider method", async () => {
    const fallback = { request: vi.fn(async () => "0x1") };

    await expect(
      resolveZoneTransactionSigner({
        connector: { id: "xyz.tempo", name: "Tempo Wallet" },
        fallback,
        chainId: OMEGA_ZONE_CHAIN_ID,
      }),
    ).resolves.toBe(fallback);
  });

  it("throws a typed unavailable error instead of calling a missing connector method", async () => {
    await expect(
      resolveZoneTransactionSigner({
        connector: { id: "xyz.tempo", name: "Tempo Wallet" },
        chainId: OMEGA_ZONE_CHAIN_ID,
      }),
    ).rejects.toBeInstanceOf(ZoneTransactionSignerUnavailableError);
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

  it("hashes the EIP-712 auth typed data for the token fields", () => {
    expect(zoneRpcAuthDigest(EXPECTED_FIELDS)).toBe(
      hashTypedData(
        buildZoneRpcAuthTypedData({
          zoneId: OMEGA_ZONE.zoneId,
          chainId: OMEGA_ZONE.chainId,
          issuedAt: BigInt(1),
          expiresAt: BigInt(2),
        }),
      ),
    );
  });

  it("matches the Rust zone verifier EIP-712 reference vector", () => {
    const fields = encodeZoneRpcAuthFields({
      zoneId: 10,
      chainId: 421700010,
      issuedAt: 1_700_000_000,
      expiresAt: 1_700_000_600,
    });

    expect(zoneRpcAuthDigest(fields)).toBe(
      "0x938c4a868d932fca1550d00c9afe8c6ef6aaa93b0057e27be7511f653035a7b9",
    );
  });

  it("signs typed data and appends the 29-byte fields", async () => {
    const signature = `0x${"11".repeat(65)}` as Hex;
    const provider = { request: vi.fn(async () => signature) };

    const token = await buildZoneRpcAuthToken({
      account: ACCOUNT,
      issuedAt: BigInt(1),
      expiresAt: BigInt(2),
      provider,
    });

    expect(provider.request).toHaveBeenCalledWith({
      method: "eth_signTypedData_v4",
      params: [
        ACCOUNT,
        serializeTypedData(buildZoneRpcAuthTypedData({
          zoneId: OMEGA_ZONE.zoneId,
          chainId: OMEGA_ZONE.chainId,
          issuedAt: BigInt(1),
          expiresAt: BigInt(2),
        })),
      ],
    });
    expect(token).toBe(`${signature}${EXPECTED_FIELDS.slice(2)}`);
  });

  it("rejects a non-hex authorization signature from the provider", async () => {
    await expect(
      buildZoneRpcAuthToken({
        account: ACCOUNT,
        issuedAt: BigInt(1),
        expiresAt: BigInt(2),
        provider: { request: vi.fn(async () => "not-a-signature") },
      }),
    ).rejects.toThrow("invalid authorization signature");
  });

  it("persists a valid token for reuse across app routes", () => {
    const fields = encodeZoneRpcAuthFields({
      issuedAt: BigInt(Math.floor(Date.now() / 1000)),
      expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60),
    });
    const token = `0x${"11".repeat(65)}${fields.slice(2)}` as Hex;

    persistZoneRpcAuthToken(token, ACCOUNT);

    expect(readPersistedZoneRpcAuthToken(ACCOUNT)).toBe(token);
    expect(window.localStorage.getItem("omega-zone:auth-token")).toBeNull();
    expect(window.sessionStorage.length).toBeGreaterThan(0);
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

  it("rejects a cached legacy version-zero token", () => {
    const now = Math.floor(Date.now() / 1000);
    const versionOneFields = encodeZoneRpcAuthFields({
      issuedAt: BigInt(now),
      expiresAt: BigInt(now + 60),
    });
    const legacyFields = `0x00${versionOneFields.slice(4)}` as Hex;
    const token = `0x${"11".repeat(65)}${legacyFields.slice(2)}` as Hex;

    persistZoneRpcAuthToken(token, ACCOUNT);

    expect(readPersistedZoneRpcAuthToken(ACCOUNT)).toBeNull();
  });

  it("flags a token as expired within the refresh buffer", () => {
    const now = Math.floor(Date.now() / 1000);
    const fresh = `0x${"11".repeat(65)}${encodeZoneRpcAuthFields({
      issuedAt: BigInt(now),
      expiresAt: BigInt(now + 15 * 60),
    }).slice(2)}` as Hex;
    const nearExpiry = `0x${"11".repeat(65)}${encodeZoneRpcAuthFields({
      issuedAt: BigInt(now - 15 * 60),
      expiresAt: BigInt(now + 30),
    }).slice(2)}` as Hex;

    expect(isZoneRpcAuthTokenExpired(fresh)).toBe(false);
    // Within the default 60s refresh buffer → treated as expired.
    expect(isZoneRpcAuthTokenExpired(nearExpiry)).toBe(true);
    // Unparseable tokens are treated as expired (fail closed).
    expect(isZoneRpcAuthTokenExpired("0xdeadbeef" as Hex)).toBe(true);
  });

  it("classifies 401/403 zone RPC errors as auth errors", () => {
    expect(isZoneAuthError(new ZoneRpcHttpError(403))).toBe(true);
    expect(isZoneAuthError(new ZoneRpcHttpError(401))).toBe(true);
    expect(isZoneAuthError(new ZoneRpcHttpError(500))).toBe(false);
    expect(
      isZoneAuthError(new Error("Private zone RPC failed with HTTP 403.")),
    ).toBe(true);
    expect(isZoneAuthError(new Error("execution reverted"))).toBe(false);
  });

  it("shares concurrent auth-token signing requests for the same account", async () => {
    const signature = `0x${"33".repeat(65)}` as Hex;
    const provider = { request: vi.fn(async () => signature) };
    const getProvider = vi.fn(async () => provider);

    const [first, second] = await Promise.all([
      getOrCreateZoneRpcAuthToken({
        account: ACCOUNT,
        issuedAt: BigInt(1),
        expiresAt: BigInt(2),
        getProvider,
      }),
      getOrCreateZoneRpcAuthToken({
        account: ACCOUNT,
        issuedAt: BigInt(1),
        expiresAt: BigInt(2),
        getProvider,
      }),
    ]);

    expect(getProvider).toHaveBeenCalledOnce();
    expect(provider.request).toHaveBeenCalledOnce();
    expect(first).toBe(second);
    expect(first).toBe(`${signature}${EXPECTED_FIELDS.slice(2)}`);
  });
});

describe("zone RPC helpers", () => {
  it("formats block numbers as JSON-RPC quantities", () => {
    expect(toRpcQuantity(421700035)).toBe("0x1922a1c3");
    expect(toRpcQuantity(BigInt(35))).toBe("0x23");
    expect(toRpcQuantity("0x2a")).toBe("0x2a");
  });

});

describe("zone transaction receipt polling", () => {
  const TX_HASH =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Hex;

  function pendingReceipt() {
    return new TransactionReceiptNotFoundError({ hash: TX_HASH });
  }

  function minimalReceipt(): TransactionReceipt {
    return {
      transactionHash: TX_HASH,
      logs: [],
    } as unknown as TransactionReceipt;
  }

  function rpcReceipt() {
    return {
      blockHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      blockNumber: "0x1",
      contractAddress: null,
      cumulativeGasUsed: "0x5208",
      effectiveGasPrice: "0x1",
      from: ACCOUNT,
      gasUsed: "0x5208",
      logs: [],
      logsBloom: `0x${"00".repeat(256)}`,
      status: "0x1",
      to: OMEGA_ZONE_ADDRESSES.darkpool,
      transactionHash: TX_HASH,
      transactionIndex: "0x0",
      type: "0x2",
    };
  }

  it("uses the longer zone receipt timeout by default", () => {
    expect(ZONE_TRANSACTION_RECEIPT_TIMEOUT_MS).toBe(120_000);
  });

  it("polls until a pending receipt appears", async () => {
    vi.useFakeTimers();
    const receipt = minimalReceipt();
    const client = {
      getTransactionReceipt: vi
        .fn()
        .mockRejectedValueOnce(pendingReceipt())
        .mockRejectedValueOnce(pendingReceipt())
        .mockResolvedValueOnce(receipt),
    };

    const promise = waitForZoneTransactionReceipt(TX_HASH, {
      client,
      intervalMs: 100,
      timeoutMs: 1_000,
    });

    await vi.advanceTimersByTimeAsync(200);
    await expect(promise).resolves.toBe(receipt);
    expect(client.getTransactionReceipt).toHaveBeenCalledTimes(3);
    expect(client.getTransactionReceipt).toHaveBeenNthCalledWith(1, {
      hash: TX_HASH,
    });
    expect(client.getTransactionReceipt).toHaveBeenNthCalledWith(2, {
      hash: TX_HASH,
    });
    expect(client.getTransactionReceipt).toHaveBeenNthCalledWith(3, {
      hash: TX_HASH,
    });
  });

  it("does not turn permanent RPC failures into receipt timeouts", async () => {
    const client = {
      getTransactionReceipt: vi.fn(async () => {
        throw new Error("Public zone RPC failed with HTTP 502.");
      }),
    };

    await expect(
      waitForZoneTransactionReceipt(TX_HASH, {
        client,
        intervalMs: 100,
        timeoutMs: 1_000,
      }),
    ).rejects.toThrow("Public zone RPC failed with HTTP 502.");
    expect(client.getTransactionReceipt).toHaveBeenCalledOnce();
    expect(client.getTransactionReceipt).toHaveBeenCalledWith({
      hash: TX_HASH,
    });
  });

  it("times out only while receipts are still pending", async () => {
    vi.useFakeTimers();
    const client = {
      getTransactionReceipt: vi.fn(async () => {
        throw pendingReceipt();
      }),
    };

    const promise = waitForZoneTransactionReceipt(TX_HASH, {
      client,
      intervalMs: 500,
      timeoutMs: 1_000,
    });
    const assertion = expect(promise).rejects.toThrow(
      `Timed out after 1s waiting for the Omega Zone transaction receipt (${TX_HASH}). The transaction was submitted, but the receipt is not visible yet.`,
    );

    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;
    expect(client.getTransactionReceipt).toHaveBeenCalledTimes(3);
    expect(client.getTransactionReceipt).toHaveBeenLastCalledWith({
      hash: TX_HASH,
    });
  });

  it("polls the private proxy when an auth token is provided", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ result: rpcReceipt() }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const receipt = await waitForZoneTransactionReceipt(TX_HASH, {
      authToken: "0x1234",
      intervalMs: 0,
      timeoutMs: 1_000,
    });

    expect(receipt.transactionHash).toBe(TX_HASH);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(OMEGA_ZONE_RPC_PROXY_URLS.private);
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
      "x-authorization-token": "0x1234",
    });
    expect(JSON.parse(init.body as string)).toMatchObject({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [TX_HASH],
    });
  });
});

describe("zone contract requests", () => {
  it("builds the L1 permit + portal deposit requests", () => {
    const amount = BigInt(1_000_000);
    const deadline = BigInt(1_718_080_000);
    const signature =
      `0x${"11".repeat(32)}${"22".repeat(32)}1b` as Hex;

    expect(approvePathUsdToPortalRequest(amount)).toMatchObject({
      chainId: OMEGA_TEMPO_L1_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.portal, amount],
    });
    expect(
      pathUsdPermitTypedData({
        owner: ACCOUNT,
        value: amount,
        nonce: BigInt(7),
        deadline,
        tokenName: "Path USD",
      }),
    ).toMatchObject({
      domain: {
        name: "Path USD",
        version: "1",
        chainId: OMEGA_TEMPO_L1_CHAIN_ID,
        verifyingContract: OMEGA_ZONE_ADDRESSES.pathUsd,
      },
      primaryType: "Permit",
      message: {
        owner: ACCOUNT,
        spender: OMEGA_ZONE_ADDRESSES.portal,
        value: amount,
        nonce: BigInt(7),
        deadline,
      },
    });
    expect(
      permitPathUsdToPortalRequest({
        owner: ACCOUNT,
        amount,
        deadline,
        signature,
      }),
    ).toEqual(
      expect.objectContaining({
        chainId: OMEGA_TEMPO_L1_CHAIN_ID,
        address: OMEGA_ZONE_ADDRESSES.pathUsd,
        functionName: "permit",
        args: [
          ACCOUNT,
          OMEGA_ZONE_ADDRESSES.portal,
          amount,
          deadline,
          27,
          `0x${"11".repeat(32)}`,
          `0x${"22".repeat(32)}`,
        ],
      }),
    );
    expect(
      depositPathUsdToZoneRequest({
        to: ACCOUNT,
        amount,
        bouncebackRecipient: ACCOUNT,
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
        ACCOUNT,
      ],
    });
    const depositCall = requestToCall(
      depositPathUsdToZoneRequest({
        to: ACCOUNT,
        amount,
        bouncebackRecipient: ACCOUNT,
      }),
    );
    expect(depositCall).toMatchObject({
      to: OMEGA_ZONE_ADDRESSES.portal,
    });
    expect(depositCall.data.slice(0, 10)).toBe(
      toFunctionSelector("deposit(address,address,uint128,bytes32,address)"),
    );
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
    expect(approveAlphaUsdToDarkpoolRequest(amount)).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.alphaUsd,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.darkpool, amount],
    });
    expect(
      approveTokenToDarkpoolRequest(OMEGA_ZONE_ADDRESSES.alphaUsd, amount),
    ).toMatchObject({
      chainId: OMEGA_ZONE_CHAIN_ID,
      address: OMEGA_ZONE_ADDRESSES.alphaUsd,
      functionName: "approve",
      args: [OMEGA_ZONE_ADDRESSES.darkpool, amount],
    });
  });

  it("pins darkpool place/market/cancel + zone outbox withdrawal to the zone chainId", () => {
    expect(
      darkpoolPlaceOrderRequest({
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
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
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
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
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
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

describe("zone trade balance checks", () => {
  it("checks the combined trade-available token balance before trading", async () => {
    const readBalance = vi.fn(async () => BigInt(1_000_000));

    await expect(
      ensurePrivateZoneTradeBalance({
        authToken: "0x1234",
        account: ACCOUNT,
        token: OMEGA_ZONE_ADDRESSES.pathUsd,
        requiredAmount: BigInt(1_000_000),
        tokenLabel: "PATH.USD",
        readBalance,
      }),
    ).resolves.toBe(BigInt(1_000_000));

    expect(readBalance).toHaveBeenCalledWith(
      "0x1234",
      ACCOUNT,
      OMEGA_ZONE_ADDRESSES.pathUsd,
      undefined,
    );
  });

  it("reports insufficient trade-available balance with escrow guidance", async () => {
    const readBalance = vi.fn(async () => BigInt(0));

    await expect(
      ensurePrivateZoneTradeBalance({
        authToken: "0x1234",
        account: ACCOUNT,
        token: OMEGA_ZONE_ADDRESSES.pathUsd,
        requiredAmount: BigInt(1_000_000),
        tokenLabel: "PATH.USD",
        readBalance,
      }),
    ).rejects.toThrow(
      "Not enough zone PATH.USD. You have 0.00 available to trade; need 1.00. Deposit more or cancel resting orders to free escrow.",
    );
  });
});

describe("zone write submission uses Tempo access-key raw transactions", () => {
  const SIGNED_TX = `0x${"cc".repeat(120)}` as Hex;
  const TX_HASH = `0x${"dd".repeat(32)}` as Hex;
  const ACCESS_KEY_ADDRESS =
    "0x00000000000000000000000000000000000000aa" as Address;
  const DEFAULT_MAX_FEE_PER_GAS = BigInt(1_000_000_000);
  const DEFAULT_MAX_PRIORITY_FEE_PER_GAS = BigInt(1_000_000);
  const DEFAULT_ACCESS_KEY_FEE_LIMIT =
    BigInt(16_075_200) * DEFAULT_MAX_FEE_PER_GAS;
  const SESSION_ACCESS_KEY_TOKEN_SPEND_LIMIT =
    BigInt(1_000) * BigInt(1_000_000);
  const ZONE_GAS_FEE_TO_PATH_USD_DENOMINATOR = BigInt(1_000_000_000_000);
  const SESSION_ACCESS_KEY_FEE_LIMIT =
    zoneGasFeeToPathUsdLimit(DEFAULT_ACCESS_KEY_FEE_LIMIT * BigInt(25));
  const tip20ApproveSelector = toFunctionSelector("approve(address,uint256)");
  const sessionAccessKeyScopes = [
    {
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      selector: tip20ApproveSelector,
      recipients: [
        OMEGA_ZONE_ADDRESSES.darkpool,
        OMEGA_ZONE_ADDRESSES.zoneOutbox,
      ],
    },
    {
      address: OMEGA_ZONE_ADDRESSES.alphaUsd,
      selector: tip20ApproveSelector,
      recipients: [OMEGA_ZONE_ADDRESSES.darkpool],
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("deposit(address,uint128)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("withdraw(address,uint128)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("createPair(address)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("place(address,uint128,uint128,bool)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("cancel(uint128)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("marketBuy(address,uint128,uint128)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.darkpool,
      selector: toFunctionSelector("marketSell(address,uint128,uint128)"),
    },
    {
      address: OMEGA_ZONE_ADDRESSES.zoneOutbox,
      selector: toFunctionSelector(
        "requestWithdrawal(address,address,uint128,bytes32,uint64,address,bytes,bytes)",
      ),
    },
  ];

  function expectedSessionAccessKeyLimits({
    pathUsdSpend = BigInt(0),
    alphaUsdSpend = BigInt(0),
  }: {
    pathUsdSpend?: bigint;
    alphaUsdSpend?: bigint;
  } = {}) {
    return [
      {
        token: OMEGA_ZONE_ADDRESSES.pathUsd,
        limit:
          (pathUsdSpend > SESSION_ACCESS_KEY_TOKEN_SPEND_LIMIT
            ? pathUsdSpend
            : SESSION_ACCESS_KEY_TOKEN_SPEND_LIMIT) +
          SESSION_ACCESS_KEY_FEE_LIMIT,
      },
      {
        token: OMEGA_ZONE_ADDRESSES.alphaUsd,
        limit:
          alphaUsdSpend > SESSION_ACCESS_KEY_TOKEN_SPEND_LIMIT
            ? alphaUsdSpend
            : SESSION_ACCESS_KEY_TOKEN_SPEND_LIMIT,
      },
    ];
  }

  function zoneGasFeeToPathUsdLimit(feeLimit: bigint) {
    if (feeLimit <= BigInt(0)) return BigInt(0);
    return (
      (feeLimit + ZONE_GAS_FEE_TO_PATH_USD_DENOMINATOR - BigInt(1)) /
      ZONE_GAS_FEE_TO_PATH_USD_DENOMINATOR
    );
  }

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

  function makeAccessKeySigner({
    withDefaults = true,
  }: { withDefaults?: boolean } = {}) {
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
              chainId: OMEGA_ZONE_CHAIN_ID,
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
      ...(withDefaults
        ? {
            getZoneTransactionDefaults: vi.fn(async () => ({
              chainId: OMEGA_ZONE_CHAIN_ID,
              nonce: 9,
              maxFeePerGas: DEFAULT_MAX_FEE_PER_GAS,
              maxPriorityFeePerGas: DEFAULT_MAX_PRIORITY_FEE_PER_GAS,
            })),
          }
        : {}),
      signTempoTransaction: vi.fn(async () => SIGNED_TX),
    };
    return signer;
  }

  const zoneWrites = [
    {
      label: "darkpool limit place",
      request: () =>
        darkpoolPlaceOrderRequest({
          base: OMEGA_ZONE_ADDRESSES.alphaUsd,
          amount: BigInt(2_000_000),
          price: BigInt(1),
          isBid: true,
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
      expectedScope: {
        address: OMEGA_ZONE_ADDRESSES.darkpool,
        selector: toFunctionSelector("place(address,uint128,uint128,bool)"),
      },
      expectedLimits: expectedSessionAccessKeyLimits(),
    },
    {
      label: "darkpool limit sell place",
      request: () =>
        darkpoolPlaceOrderRequest({
          base: OMEGA_ZONE_ADDRESSES.alphaUsd,
          amount: BigInt(2_000_000),
          price: BigInt(1),
          isBid: false,
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
      expectedScope: {
        address: OMEGA_ZONE_ADDRESSES.darkpool,
        selector: toFunctionSelector("place(address,uint128,uint128,bool)"),
      },
      expectedLimits: expectedSessionAccessKeyLimits(),
    },
    {
      label: "darkpool market buy",
      request: () =>
        darkpoolMarketBuyRequest({
          base: OMEGA_ZONE_ADDRESSES.alphaUsd,
          amount: BigInt(2_000_000),
          maxQuoteIn: BigInt(2_000_000),
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
      expectedScope: {
        address: OMEGA_ZONE_ADDRESSES.darkpool,
        selector: toFunctionSelector("marketBuy(address,uint128,uint128)"),
      },
      expectedLimits: expectedSessionAccessKeyLimits(),
    },
    {
      label: "darkpool market sell",
      request: () =>
        darkpoolMarketSellRequest({
          base: OMEGA_ZONE_ADDRESSES.alphaUsd,
          amount: BigInt(2_000_000),
          minQuoteOut: BigInt(2_000_000),
        }),
      expectedTo: OMEGA_ZONE_ADDRESSES.darkpool,
      expectedScope: {
        address: OMEGA_ZONE_ADDRESSES.darkpool,
        selector: toFunctionSelector("marketSell(address,uint128,uint128)"),
      },
      expectedLimits: expectedSessionAccessKeyLimits(),
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
      expectedScope: {
        address: OMEGA_ZONE_ADDRESSES.zoneOutbox,
        selector: toFunctionSelector(
          "requestWithdrawal(address,address,uint128,bytes32,uint64,address,bytes,bytes)",
        ),
      },
      expectedLimits: expectedSessionAccessKeyLimits(),
    },
  ] as const;

  it.each(zoneWrites)(
    "$label: estimates via private RPC, signs with a Tempo access key, broadcasts via eth_sendRawTransaction",
    async ({ request, expectedTo, expectedScope, expectedLimits }) => {
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
      // no private RPC method that implies server-side signing.
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

      expect(signer.request).toHaveBeenCalledOnce();
      const [accessKeyCall] = signer.request.mock.calls[0] as unknown as [
        { method: string; params?: readonly unknown[] },
      ];
      expect(accessKeyCall.method).toBe("wallet_authorizeAccessKey");
      expect(accessKeyCall.method).not.toBe("eth_signTransaction");
      expect(accessKeyCall.method).not.toBe("eth_sendTransaction");
      const [accessKeyRequest] = accessKeyCall.params as readonly [
        {
          limits: readonly { token: Address; limit: bigint }[];
          scopes: readonly { address: Address; selector: Hex }[];
        },
      ];
      expect(accessKeyRequest.scopes).toEqual(sessionAccessKeyScopes);
      expect(accessKeyRequest.scopes).toContainEqual(expectedScope);
      expect(accessKeyRequest.limits).toEqual(expectedLimits);
      expect(signer.signTempoTransaction).toHaveBeenCalledOnce();
      expect(signer.signTempoTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          account: ACCOUNT,
          chainId: OMEGA_ZONE_CHAIN_ID,
          nonce: 9,
          to: expectedTo,
          maxFeePerGas: DEFAULT_MAX_FEE_PER_GAS,
          maxPriorityFeePerGas: DEFAULT_MAX_PRIORITY_FEE_PER_GAS,
          keyAuthorization: { chainId: BigInt(OMEGA_ZONE_CHAIN_ID) },
        }),
      );

      // The raw broadcast carries exactly what the wallet returned.
      expect(calls[1].body.params).toEqual([SIGNED_TX]);
      const lastStoreUpdate = signer.store.setState.mock.calls.at(-1)?.[0];
      expect(lastStoreUpdate).toMatchObject({
        accessKeys: [
          expect.objectContaining({
            address: ACCESS_KEY_ADDRESS,
            keyAuthorization: undefined,
          }),
        ],
      });
    },
  );

  it("requests the session key with token approval recipients constrained to darkpool/outbox", async () => {
    const signer = makeAccessKeySigner();
    const fetchMock = mockPrivateRpcSequence();
    vi.stubGlobal("fetch", fetchMock);

    await signAndSendPrivateZoneContractWrite({
      authToken: "0x1234",
      signer: signer as unknown as Parameters<
        typeof signAndSendPrivateZoneContractWrite
      >[0]["signer"],
      account: ACCOUNT,
      request: approveAlphaUsdToDarkpoolRequest(BigInt(1_000_000)),
    });

    const [accessKeyCall] = signer.request.mock.calls[0] as unknown as [
      { params?: readonly unknown[] },
    ];
    const [accessKeyRequest] = accessKeyCall.params as readonly [
      {
        limits: readonly { token: Address; limit: bigint }[];
        scopes: readonly { address: Address; selector: Hex }[];
      },
    ];
    expect(accessKeyRequest.scopes).toEqual(sessionAccessKeyScopes);
    expect(accessKeyRequest.scopes).toContainEqual({
      address: OMEGA_ZONE_ADDRESSES.alphaUsd,
      selector: tip20ApproveSelector,
      recipients: [OMEGA_ZONE_ADDRESSES.darkpool],
    });
    expect(accessKeyRequest.scopes).toContainEqual({
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      selector: tip20ApproveSelector,
      recipients: [
        OMEGA_ZONE_ADDRESSES.darkpool,
        OMEGA_ZONE_ADDRESSES.zoneOutbox,
      ],
    });
    expect(accessKeyRequest.limits).toEqual(expectedSessionAccessKeyLimits());
  });

  it("keeps session fee headroom in PATH.USD token units", () => {
    const accessKeyRequest = zoneSessionAccessKeyAuthorizationRequest({
      feeLimit: BigInt("489350040000000000"),
    });

    expect(accessKeyRequest.limits).toContainEqual({
      token: OMEGA_ZONE_ADDRESSES.pathUsd,
      limit: BigInt("1012233751"),
    });
    expect(accessKeyRequest.limits).toContainEqual({
      token: OMEGA_ZONE_ADDRESSES.alphaUsd,
      limit: SESSION_ACCESS_KEY_TOKEN_SPEND_LIMIT,
    });
  });

  it("pre-authorizes a reusable zone session key without a transaction and does not prompt again when it is still valid", async () => {
    const signer = makeAccessKeySigner();

    const authorized = await ensureZoneSessionAccessKey({
      signer: signer as unknown as Parameters<
        typeof ensureZoneSessionAccessKey
      >[0]["signer"],
      account: ACCOUNT,
    });
    const reused = await ensureZoneSessionAccessKey({
      signer: signer as unknown as Parameters<
        typeof ensureZoneSessionAccessKey
      >[0]["signer"],
      account: ACCOUNT,
    });

    expect(authorized).toBe(true);
    expect(reused).toBe(false);
    expect(signer.request).toHaveBeenCalledTimes(1);
    const [accessKeyCall] = signer.request.mock.calls[0] as unknown as [
      { method: string; params?: readonly unknown[] },
    ];
    expect(accessKeyCall.method).toBe("wallet_authorizeAccessKey");
    const [accessKeyRequest] = accessKeyCall.params as readonly [
      {
        limits: readonly { token: Address; limit: bigint }[];
        scopes: readonly { address: Address; selector: Hex }[];
      },
    ];
    expect(accessKeyRequest.scopes).toEqual(sessionAccessKeyScopes);
    expect(accessKeyRequest.limits).toEqual(expectedSessionAccessKeyLimits());
  });

  it("uses the pending zone nonce without incrementing when building default transaction fields", async () => {
    const signer = makeAccessKeySigner({ withDefaults: false });
    const fetchMock = mockPrivateRpcSequence();
    vi.stubGlobal("fetch", fetchMock);
    const getTransactionCount = vi
      .spyOn(publicZoneClient, "getTransactionCount")
      .mockResolvedValueOnce(17);
    const estimateFeesPerGas = vi
      .spyOn(publicZoneClient, "estimateFeesPerGas")
      .mockResolvedValueOnce({
        maxFeePerGas: DEFAULT_MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: DEFAULT_MAX_PRIORITY_FEE_PER_GAS,
      });

    await signAndSendPrivateZoneContractWrite({
      authToken: "0x1234",
      signer: signer as unknown as Parameters<
        typeof signAndSendPrivateZoneContractWrite
      >[0]["signer"],
      account: ACCOUNT,
      request: darkpoolPlaceOrderRequest({
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
        amount: BigInt(1_000_000),
        price: BigInt(1),
        isBid: true,
      }),
    });

    expect(getTransactionCount).toHaveBeenCalledWith({
      address: ACCOUNT,
      blockTag: "pending",
    });
    expect(estimateFeesPerGas).toHaveBeenCalledOnce();
    expect(signer.signTempoTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        nonce: 17,
        maxFeePerGas: DEFAULT_MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: DEFAULT_MAX_PRIORITY_FEE_PER_GAS,
      }),
    );
  });

  it("reuses a session access key from token approval to place a later order", async () => {
    const signer = makeAccessKeySigner();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(rpcResponse("0x5208"))
      .mockResolvedValueOnce(rpcResponse(TX_HASH))
      .mockResolvedValueOnce(rpcResponse("0x5208"))
      .mockResolvedValueOnce(rpcResponse(TX_HASH));
    vi.stubGlobal("fetch", fetchMock);

    await signAndSendPrivateZoneContractWrite({
      authToken: "0x1234",
      signer: signer as unknown as Parameters<
        typeof signAndSendPrivateZoneContractWrite
      >[0]["signer"],
      account: ACCOUNT,
      request: approveAlphaUsdToDarkpoolRequest(BigInt(1_000_000)),
    });
    await signAndSendPrivateZoneContractWrite({
      authToken: "0x1234",
      signer: signer as unknown as Parameters<
        typeof signAndSendPrivateZoneContractWrite
      >[0]["signer"],
      account: ACCOUNT,
      request: darkpoolPlaceOrderRequest({
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
        amount: BigInt(1_000_000),
        price: BigInt(1),
        isBid: true,
      }),
    });

    expect(signer.request).toHaveBeenCalledTimes(1);
    const [accessKeyCall] = signer.request.mock.calls[0] as unknown as [
      { params?: readonly unknown[] },
    ];
    const [accessKeyRequest] = accessKeyCall.params as readonly [
      {
        limits: readonly { token: Address; limit: bigint }[];
        scopes: readonly { address: Address; selector: Hex }[];
      },
    ];
    expect(accessKeyRequest.scopes).toEqual(sessionAccessKeyScopes);
    expect(accessKeyRequest.limits).toEqual(expectedSessionAccessKeyLimits());
    expect(signer.signTempoTransaction).toHaveBeenCalledTimes(2);
    expect(signer.signTempoTransaction).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: OMEGA_ZONE_ADDRESSES.alphaUsd,
        keyAuthorization: { chainId: BigInt(OMEGA_ZONE_CHAIN_ID) },
      }),
    );
    expect(signer.signTempoTransaction).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: OMEGA_ZONE_ADDRESSES.darkpool,
        keyAuthorization: undefined,
      }),
    );
  });

  it("re-authorizes once when Tempo reports missing keychain material while signing a zone token approval", async () => {
    const signer = makeAccessKeySigner();
    signer.signTempoTransaction.mockRejectedValueOnce(
      new Error(
        "keychain validation failed: AccountKeychainError(KeyNotFound(KeyNotFound))",
      ),
    );
    const fetchMock = mockPrivateRpcSequence();
    vi.stubGlobal("fetch", fetchMock);

    const txHash = await signAndSendPrivateZoneContractWrite({
      authToken: "0x1234",
      signer: signer as unknown as Parameters<
        typeof signAndSendPrivateZoneContractWrite
      >[0]["signer"],
      account: ACCOUNT,
      request: approveAlphaUsdToDarkpoolRequest(BigInt(1_000_000)),
    });

    expect(txHash).toBe(TX_HASH);
    expect(signer.request).toHaveBeenCalledTimes(2);
    expect(signer.store.setState).toHaveBeenCalledWith({ accessKeys: [] });
    expect(signer.signTempoTransaction).toHaveBeenCalledTimes(2);
    expect(signer.signTempoTransaction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: OMEGA_ZONE_ADDRESSES.alphaUsd,
        keyAuthorization: { chainId: BigInt(OMEGA_ZONE_CHAIN_ID) },
      }),
    );
    const calls = fetchMock.mock.calls.map(([, init]) =>
      JSON.parse((init as RequestInit).body as string) as {
        method: string;
        params?: readonly unknown[];
      },
    );
    expect(calls.map((call) => call.method)).toEqual([
      "eth_estimateGas",
      "eth_sendRawTransaction",
    ]);
    expect(calls[1].params).toEqual([SIGNED_TX]);
  });
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
      pair: "ALPHAUSD/PATHUSD",
      base: OMEGA_ZONE_ADDRESSES.alphaUsd,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      bid: null,
      ask: null,
      midpoint: null,
      spread: null,
      asOfBlock: "0x1",
    });
    await getZoneTopOfBook(AUTH_TOKEN, {
      base: OMEGA_ZONE_ADDRESSES.alphaUsd,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
    });
    const { headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getTopOfBook");
    expect(body.params).toEqual([
      {
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
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

  it("zone_getMyActivity sends only cursor and limit without an account override", async () => {
    const fetchMock = mockFetchOnce({
      items: [],
      indexedThrough: { zoneBlock: "0x1", tempoBlock: "0x2" },
    });
    await getZoneMyActivity(AUTH_TOKEN, { cursor: "v1:next", limit: 500 });
    const { body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getMyActivity");
    expect(body.params).toEqual([{ cursor: "v1:next", limit: 500 }]);
  });

  it("zone_getMyOrders forwards filters and pagination when supplied", async () => {
    const fetchMock = mockFetchOnce({ items: [], nextCursor: "next" });
    await getZoneMyOrders(AUTH_TOKEN, ACCOUNT, {
      pair: "ALPHAUSD/PATHUSD",
      status: "open",
      cursor: "abc",
      limit: 10,
    });
    const { body } = parseRequest(fetchMock);
    expect(body.params).toEqual([
      {
        account: ACCOUNT,
        pair: "ALPHAUSD/PATHUSD",
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

  it("reads the fee for a simple withdrawal from the zone outbox", async () => {
    const fetchMock = mockFetchOnce(`0x${BigInt(50).toString(16).padStart(64, "0")}`);

    await expect(
      readPrivateZoneWithdrawalFee(AUTH_TOKEN, ACCOUNT, BigInt(0)),
    ).resolves.toBe(BigInt(50));

    const { body } = parseRequest(fetchMock);
    expect(body.method).toBe("eth_call");
    expect(body.params).toEqual([
      expect.objectContaining({
        from: ACCOUNT,
        to: OMEGA_ZONE_ADDRESSES.zoneOutbox,
        data: expect.stringMatching(
          `^${toFunctionSelector("calculateWithdrawalFee(uint64)")}`,
        ),
      }),
      "latest",
    ]);
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
      pair: "ALPHAUSD/PATHUSD",
      base: OMEGA_ZONE_ADDRESSES.alphaUsd,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      interval: "1m",
      samples: [],
      history: { enabled: true },
    });
    await getZoneMidpointHistory(AUTH_TOKEN, {
      base: OMEGA_ZONE_ADDRESSES.alphaUsd,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      interval: "1m",
      cursor: "c",
      limit: 50,
    });
    const { headers, body } = parseRequest(fetchMock);
    expect(body.method).toBe("zone_getMidpointHistory");
    expect(body.params).toEqual([
      {
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
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
      pair: "ALPHAUSD/PATHUSD",
      base: OMEGA_ZONE_ADDRESSES.alphaUsd,
      quote: OMEGA_ZONE_ADDRESSES.pathUsd,
      interval: "1m",
      samples: [],
      history: { enabled: false, reason: "history-disabled" },
    });
    const result: ZoneMidpointHistoryResponse = await getZoneMidpointHistory(
      AUTH_TOKEN,
      {
        base: OMEGA_ZONE_ADDRESSES.alphaUsd,
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
