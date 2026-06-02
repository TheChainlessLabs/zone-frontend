import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  privateZoneRpcUpstreams,
  proxyZoneRpcRequest,
} from "../_proxy";

export const dynamic = "force-dynamic";

const ZONE_AUTH_COOKIE = "omega-zone-auth-token";

export async function POST(request: NextRequest) {
  const authToken =
    request.headers.get("x-authorization-token") ??
    request.cookies.get(ZONE_AUTH_COOKIE)?.value;
  if (!authToken) {
    return NextResponse.json(
      { error: "Missing x-authorization-token header." },
      { status: 401 },
    );
  }

  return proxyZoneRpcRequest({
    request,
    upstreams: privateZoneRpcUpstreams(),
    authToken,
  });
}
