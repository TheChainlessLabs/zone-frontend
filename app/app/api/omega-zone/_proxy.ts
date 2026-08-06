import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { OMEGA_ZONE, OMEGA_ZONE_RPC_URLS } from "@/lib/zone";

const JSON_RPC_CONTENT_TYPE = "application/json";
const DEFAULT_UPSTREAM_TIMEOUT_MS = 5_000;

interface UpstreamFailure {
  upstream: string;
  detail: string;
}

export async function proxyZoneRpcRequest({
  request,
  upstreams,
  authToken,
  timeoutMs = upstreamTimeoutMs(),
}: {
  request: NextRequest;
  upstreams: readonly string[];
  authToken?: string;
  timeoutMs?: number;
}) {
  const body = await request.text();
  const headers: HeadersInit = {
    "content-type": JSON_RPC_CONTENT_TYPE,
  };
  if (authToken) headers["x-authorization-token"] = authToken;

  const failures: UpstreamFailure[] = [];
  for (const upstream of uniqueUrls(upstreams)) {
    try {
      const response = await fetchWithTimeout(
        upstream,
        {
          method: "POST",
          headers,
          body,
          cache: "no-store",
        },
        timeoutMs,
      );

      if (shouldTryNextUpstream(response.status)) {
        failures.push({
          upstream,
          detail: `HTTP ${response.status} ${response.statusText}`.trim(),
        });
        continue;
      }

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
      failures.push({
        upstream,
        detail: getErrorMessage(error) ?? "Unknown fetch failure",
      });
    }
  }

  return NextResponse.json(
    {
      error: "Omega Zone RPC upstream is unavailable.",
      detail: formatFailures(failures),
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

async function fetchWithTimeout(
  upstream: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(upstream, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function shouldTryNextUpstream(status: number) {
  return status === 502 || status === 503 || status === 504;
}

function upstreamTimeoutMs() {
  const timeoutMs = Number(process.env.OMEGA_ZONE_RPC_UPSTREAM_TIMEOUT_MS);
  return Number.isFinite(timeoutMs) && timeoutMs > 0
    ? timeoutMs
    : DEFAULT_UPSTREAM_TIMEOUT_MS;
}

function formatFailures(failures: readonly UpstreamFailure[]) {
  if (failures.length === 0) {
    return "No Omega Zone RPC upstreams are configured.";
  }
  return failures
    .map(({ upstream, detail }) => `${upstream}: ${detail}`)
    .join("; ");
}

function getErrorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}
