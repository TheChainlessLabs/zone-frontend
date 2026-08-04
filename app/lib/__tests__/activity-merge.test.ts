import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeFunctionData, type Address } from "viem";

import {
  activityFromUnifiedZoneHistory,
  activityFromZoneHistory,
  cancelPrivateZoneOrder,
  DARKPOOL_PARSED_ABI,
  decodeDarkpoolOrderIntent,
  fetchOmegaZoneActivity,
  mergeOmegaZoneActivity,
  parseZoneOrderFixtureId,
  ZoneRpcHttpError,
  zoneFillIdentity,
} from "@/lib/zone";
import type { ZoneTransactionSigner } from "@/lib/zone";
import type {
  DepositFixture,
  FillFixture,
  OrderFixture,
  WithdrawalFixture,
} from "@/lib/view-types";

afterEach(() => vi.unstubAllGlobals());

// The in-memory optimistic store is keyed by account, so each test uses a
// distinct address to avoid cross-test bleed.
function mkOrder(
  id: string,
  txHash?: `0x${string}`,
  amount = "7.50",
): OrderFixture {
  return {
    id,
    pair: "ALPHAUSD/PATH.USD",
    side: "buy",
    type: "limit",
    amount,
    price: "1.000000",
    filledPercent: 0,
    status: "pending",
    submittedAt: "2026-06-11T07:06:46.000Z",
    txHash,
  };
}

function mkFill({
  id,
  orderId,
  txHash,
  amount = "1.00",
}: {
  id: string;
  orderId: string;
  txHash: `0x${string}`;
  amount?: string;
}): FillFixture {
  return {
    id,
    orderId,
    pair: "ALPHAUSD/PATH.USD",
    side: "sell",
    type: "limit",
    amount,
    price: "1.000000",
    matchedAt: "2026-06-11T07:06:47.000Z",
    status: "matched",
    txHash,
  };
}

describe("activityFromZoneHistory fill decoding", () => {
  const base = "0x20c0000000000000000000000000000000000001" as Address;
  const quote = "0x20c0000000000000000000000000000000000000" as Address;
  const txHash =
    "0xabababababababababababababababababababababababababababababababab" as const;

  it("decodes market buy, market sell, and limit side from transaction input", () => {
    const marketBuy = encodeFunctionData({
      abi: DARKPOOL_PARSED_ABI,
      functionName: "marketBuy",
      args: [base, BigInt(1_000_000), BigInt(1_000_000)],
    });
    const marketSell = encodeFunctionData({
      abi: DARKPOOL_PARSED_ABI,
      functionName: "marketSell",
      args: [base, BigInt(1_000_000), BigInt(1_000_000)],
    });
    const limitAsk = encodeFunctionData({
      abi: DARKPOOL_PARSED_ABI,
      functionName: "place",
      args: [base, BigInt(1_000_000), BigInt(1), false],
    });

    expect(decodeDarkpoolOrderIntent(marketBuy)).toEqual({
      side: "buy",
      type: "market",
    });
    expect(decodeDarkpoolOrderIntent(marketSell)).toEqual({
      side: "sell",
      type: "market",
    });
    expect(decodeDarkpoolOrderIntent(limitAsk)).toEqual({
      side: "sell",
      type: "limit",
    });
  });

  it("maps a market sell taker from its transaction instead of defaulting to buy", () => {
    const marketSell = encodeFunctionData({
      abi: DARKPOOL_PARSED_ABI,
      functionName: "marketSell",
      args: [base, BigInt(1_000_000), BigInt(1_000_000)],
    });
    const activity = activityFromZoneHistory({
      orders: [],
      fills: [
        zoneFill({
          txHash,
          role: "taker",
          orderId: undefined,
          logIndex: "0x7",
        }),
      ],
      transfers: [],
      transactionInputs: { [txHash.toLowerCase()]: marketSell },
    });

    expect(activity.fills).toHaveLength(1);
    expect(activity.fills[0]).toMatchObject({
      id: zoneFillIdentity(txHash, "7", "taker"),
      side: "sell",
      type: "market",
    });
  });

  it("uses terminal order history to preserve a fully filled limit ask side", () => {
    const activity = activityFromZoneHistory({
      orders: [zoneOrder({ orderId: "0x2a", side: "ask", status: "filled" })],
      fills: [
        zoneFill({
          txHash,
          role: "maker",
          orderId: "0x2a",
          logIndex: "0x8",
        }),
      ],
      transfers: [],
    });

    expect(activity.orders).toEqual([]);
    expect(activity.fills[0]).toMatchObject({ side: "sell", type: "limit" });
  });

  it("preserves both correctly decoded roles for a self market sell", () => {
    const activity = activityFromZoneHistory({
      orders: [zoneOrder({ orderId: "0x1", side: "bid", status: "filled" })],
      fills: [
        zoneFill({ txHash, role: "maker", orderId: "0x1", logIndex: "0x9" }),
        zoneFill({
          txHash,
          role: "taker",
          orderId: undefined,
          logIndex: "0x9",
        }),
      ],
      transfers: [],
    });

    expect(activity.fills).toHaveLength(2);
    expect(activity.fills.map(({ side, type }) => ({ side, type }))).toEqual([
      { side: "buy", type: "limit" },
      { side: "sell", type: "market" },
    ]);
    expect(new Set(activity.fills.map((fill) => fill.id)).size).toBe(2);
  });

  it("reuses known receipt intent when a non-self market transaction is unavailable", () => {
    const fill = zoneFill({
      txHash,
      role: "taker",
      orderId: undefined,
      logIndex: "0xb",
    });
    const id = zoneFillIdentity(txHash, "11", "taker");
    const activity = activityFromZoneHistory({
      orders: [],
      fills: [fill],
      transfers: [],
      knownFillIntents: {
        [id]: { side: "sell", type: "market" },
      },
    });

    expect(activity.fills).toHaveLength(1);
    expect(activity.fills[0]).toMatchObject({ id, side: "sell", type: "market" });
  });

  it("omits only an undecodable fill while preserving authoritative orders", () => {
    const activity = activityFromZoneHistory({
      orders: [zoneOrder({ orderId: "0x2", side: "ask", status: "open" })],
      fills: [
        zoneFill({
          txHash,
          role: "taker",
          orderId: undefined,
          logIndex: "0xc",
        }),
      ],
      transfers: [],
    });

    expect(activity.orders).toHaveLength(1);
    expect(activity.fills).toEqual([]);
  });

  it("does not fall back when indexed activity is disabled", async () => {
    const account = "0x0000000000000000000000000000000000000a11" as Address;
    const unavailableTx =
      "0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd" as const;
    const openOrder = zoneOrder({
      orderId: "0x2",
      side: "ask",
      status: "open",
    });
    const filledBid = zoneOrder({
      orderId: "0x1",
      side: "bid",
      status: "filled",
    });
    const makerFill = zoneFill({
      txHash: unavailableTx,
      role: "maker",
      orderId: "0x1",
      logIndex: "0xa",
    });
    const takerFill = zoneFill({
      txHash: unavailableTx,
      role: "taker",
      orderId: undefined,
      logIndex: "0xa",
    });
    const methods: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body)) as { method: string };
        methods.push(request.method);
        if (request.method === "zone_getMyActivity") {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              error: { code: -32006, message: "Method disabled" },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        const result =
          request.method === "zone_getMyOrders"
            ? { items: [openOrder, filledBid] }
            : request.method === "zone_getMyFills"
              ? { items: [makerFill, takerFill] }
              : request.method === "zone_getMyTransfers"
                ? {
                    items: [
                      zoneTransfer({
                        token: quote,
                        amount: "100000000",
                        blockNumber: "0x10",
                        txHash:
                          "0xefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefef",
                        logIndex: 0,
                      }),
                    ],
                  }
                : request.method === "eth_getTransactionByHash"
                  ? null
                  : undefined;
        return new Response(
          JSON.stringify({ jsonrpc: "2.0", id: 1, result }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );

    await expect(
      fetchOmegaZoneActivity({ authToken: "0x1234" }),
    ).rejects.toThrow("Method disabled");
    expect(methods).toEqual(["zone_getMyActivity"]);
  });

  it("reconciles the optimistic taker row with the backend row by stable identity", () => {
    const account = "0x0000000000000000000000000000000000000a10" as Address;
    const id = zoneFillIdentity(txHash, "9", "taker");
    const optimistic = {
      ...mkFill({ id, orderId: "o-abababab", txHash }),
      side: "sell" as const,
      type: "market" as const,
    };
    const backend = { ...optimistic, price: "1.250000" };

    mergeOmegaZoneActivity(account, { fills: [optimistic] });
    const merged = mergeOmegaZoneActivity(account, { fills: [backend] });

    expect(merged.fills).toEqual([backend]);
  });

  it("replaces a receipt fallback fill with canonical same-transaction fills", () => {
    const account = "0x0000000000000000000000000000000000000a19" as Address;
    const txHash =
      "0x2222222222222222222222222222222222222222222222222222222222222222" as const;
    const fallback = mkFill({
      id: `f-${txHash.slice(2, 10)}`,
      orderId: `o-${txHash.slice(2, 10)}`,
      txHash,
    });
    const maker = mkFill({
      id: zoneFillIdentity(txHash, "2", "maker"),
      orderId: "o-7",
      txHash,
    });
    const taker = mkFill({
      id: zoneFillIdentity(txHash, "2", "taker"),
      orderId: "o-8",
      txHash,
    });

    mergeOmegaZoneActivity(account, { fills: [fallback] });
    const merged = mergeOmegaZoneActivity(account, {
      fills: [maker, taker],
    });

    expect(merged.fills).toEqual([maker, taker]);
  });

  it("does not hydrate legacy transfers while the index is backfilling", async () => {
    const account = "0x0000000000000000000000000000000000000a11" as Address;
    const depositTx =
      "0x1111111111111111111111111111111111111111111111111111111111111111" as const;
    const withdrawalTx =
      "0x2222222222222222222222222222222222222222222222222222222222222222" as const;
    const transferCursors: Array<string | undefined> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body)) as {
          method: string;
          params: Array<Record<string, unknown> | string>;
        };
        if (request.method === "zone_getMyActivity") {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              error: {
                code: -32007,
                message: "Activity index not ready",
                data: { status: "backfilling" },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        let result: unknown;
        if (
          request.method === "zone_getMyOrders" ||
          request.method === "zone_getMyFills"
        ) {
          result = { items: [] };
        } else if (request.method === "zone_getMyTransfers") {
          const transferParams = request.params[0] as Record<string, unknown>;
          const cursor = transferParams.cursor as string | undefined;
          transferCursors.push(cursor);
          result = cursor
            ? {
                items: [
                  zoneTransfer({
                    token: quote,
                    amount: "100000000",
                    blockNumber: "0x10",
                    txHash: depositTx,
                    logIndex: 2,
                  }),
                  {
                    ...zoneTransfer({
                      token: quote,
                      amount: "100010000",
                      blockNumber: "0x11",
                      txHash: withdrawalTx,
                      logIndex: 3,
                    }),
                    counterparty:
                      "0x1c00000000000000000000000000000000000002" as Address,
                    direction: "out",
                  },
                ],
              }
            : {
                items: [
                  {
                    ...zoneTransfer({
                      token: quote,
                      amount: "50000000",
                      blockNumber: "0x12",
                      txHash:
                        "0x3333333333333333333333333333333333333333333333333333333333333333",
                      logIndex: 1,
                    }),
                    counterparty:
                      "0x00000000000000000000000000000000000000aa" as Address,
                  },
                ],
                nextCursor: "older-transfers",
              };
        } else if (request.method === "zone_getWithdrawalStatus") {
          result = {
            withdrawalIndex: "7",
            zoneTxHash: withdrawalTx,
            status: "processed",
            token: quote,
            amount: "100000000",
            to: account,
            fallbackRecipient: account,
            memo: `0x${"0".repeat(64)}`,
            zoneBlockNumber: "0x11",
            l1ProcessWithdrawalTxHash:
              "0x4444444444444444444444444444444444444444444444444444444444444444",
          };
        }
        return new Response(
          JSON.stringify({ jsonrpc: "2.0", id: 1, result }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );

    await expect(
      fetchOmegaZoneActivity({ authToken: "0x1234" }),
    ).rejects.toThrow("Activity index not ready");
    expect(transferCursors).toEqual([]);
  });

  it("paginates unified activity and maps canonical occurredAt timestamps", async () => {
    const account = "0x0000000000000000000000000000000000000a12" as Address;
    const orderTx =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
    const depositTx =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;
    const cursors: Array<string | undefined> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body)) as {
          method: string;
          params: Array<{ cursor?: string }>;
        };
        expect(request.method).toBe("zone_getMyActivity");
        const cursor = request.params[0]?.cursor;
        cursors.push(cursor);
        const items = cursor
          ? [
              {
                id: "deposit-1",
                kind: "deposit",
                occurredAt: "0x65920080",
                updatedAt: "0x65920080",
                source: {
                  chain: "tempo",
                  blockNumber: "0x20",
                  txHash: depositTx,
                  txIndex: "0x1",
                  logIndex: "0x2",
                },
                payload: {
                  type: "deposit",
                  details: {
                    depositHash: `0x${"11".repeat(32)}`,
                    kind: "regular",
                    token: quote,
                    sender: account,
                    recipient: account,
                    amount: "0x5f5e100",
                    status: "processed",
                    l1TxHash: depositTx,
                  },
                },
              },
            ]
          : [
              {
                id: "order-42",
                kind: "order",
                occurredAt: "0x65920000",
                updatedAt: "0x65920040",
                source: {
                  chain: "zone",
                  blockNumber: "0x10",
                  txHash: orderTx,
                  txIndex: "0x1",
                  logIndex: "0x2",
                },
                payload: {
                  type: "order",
                  details: {
                    orderId: "0x2a",
                    side: "sell",
                    orderType: "limit",
                    status: "open",
                    baseToken: base,
                    quoteToken: quote,
                    amount: "0x1e8480",
                    remaining: "0xf4240",
                    filled: "0xf4240",
                    price: "0x1",
                  },
                },
              },
            ];
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            result: {
              items,
              ...(cursor ? {} : { nextCursor: "v1:older" }),
              indexedThrough: { zoneBlock: "0x20", tempoBlock: "0x30" },
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );

    const activity = await fetchOmegaZoneActivity({
      authToken: "0x1234",
    });

    expect(cursors).toEqual([undefined, "v1:older"]);
    expect(activity.orders[0]).toMatchObject({
      id: "o-42",
      side: "sell",
      submittedAt: new Date(Number(BigInt("0x65920000")) * 1_000).toISOString(),
      txHash: orderTx,
    });
    expect(activity.deposits[0]).toMatchObject({
      amount: "100.00",
      initiatedAt: new Date(Number(BigInt("0x65920080")) * 1_000).toISOString(),
      txHash: depositTx,
    });
  });

  it("propagates unified activity failures without legacy scans", async () => {
    const methods: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body)) as { method: string };
        methods.push(request.method);
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            error: { code: -32603, message: "index storage failed" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );

    await expect(
      fetchOmegaZoneActivity({
        authToken: "0x1234",
      }),
    ).rejects.toThrow("index storage failed");
    expect(methods).toEqual(["zone_getMyActivity"]);
  });

  it.each([-32601, -32006, -32007])(
    "propagates index availability error %i without legacy requests",
    async (code) => {
      const methods: string[] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn(async (_url: unknown, init?: RequestInit) => {
          const request = JSON.parse(String(init?.body)) as { method: string };
          methods.push(request.method);
          if (request.method === "zone_getMyActivity") {
            return new Response(
              JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                error: { code, message: "Unified activity unavailable" },
              }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              result: { items: [] },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }),
      );

      await expect(
        fetchOmegaZoneActivity({ authToken: "0x1234" }),
      ).rejects.toThrow("Unified activity unavailable");
      expect(methods).toEqual(["zone_getMyActivity"]);
    },
  );

  function zoneFill({
    txHash,
    role,
    orderId,
    logIndex,
  }: {
    txHash: `0x${string}`;
    role: "maker" | "taker";
    orderId: string | undefined;
    logIndex: `0x${string}`;
  }) {
    return {
      orderId,
      role,
      baseToken: base,
      quoteToken: quote,
      amountFilled: "1000000",
      price: "1",
      blockNumber: "0x10" as const,
      txHash,
      logIndex,
    };
  }

  function zoneOrder({
    orderId,
    side,
    status,
  }: {
    orderId: string;
    side: "bid" | "ask";
    status: "open" | "partiallyFilled" | "filled" | "cancelled";
  }) {
    return {
      orderId,
      side,
      status,
      baseToken: base,
      quoteToken: quote,
      amount: "1000000",
      remaining: "0",
      filled: "1000000",
      price: "1",
      createdAtBlock: "0x1" as const,
      updatedAtBlock: "0x10" as const,
      createdTxHash: txHash,
    };
  }
});

describe("mergeOmegaZoneActivity order reconciliation", () => {
  it("accumulates orders by id by default (optimistic patch)", () => {
    const account = "0x0000000000000000000000000000000000000a01" as Address;
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    const merged = mergeOmegaZoneActivity(account, {
      orders: [mkOrder("o-2")],
    });
    expect(merged.orders.map((o) => o.id).sort()).toEqual(["o-2", "o-opt"]);
  });

  it("REPLACES orders when the patch is an authoritative snapshot", () => {
    const account = "0x0000000000000000000000000000000000000a02" as Address;
    // An optimistic place-time "pending" row is recorded first…
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    // …then the authoritative zone_getMyOrders snapshot (order has since filled,
    // so the open set is empty) must drop the stale optimistic row.
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [] },
      { ordersAuthoritative: true },
    );
    expect(reconciled.orders).toEqual([]);
  });

  it("keeps tx-hash-backed pending orders until the authoritative snapshot sees them", () => {
    const account = "0x0000000000000000000000000000000000000a08" as Address;
    const txHash =
      "0x8888888888888888888888888888888888888888888888888888888888888888" as const;
    const pendingOrder = mkOrder("o-88888888", txHash);

    mergeOmegaZoneActivity(account, { orders: [pendingOrder] });
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [] },
      { ordersAuthoritative: true },
    );

    expect(reconciled.orders).toEqual([pendingOrder]);
  });

  it("drops a backend order after an authoritative empty snapshot", () => {
    const account = "0x0000000000000000000000000000000000000a12" as Address;
    const txHash =
      "0x1212121212121212121212121212121212121212121212121212121212121212" as const;
    const backendOrder = mkOrder("o-42", txHash);

    mergeOmegaZoneActivity(account, { orders: [backendOrder] });
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [] },
      { ordersAuthoritative: true },
    );

    expect(reconciled.orders).toEqual([]);
  });

  it("parses only indexed numeric order fixture ids", () => {
    expect(parseZoneOrderFixtureId("o-42")).toBe(BigInt(42));
    expect(() => parseZoneOrderFixtureId("o-deadbeef")).toThrow(
      "still being indexed",
    );
  });

  it("submits an indexed order cancellation and refreshes authoritative state", async () => {
    const account = "0x0000000000000000000000000000000000000a13" as Address;
    const txHash =
      "0x1313131313131313131313131313131313131313131313131313131313131313" as const;
    const signer = { request: vi.fn() } as unknown as ZoneTransactionSigner;
    const getAuthToken = vi.fn().mockResolvedValue("0x1234");
    const sendTransaction = vi.fn().mockResolvedValue(txHash);
    const waitForReceipt = vi.fn().mockResolvedValue({ status: "success" });
    const refresh = vi.fn().mockResolvedValue(undefined);

    await expect(
      cancelPrivateZoneOrder({
        orderFixtureId: "o-42",
        account,
        signer,
        getAuthToken,
        refresh,
        sendTransaction,
        waitForReceipt,
      }),
    ).resolves.toBe(txHash);

    expect(sendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        authToken: "0x1234",
        account,
        request: expect.objectContaining({
          functionName: "cancel",
          args: [BigInt(42)],
        }),
      }),
    );
    expect(waitForReceipt).toHaveBeenCalledWith(txHash, {
      authToken: "0x1234",
    });
    expect(refresh).toHaveBeenCalledWith("0x1234");
  });

  it("refreshes expired auth once before retrying cancellation", async () => {
    const account = "0x0000000000000000000000000000000000000a14" as Address;
    const txHash =
      "0x1414141414141414141414141414141414141414141414141414141414141414" as const;
    const signer = { request: vi.fn() } as unknown as ZoneTransactionSigner;
    const getAuthToken = vi
      .fn()
      .mockResolvedValueOnce("0xold")
      .mockResolvedValueOnce("0xfresh");
    const sendTransaction = vi
      .fn()
      .mockRejectedValueOnce(new ZoneRpcHttpError(403))
      .mockResolvedValueOnce(txHash);

    await cancelPrivateZoneOrder({
      orderFixtureId: "o-7",
      account,
      signer,
      getAuthToken,
      refresh: vi.fn().mockResolvedValue(undefined),
      sendTransaction,
      waitForReceipt: vi.fn().mockResolvedValue({ status: "success" }),
    });

    expect(getAuthToken).toHaveBeenNthCalledWith(2, { forceRefresh: true });
    expect(sendTransaction).toHaveBeenCalledTimes(2);
    expect(sendTransaction.mock.calls[1][0].authToken).toBe("0xfresh");
  });

  it("drops a tx-hash-backed pending order once a fill arrives for the same transaction", () => {
    const account = "0x0000000000000000000000000000000000000a09" as Address;
    const txHash =
      "0x9999999999999999999999999999999999999999999999999999999999999999" as const;
    const fill = mkFill({
      id: "f-99999999",
      orderId: "o-99999999",
      txHash,
      amount: "7.50",
    });

    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-99999999", txHash)] });
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [], fills: [fill] },
      { ordersAuthoritative: true },
    );

    expect(reconciled.orders).toEqual([]);
    expect(reconciled.fills).toEqual([fill]);
  });

  it("drops a fully matched taker limit order when the receipt has fills but no residual order", () => {
    const account = "0x0000000000000000000000000000000000000a0b" as Address;
    const sellTx =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;
    const pendingSell = {
      ...mkOrder("o-bbbbbbbb", sellTx, "1.00"),
      side: "sell" as const,
    };
    const fill = mkFill({
      id: "f-maker-1",
      orderId: "o-maker-1",
      txHash: sellTx,
      amount: "1.00",
    });

    mergeOmegaZoneActivity(account, { orders: [pendingSell] });
    const reconciled = mergeOmegaZoneActivity(account, {
      orders: [],
      fills: [fill],
    });

    expect(reconciled.orders).toEqual([]);
    expect(reconciled.fills).toEqual([fill]);
  });

  it("keeps a same-tx order when the receipt includes a residual resting order", () => {
    const account = "0x0000000000000000000000000000000000000a0c" as Address;
    const txHash =
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" as const;
    const optimisticOrder = mkOrder("o-cccccccc", txHash, "2.00");
    const residualOrder = mkOrder("o-77", txHash, "1.00");
    const fill = mkFill({
      id: "f-maker-2",
      orderId: "o-maker-2",
      txHash,
      amount: "1.00",
    });

    mergeOmegaZoneActivity(account, { orders: [optimisticOrder] });
    const reconciled = mergeOmegaZoneActivity(account, {
      orders: [residualOrder],
      fills: [fill],
    });

    expect(reconciled.orders).toEqual([residualOrder]);
  });

  it("drops a fully filled resting order by order id even when the fill tx differs", () => {
    const account = "0x0000000000000000000000000000000000000a0d" as Address;
    const buyTx =
      "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd" as const;
    const sellTx =
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as const;
    const restingBuy = mkOrder("o-1", buyTx, "1.00");
    const fill = mkFill({
      id: "f-o-1",
      orderId: "o-1",
      txHash: sellTx,
      amount: "1.00",
    });

    mergeOmegaZoneActivity(account, { orders: [restingBuy] });
    const reconciled = mergeOmegaZoneActivity(account, { fills: [fill] });

    expect(reconciled.orders).toEqual([]);
  });

  it("keeps a partially filled resting order by order id", () => {
    const account = "0x0000000000000000000000000000000000000a0e" as Address;
    const buyTx =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" as const;
    const sellTx =
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as const;
    const restingBuy = mkOrder("o-2", buyTx, "2.00");
    const fill = mkFill({
      id: "f-o-2",
      orderId: "o-2",
      txHash: sellTx,
      amount: "1.00",
    });

    mergeOmegaZoneActivity(account, { orders: [restingBuy] });
    const reconciled = mergeOmegaZoneActivity(account, { fills: [fill] });

    expect(reconciled.orders).toEqual([restingBuy]);
  });

  it("keeps a sub-cent residual using exact indexed units", () => {
    const account = "0x0000000000000000000000000000000000000a20" as Address;
    const orderTx =
      "0x2323232323232323232323232323232323232323232323232323232323232323" as const;
    const fillTx =
      "0x2424242424242424242424242424242424242424242424242424242424242424" as const;
    const restingOrder = {
      ...mkOrder("o-20", orderTx, "1.00"),
      amountRaw: "1009999",
    };
    const fill = {
      ...mkFill({
        id: "f-o-20",
        orderId: "o-20",
        txHash: fillTx,
        amount: "1.00",
      }),
      amountRaw: "1000001",
    };

    mergeOmegaZoneActivity(account, { orders: [restingOrder] });
    const reconciled = mergeOmegaZoneActivity(account, { fills: [fill] });

    expect(reconciled.orders).toEqual([restingOrder]);
  });

  it("replaces a tx-hash-backed pending order when the backend returns the real order", () => {
    const account = "0x0000000000000000000000000000000000000a0a" as Address;
    const txHash =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
    const backendOrder = {
      ...mkOrder("o-42", txHash),
      amount: "1.00",
    };

    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-aaaaaaaa", txHash)] });
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [backendOrder] },
      { ordersAuthoritative: true },
    );

    expect(reconciled.orders).toEqual([backendOrder]);
  });

  it("replaces a pending order-history row with its canonical indexed status", () => {
    const account = "0x0000000000000000000000000000000000000a15" as Address;
    const txHash =
      "0x1515151515151515151515151515151515151515151515151515151515151515" as const;
    const optimisticOrder = mkOrder(`o-${txHash.slice(2, 10)}`, txHash);
    const indexedOrder: OrderFixture = {
      ...optimisticOrder,
      id: "o-42",
      filledPercent: 100,
      status: "matched",
    };

    mergeOmegaZoneActivity(account, { orderHistory: [optimisticOrder] });
    const reconciled = mergeOmegaZoneActivity(account, {
      orderHistory: [indexedOrder],
    });

    expect(reconciled.orderHistory).toEqual([indexedOrder]);
  });

  it("keeps order-history rows from different transactions", () => {
    const account = "0x0000000000000000000000000000000000000a16" as Address;
    const firstTx =
      "0x1616161616161616161616161616161616161616161616161616161616161616" as const;
    const secondTx =
      "0x1717171717171717171717171717171717171717171717171717171717171717" as const;
    const firstOrder = mkOrder(`o-${firstTx.slice(2, 10)}`, firstTx);
    const secondOrder = {
      ...mkOrder("o-43", secondTx),
      status: "matched" as const,
    };

    mergeOmegaZoneActivity(account, { orderHistory: [firstOrder] });
    const reconciled = mergeOmegaZoneActivity(account, {
      orderHistory: [secondOrder],
    });

    expect(reconciled.orderHistory).toEqual([secondOrder, firstOrder]);
  });

  it("authoritative replace keeps still-resting orders", () => {
    const account = "0x0000000000000000000000000000000000000a03" as Address;
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [mkOrder("o-real")] },
      { ordersAuthoritative: true },
    );
    expect(reconciled.orders.map((o) => o.id)).toEqual(["o-real"]);
  });

  it("ignores ordersAuthoritative when patch omits orders entirely", () => {
    const account = "0x0000000000000000000000000000000000000a04" as Address;
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    const merged = mergeOmegaZoneActivity(
      account,
      { fills: [] },
      { ordersAuthoritative: true },
    );
    expect(merged.orders.map((o) => o.id)).toEqual(["o-opt"]);
  });
});

describe("mergeOmegaZoneActivity withdrawal reconciliation", () => {
  it("replaces a pending withdrawal with its canonical indexed status", () => {
    const account = "0x0000000000000000000000000000000000000a17" as Address;
    const txHash =
      "0x1818181818181818181818181818181818181818181818181818181818181818" as const;
    const optimisticWithdrawal: WithdrawalFixture = {
      id: `w-${txHash.slice(2, 10)}`,
      token: "PATH.USD",
      amount: "10.00",
      status: "pending",
      initiatedAt: "2026-06-11T07:06:46.000Z",
      txHash,
    };
    const indexedWithdrawal: WithdrawalFixture = {
      ...optimisticWithdrawal,
      id: "w-9",
      status: "settled",
      withdrawalBatchIndex: "12",
      l1SettlementTxHash:
        "0x1919191919191919191919191919191919191919191919191919191919191919",
    };

    mergeOmegaZoneActivity(account, {
      withdrawals: [optimisticWithdrawal],
    });
    const reconciled = mergeOmegaZoneActivity(account, {
      withdrawals: [indexedWithdrawal],
    });

    expect(reconciled.withdrawals).toEqual([indexedWithdrawal]);
  });

  it("keeps withdrawals from different transactions and null-hash drafts", () => {
    const account = "0x0000000000000000000000000000000000000a18" as Address;
    const firstTx =
      "0x2020202020202020202020202020202020202020202020202020202020202020" as const;
    const pendingWithdrawal: WithdrawalFixture = {
      id: "w-pending",
      token: "PATH.USD",
      amount: "10.00",
      status: "pending",
      initiatedAt: "2026-06-11T07:06:46.000Z",
      txHash: firstTx,
    };
    const draftWithdrawal: WithdrawalFixture = {
      ...pendingWithdrawal,
      id: "w-draft",
      status: "awaiting-signature",
      txHash: null,
    };
    const indexedWithdrawal: WithdrawalFixture = {
      ...pendingWithdrawal,
      id: "w-10",
      status: "settled",
      txHash:
        "0x2121212121212121212121212121212121212121212121212121212121212121",
    };

    mergeOmegaZoneActivity(account, {
      withdrawals: [pendingWithdrawal, draftWithdrawal],
    });
    const reconciled = mergeOmegaZoneActivity(account, {
      withdrawals: [indexedWithdrawal],
    });

    expect(reconciled.withdrawals).toEqual([
      indexedWithdrawal,
      pendingWithdrawal,
      draftWithdrawal,
    ]);
  });

  it("keeps distinct canonical withdrawals emitted by the same transaction", () => {
    const account = "0x0000000000000000000000000000000000000a21" as Address;
    const txHash =
      "0x2525252525252525252525252525252525252525252525252525252525252525" as const;
    const first: WithdrawalFixture = {
      id: "w-21",
      token: "PATH.USD",
      amount: "1.00",
      status: "pending",
      initiatedAt: "2026-06-11T07:06:46.000Z",
      txHash,
    };
    const second: WithdrawalFixture = {
      ...first,
      id: "w-22",
      status: "settled",
    };

    mergeOmegaZoneActivity(account, { withdrawals: [first] });
    const reconciled = mergeOmegaZoneActivity(account, {
      withdrawals: [second],
    });

    expect(reconciled.withdrawals).toEqual([second, first]);
  });
});

describe("mergeOmegaZoneActivity deposit reconciliation", () => {
  it("dedupes optimistic and backend deposits by transaction hash", () => {
    const account = "0x0000000000000000000000000000000000000a05" as Address;
    const txHash =
      "0x3333333333333333333333333333333333333333333333333333333333333333" as const;
    const optimisticDeposit: DepositFixture = {
      id: "d-33333333",
      token: "PATH.USD",
      amount: "100.00",
      status: "pending",
      initiatedAt: "2026-06-11T07:06:46.000Z",
      txHash,
    };
    const backendDeposit: DepositFixture = {
      ...optimisticDeposit,
      id: "d-33333333-0",
      status: "credited",
    };

    mergeOmegaZoneActivity(account, { deposits: [optimisticDeposit] });
    const merged = mergeOmegaZoneActivity(account, {
      deposits: [backendDeposit],
    });

    expect(merged.deposits).toEqual([backendDeposit]);
  });

  it("lets authoritative backend deposits replace local deposits with different hashes", () => {
    const account = "0x0000000000000000000000000000000000000a06" as Address;
    const optimisticDeposit: DepositFixture = {
      id: "d-l1",
      token: "PATH.USD",
      amount: "100.00",
      status: "credited",
      initiatedAt: "2026-06-11T07:06:46.000Z",
      txHash:
        "0x4444444444444444444444444444444444444444444444444444444444444444",
    };
    const backendDeposit: DepositFixture = {
      id: "d-zone-0",
      token: "PATH.USD",
      amount: "100.00",
      status: "credited",
      initiatedAt: "2026-06-11T07:07:01.000Z",
      txHash:
        "0x5555555555555555555555555555555555555555555555555555555555555555",
    };

    mergeOmegaZoneActivity(account, { deposits: [optimisticDeposit] });
    const merged = mergeOmegaZoneActivity(
      account,
      { deposits: [backendDeposit] },
      { depositsAuthoritative: true },
    );

    expect(merged.deposits).toEqual([backendDeposit]);
  });

  it("keeps pending local deposits until the authoritative backend snapshot includes them", () => {
    const account = "0x0000000000000000000000000000000000000a07" as Address;
    const pendingDeposit: DepositFixture = {
      id: "d-pending",
      token: "PATH.USD",
      amount: "42.00",
      status: "pending",
      initiatedAt: "2026-06-11T07:06:46.000Z",
      txHash:
        "0x6666666666666666666666666666666666666666666666666666666666666666",
    };

    mergeOmegaZoneActivity(account, { deposits: [pendingDeposit] });
    const merged = mergeOmegaZoneActivity(
      account,
      { deposits: [] },
      { depositsAuthoritative: true },
    );

    expect(merged.deposits).toEqual([pendingDeposit]);
  });
});

describe("activityFromZoneHistory transfer mapping", () => {
  it("maps mint credits and resolved withdrawals without inventing activity from generic transfers", () => {
    const depositTx =
      "0x1111111111111111111111111111111111111111111111111111111111111111" as const;
    const genericInboundTx =
      "0x2222222222222222222222222222222222222222222222222222222222222222" as const;
    const genericOutboundTx =
      "0x3333333333333333333333333333333333333333333333333333333333333333" as const;
    const withdrawalTx =
      "0x4444444444444444444444444444444444444444444444444444444444444444" as const;

    const activity = activityFromZoneHistory({
      orders: [],
      fills: [],
      transfers: [
        zoneTransfer({
          token: "0x20c0000000000000000000000000000000000000",
          amount: "100000000",
          blockNumber: "0x10",
          txHash: depositTx,
          logIndex: 0,
        }),
        {
          token: "0x20c0000000000000000000000000000000000000",
          counterparty: "0x00000000000000000000000000000000000000aa",
          amount: "100000000",
          direction: "in",
          blockNumber: "0x11",
          txHash: genericInboundTx,
          logIndex: 1,
        },
        {
          token: "0x20c0000000000000000000000000000000000000",
          counterparty: "0x00000000000000000000000000000000000000bb",
          amount: "100000000",
          direction: "out",
          blockNumber: "0x12",
          txHash: genericOutboundTx,
          logIndex: 2,
        },
      ],
      withdrawalStatuses: [
        {
          withdrawalIndex: "9",
          zoneTxHash: withdrawalTx,
          status: "processed",
          token: "0x20c0000000000000000000000000000000000000",
          amount: "25000000",
          to: "0x00000000000000000000000000000000000000cc",
          fallbackRecipient: "0x00000000000000000000000000000000000000cc",
          memo: `0x${"0".repeat(64)}`,
          zoneBlockNumber: "0x13",
        },
      ],
    });

    expect(activity.deposits).toHaveLength(1);
    expect(activity.deposits[0]).toMatchObject({
      txHash: depositTx,
      amount: "100.00",
      status: "credited",
    });
    expect(activity.withdrawals).toHaveLength(1);
    expect(activity.withdrawals[0]).toMatchObject({
      id: "w-9",
      txHash: withdrawalTx,
      amount: "25.00",
      status: "settled",
    });
  });

  it("orders backend deposits by newest transfer block before portfolio slicing", () => {
    const activity = activityFromZoneHistory({
      orders: [],
      fills: [],
      transfers: [
        zoneTransfer({
          token: "0x20c0000000000000000000000000000000000000",
          amount: "10000000",
          blockNumber: "0x10",
          txHash:
            "0x1000000000000000000000000000000000000000000000000000000000000000",
          logIndex: 0,
        }),
        zoneTransfer({
          token: "0x20c0000000000000000000000000000000000000",
          amount: "20000000",
          blockNumber: "0x11",
          txHash:
            "0x2000000000000000000000000000000000000000000000000000000000000000",
          logIndex: 0,
        }),
        zoneTransfer({
          token: "0x20c0000000000000000000000000000000000000",
          amount: "30000000",
          blockNumber: "0x12",
          txHash:
            "0x3000000000000000000000000000000000000000000000000000000000000000",
          logIndex: 0,
        }),
        zoneTransfer({
          token: "0x20c0000000000000000000000000000000000000",
          amount: "40000000",
          blockNumber: "0x13",
          txHash:
            "0x4000000000000000000000000000000000000000000000000000000000000000",
          logIndex: 0,
        }),
        zoneTransfer({
          token: "0x20c0000000000000000000000000000000000001",
          amount: "50000000",
          blockNumber: "0x14",
          txHash:
            "0x5000000000000000000000000000000000000000000000000000000000000000",
          logIndex: 0,
        }),
      ],
    });

    expect(activity.deposits.slice(0, 4).map((deposit) => deposit.token)).toEqual([
      "ALPHAUSD",
      "PATH.USD",
      "PATH.USD",
      "PATH.USD",
    ]);
    expect(activity.deposits[0]).toMatchObject({
      amount: "50.00",
      token: "ALPHAUSD",
    });
  });
});

describe("activityFromUnifiedZoneHistory", () => {
  it("uses role-aware fill identity and ignores generic transfers", () => {
    const txHash =
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" as const;
    const activity = activityFromUnifiedZoneHistory([
      {
        id: "fill-1",
        kind: "fill",
        occurredAt: "0x65920000",
        updatedAt: "0x65920000",
        source: {
          chain: "zone",
          blockNumber: "0x10",
          txHash,
          txIndex: "0x0",
          logIndex: "0x7",
        },
        payload: {
          type: "fill",
          details: {
            role: "taker",
            side: "buy",
            orderType: "market",
            baseToken: "0x20c0000000000000000000000000000000000001",
            quoteToken: "0x20c0000000000000000000000000000000000000",
            amountFilled: "0xf4240",
            price: "0x1",
          },
        },
      },
      {
        id: "transfer-1",
        kind: "transfer",
        occurredAt: "0x65920001",
        updatedAt: "0x65920001",
        source: {
          chain: "zone",
          blockNumber: "0x10",
          txHash,
          txIndex: "0x0",
          logIndex: "0x8",
        },
        payload: {
          type: "transfer",
          details: {
            token: "0x20c0000000000000000000000000000000000000",
            counterparty: "0x0000000000000000000000000000000000000001",
            amount: "0xf4240",
            direction: "out",
          },
        },
      },
    ]);

    expect(activity.fills).toHaveLength(1);
    expect(activity.fills[0]).toMatchObject({
      id: zoneFillIdentity(txHash, "7", "taker"),
      side: "buy",
      type: "market",
    });
    expect(activity.deposits).toEqual([]);
    expect(activity.withdrawals).toEqual([]);
  });
});

function zoneTransfer({
  token,
  amount,
  blockNumber,
  txHash,
  logIndex,
}: {
  token: Address;
  amount: string;
  blockNumber: `0x${string}`;
  txHash: `0x${string}`;
  logIndex: number;
}) {
  return {
    token,
    counterparty: "0x0000000000000000000000000000000000000000" as Address,
    amount,
    direction: "in" as const,
    blockNumber,
    txHash,
    logIndex,
  };
}
