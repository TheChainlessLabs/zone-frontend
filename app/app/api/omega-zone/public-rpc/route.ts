import type { NextRequest } from "next/server";

import {
  privateZoneRpcUpstreams,
  proxyZoneRpcRequest,
  publicZoneRpcUpstreams,
} from "../_proxy";
import {
  getPublicAggregateZoneAuthToken,
  isPublicAggregateZoneRpcRequest,
} from "../_public-auth";

export const dynamic = "force-dynamic";

const ZONE_AUTH_COOKIE = "omega-zone-auth-token";

export async function POST(request: NextRequest) {
  const authToken =
    request.headers.get("x-authorization-token") ??
    request.cookies.get(ZONE_AUTH_COOKIE)?.value;
  if (authToken) {
    return proxyZoneRpcRequest({
      request,
      upstreams: privateZoneRpcUpstreams(),
      authToken,
    });
  }

  const payload = await request.clone().json().catch(() => null);
  if (isPublicAggregateZoneRpcRequest(payload)) {
    return proxyZoneRpcRequest({
      request,
      upstreams: privateZoneRpcUpstreams(),
      authToken: await getPublicAggregateZoneAuthToken(),
    });
  }

  return proxyZoneRpcRequest({
    request,
    upstreams: publicZoneRpcUpstreams(),
  });
}
