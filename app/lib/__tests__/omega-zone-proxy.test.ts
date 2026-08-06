import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyZoneRpcRequest } from "@/app/api/omega-zone/_proxy";
import { publicAggregateZoneRpcTimeoutMs } from "@/app/api/omega-zone/_public-auth";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("omega zone RPC proxy", () => {
  it("allows slow public batch aggregation without extending other RPC calls", () => {
    expect(
      publicAggregateZoneRpcTimeoutMs({ method: "zone_searchBatch" }),
    ).toBe(120_000);
    expect(
      publicAggregateZoneRpcTimeoutMs({ method: "zone_listBatches" }),
    ).toBe(120_000);
    expect(
      publicAggregateZoneRpcTimeoutMs({ method: "zone_getMarketConfig" }),
    ).toBeUndefined();
  });

  it("falls back when an upstream gateway is unavailable", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response("bad gateway", {
          status: 502,
          statusText: "Bad Gateway",
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: "0x2a" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await proxyZoneRpcRequest({
      request: rpcRequest(),
      upstreams: ["http://bad-zone/private", "http://good-zone/private"],
      authToken: "0x1234",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ result: "0x2a" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://bad-zone/private");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://good-zone/private");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-authorization-token": "0x1234",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId" }),
      cache: "no-store",
    });
  });

  it("returns the attempted upstream details when all upstreams fail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:8544");
    }));

    const response = await proxyZoneRpcRequest({
      request: rpcRequest(),
      upstreams: ["http://localhost:8544"],
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: "Omega Zone RPC upstream is unavailable.",
      detail: "http://localhost:8544: connect ECONNREFUSED 127.0.0.1:8544",
    });
  });
});

function rpcRequest() {
  return new Request("http://localhost/api/omega-zone/private-rpc", {
    method: "POST",
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId" }),
  }) as NextRequest;
}
