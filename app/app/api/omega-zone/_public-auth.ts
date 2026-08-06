import { concatHex, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import {
  encodeZoneRpcAuthFields,
  zoneRpcAuthDigest,
} from "@/lib/zone";

const PUBLIC_AGGREGATE_ZONE_METHODS = new Set([
  "zone_getMarketConfig",
  "zone_getTopOfBook",
  "zone_getMidpointHistory",
  "zone_getReferencePrice",
  "zone_listBatches",
  "zone_getBatch",
  "zone_searchBatch",
]);
const BATCH_AGGREGATE_ZONE_METHODS = new Set([
  "zone_listBatches",
  "zone_getBatch",
  "zone_searchBatch",
]);
const BATCH_AGGREGATE_TIMEOUT_MS = 120_000;
const AUTH_TOKEN_TTL_SECONDS = 15 * 60;
const AUTH_TOKEN_REFRESH_BUFFER_SECONDS = 60;

const publicAggregateAccount = privateKeyToAccount(generatePrivateKey());
let cachedAuthToken:
  | {
      authToken: Hex;
      expiresAt: number;
    }
  | undefined;

export function isPublicAggregateZoneRpcRequest(payload: unknown): boolean {
  if (Array.isArray(payload)) {
    return payload.length > 0 && payload.every(isAllowedJsonRpcRequest);
  }
  return isAllowedJsonRpcRequest(payload);
}

export function publicAggregateZoneRpcTimeoutMs(
  payload: unknown,
): number | undefined {
  const requests = Array.isArray(payload) ? payload : [payload];
  return requests.some(isBatchAggregateJsonRpcRequest)
    ? BATCH_AGGREGATE_TIMEOUT_MS
    : undefined;
}

export async function getPublicAggregateZoneAuthToken(): Promise<Hex> {
  const now = Math.floor(Date.now() / 1000);
  if (
    cachedAuthToken &&
    cachedAuthToken.expiresAt > now + AUTH_TOKEN_REFRESH_BUFFER_SECONDS
  ) {
    return cachedAuthToken.authToken;
  }

  const expiresAt = now + AUTH_TOKEN_TTL_SECONDS;
  const fields = encodeZoneRpcAuthFields({
    issuedAt: now,
    expiresAt,
  });
  const digest = zoneRpcAuthDigest(fields);
  const signature = await publicAggregateAccount.sign({ hash: digest });
  const authToken = concatHex([signature, fields]);

  cachedAuthToken = { authToken, expiresAt };
  return authToken;
}

function isAllowedJsonRpcRequest(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const method = (payload as { method?: unknown }).method;
  return (
    typeof method === "string" && PUBLIC_AGGREGATE_ZONE_METHODS.has(method)
  );
}

function isBatchAggregateJsonRpcRequest(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const method = (payload as { method?: unknown }).method;
  return typeof method === "string" && BATCH_AGGREGATE_ZONE_METHODS.has(method);
}
