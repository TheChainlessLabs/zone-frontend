import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { OMEGA_ZONE, OMEGA_ZONE_RPC_URLS } from "@/lib/zone";

const JSON_RPC_CONTENT_TYPE = "application/json";

export async function proxyZoneRpcRequest({
  request,
  upstreams,
  authToken,
}: {
  request: NextRequest;
  upstreams: readonly string[];
  authToken?: string;
}) {
  const body = await request.text();
  const headers: HeadersInit = {
    "content-type": JSON_RPC_CONTENT_TYPE,
  };
  if (authToken) headers["x-authorization-token"] = authToken;

  let lastError: unknown;
  for (const upstream of uniqueUrls(upstreams)) {
    try {
      const response = await fetch(upstream, {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "content-type":
            response.headers.get("content-type") ?? JSON_RPC_CONTENT_TYPE,
          "cache-control": "no-store",
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  return NextResponse.json(
    {
      error: "Omega Zone RPC upstream is unavailable.",
      detail: getErrorMessage(lastError),
    },
    { status: 502 },
  );
}

export function publicZoneRpcUpstreams() {
  return [OMEGA_ZONE_RPC_URLS.publicServer, OMEGA_ZONE.zoneRpc] as const;
}

export function privateZoneRpcUpstreams() {
  return [OMEGA_ZONE_RPC_URLS.privateServer, OMEGA_ZONE.zonePrivateRpc] as const;
}

function uniqueUrls(urls: readonly string[]) {
  return [...new Set(urls.filter(Boolean))];
}

function getErrorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}
