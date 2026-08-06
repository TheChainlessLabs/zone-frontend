import type { NextRequest } from "next/server";

import {
  privateZoneRpcUpstreams,
  proxyZoneRpcRequest,
  publicZoneRpcUpstreams,
} from "../_proxy";
import {
  getPublicAggregateZoneAuthToken,
  isPublicAggregateZoneRpcRequest,
  publicAggregateZoneRpcTimeoutMs,
} from "../_public-auth";

export const dynamic = "force-dynamic";

const ZONE_AUTH_COOKIE = "omega-zone-auth-token";

export async function POST(request: NextRequest) {
  const payload = await request.clone().json().catch(() => null);
  const timeoutMs = publicAggregateZoneRpcTimeoutMs(payload);
  const authToken =
    request.headers.get("x-authorization-token") ??
    request.cookies.get(ZONE_AUTH_COOKIE)?.value;
  if (authToken) {
    return proxyZoneRpcRequest({
      request,
      upstreams: privateZoneRpcUpstreams(),
      authToken,
      timeoutMs,
    });
  }

  if (isPublicAggregateZoneRpcRequest(payload)) {
    return proxyZoneRpcRequest({
      request,
      upstreams: privateZoneRpcUpstreams(),
      authToken: await getPublicAggregateZoneAuthToken(),
      timeoutMs,
    });
  }

  return proxyZoneRpcRequest({
    request,
    upstreams: publicZoneRpcUpstreams(),
  });
}
