import {
  concatHex,
  isHex,
  hashTypedData,
  numberToHex,
  serializeTypedData,
  type Address,
  type Hex,
} from "viem";

import { OMEGA_ZONE } from "./config";

export interface ZoneAuthWindow {
  issuedAt?: number | bigint;
  expiresAt?: number | bigint;
}

export interface ZoneAuthFieldsParams extends ZoneAuthWindow {
  zoneId?: number;
  chainId?: number | bigint;
}

export interface TempoZoneAuthProvider {
  request(parameters: {
    method: "eth_signTypedData_v4";
    params: [Address, string];
  }): Promise<unknown>;
}

export const ZONE_RPC_AUTH_EIP712_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
  ],
  ZoneRPCAuth: [
    { name: "zoneId", type: "uint32" },
    { name: "issuedAt", type: "uint64" },
    { name: "expiresAt", type: "uint64" },
  ],
} as const;

export type ZoneRpcAuthTypedData = {
  types: typeof ZONE_RPC_AUTH_EIP712_TYPES;
  primaryType: "ZoneRPCAuth";
  domain: {
    name: "TempoZoneRPC";
    version: "1";
    chainId: bigint;
  };
  message: {
    zoneId: number;
    issuedAt: bigint;
    expiresAt: bigint;
  };
};

export interface BuildZoneRpcAuthTokenParams extends ZoneAuthWindow {
  account: Address;
  provider: TempoZoneAuthProvider;
}

export interface GetOrCreateZoneRpcAuthTokenParams extends ZoneAuthWindow {
  account: Address;
  getProvider: () => Promise<TempoZoneAuthProvider>;
  forceRefresh?: boolean;
  onToken?: (authToken: Hex) => void;
}

export interface ZoneRpcAuthTokenFields {
  version: number;
  zoneId: number;
  chainId: bigint;
  issuedAt: bigint;
  expiresAt: bigint;
}

interface PersistedZoneRpcAuthToken {
  account: Address;
  authToken: Hex;
  expiresAt: number;
}

const ZONE_AUTH_COOKIE = "omega-zone-auth-token";
const ZONE_AUTH_STORAGE_KEY_PREFIX = "omega-zone:auth-token";
const LEGACY_ZONE_AUTH_STORAGE_KEY = ZONE_AUTH_STORAGE_KEY_PREFIX;
const ZONE_AUTH_FIELDS_HEX_LENGTH = 58;
const VERSION_EIP712 = 1;
const AUTH_TOKEN_VALIDITY_SECONDS = 10 * 60;
const inFlightZoneRpcAuthTokens = new Map<string, Promise<Hex>>();

export function encodeZoneRpcAuthFields({
  zoneId = OMEGA_ZONE.zoneId,
  chainId = OMEGA_ZONE.chainId,
  issuedAt,
  expiresAt,
}: ZoneAuthFieldsParams = {}): Hex {
  const issued = issuedAt === undefined ? unixNow() : BigInt(issuedAt);
  const expires =
    expiresAt === undefined
      ? issued + BigInt(AUTH_TOKEN_VALIDITY_SECONDS)
      : BigInt(expiresAt);

  return concatHex([
    numberToHex(VERSION_EIP712, { size: 1 }),
    numberToHex(zoneId, { size: 4 }),
    numberToHex(BigInt(chainId), { size: 8 }),
    numberToHex(issued, { size: 8 }),
    numberToHex(expires, { size: 8 }),
  ]);
}

export function buildZoneRpcAuthTypedData({
  zoneId = OMEGA_ZONE.zoneId,
  chainId = OMEGA_ZONE.chainId,
  issuedAt,
  expiresAt,
}: ZoneAuthFieldsParams = {}): ZoneRpcAuthTypedData {
  const issued = issuedAt === undefined ? unixNow() : BigInt(issuedAt);
  const expires =
    expiresAt === undefined
      ? issued + BigInt(AUTH_TOKEN_VALIDITY_SECONDS)
      : BigInt(expiresAt);

  return {
    types: ZONE_RPC_AUTH_EIP712_TYPES,
    primaryType: "ZoneRPCAuth",
    domain: {
      name: "TempoZoneRPC",
      version: "1",
      chainId: BigInt(chainId),
    },
    message: {
      zoneId,
      issuedAt: issued,
      expiresAt: expires,
    },
  } as const;
}

export function zoneRpcAuthDigest(fields: Hex): Hex {
  const auth = decodeZoneRpcAuthFields(fields);
  return hashTypedData({
    types: ZONE_RPC_AUTH_EIP712_TYPES,
    primaryType: "ZoneRPCAuth",
    domain: {
      name: "TempoZoneRPC",
      version: "1",
      chainId: auth.chainId,
    },
    message: {
      zoneId: auth.zoneId,
      issuedAt: auth.issuedAt,
      expiresAt: auth.expiresAt,
    },
  });
}

function decodeZoneRpcAuthFields(fields: string): ZoneRpcAuthTokenFields {
  const rawFields = fields.startsWith("0x") ? fields.slice(2) : fields;
  if (rawFields.length !== ZONE_AUTH_FIELDS_HEX_LENGTH) {
    throw new Error("Invalid Omega Zone auth token.");
  }

  return {
    version: Number.parseInt(rawFields.slice(0, 2), 16),
    zoneId: Number.parseInt(rawFields.slice(2, 10), 16),
    chainId: BigInt(`0x${rawFields.slice(10, 26)}`),
    issuedAt: BigInt(`0x${rawFields.slice(26, 42)}`),
    expiresAt: BigInt(`0x${rawFields.slice(42, 58)}`),
  };
}

export function decodeZoneRpcAuthTokenFields(
  authToken: Hex,
): ZoneRpcAuthTokenFields {
  return decodeZoneRpcAuthFields(authToken.slice(-ZONE_AUTH_FIELDS_HEX_LENGTH));
}

export async function buildZoneRpcAuthToken({
  account,
  provider,
  issuedAt,
  expiresAt,
}: BuildZoneRpcAuthTokenParams): Promise<Hex> {
  const typedData = buildZoneRpcAuthTypedData({ issuedAt, expiresAt });
  const fields = encodeZoneRpcAuthFields({ issuedAt, expiresAt });
  let signature: unknown;

  try {
    signature = await provider.request({
      method: "eth_signTypedData_v4",
      params: [account, serializeTypedData(typedData)],
    });
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Tempo Wallet failed to sign the authorization token.");
  }

  if (!isHexSignature(signature)) {
    throw new Error("Tempo Wallet returned an invalid authorization signature.");
  }

  return concatHex([signature, fields]);
}

export async function getOrCreateZoneRpcAuthToken({
  account,
  getProvider,
  issuedAt,
  expiresAt,
  forceRefresh = false,
  onToken,
}: GetOrCreateZoneRpcAuthTokenParams): Promise<Hex> {
  const key = account.toLowerCase();

  if (forceRefresh) {
    inFlightZoneRpcAuthTokens.delete(key);
    clearPersistedZoneRpcAuthToken(account);
  } else {
    const cached = readPersistedZoneRpcAuthToken(account);
    if (cached && !isZoneRpcAuthTokenExpired(cached)) {
      onToken?.(cached);
      return cached;
    }

    const inFlight = inFlightZoneRpcAuthTokens.get(key);
    if (inFlight) {
      const authToken = await inFlight;
      onToken?.(authToken);
      return authToken;
    }
  }

  const authTokenPromise = getProvider()
    .then((provider) =>
      buildZoneRpcAuthToken({
        account,
        provider,
        issuedAt,
        expiresAt,
      }),
    )
    .then((authToken) => {
      persistZoneRpcAuthToken(authToken, account);
      onToken?.(authToken);
      return authToken;
    });

  inFlightZoneRpcAuthTokens.set(key, authTokenPromise);
  try {
    return await authTokenPromise;
  } finally {
    if (inFlightZoneRpcAuthTokens.get(key) === authTokenPromise) {
      inFlightZoneRpcAuthTokens.delete(key);
    }
  }
}

export function persistZoneRpcAuthToken(
  authToken: Hex,
  account?: Address,
  maxAgeSeconds?: number,
) {
  if (typeof document === "undefined") return;
  if (typeof window !== "undefined" && account) {
    const fields = decodeZoneRpcAuthTokenFields(authToken);
    const payload: PersistedZoneRpcAuthToken = {
      account,
      authToken,
      expiresAt: Number(fields.expiresAt),
    };
    window.sessionStorage.setItem(
      zoneAuthStorageKey(account),
      JSON.stringify(payload),
    );
    window.localStorage.removeItem(LEGACY_ZONE_AUTH_STORAGE_KEY);
  }

  const fields = decodeZoneRpcAuthTokenFields(authToken);
  const tokenMaxAge =
    maxAgeSeconds ??
    Math.max(0, Number(fields.expiresAt) - Math.floor(Date.now() / 1000));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = [
    `${ZONE_AUTH_COOKIE}=${authToken}`,
    "Path=/api/omega-zone",
    `Max-Age=${tokenMaxAge}`,
    "SameSite=Lax",
    secure,
  ].join("; ");
}

export function readPersistedZoneRpcAuthToken(
  account: Address | undefined,
): Hex | null {
  if (!account || typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(zoneAuthStorageKey(account));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedZoneRpcAuthToken>;
    if (
      !parsed.account ||
      !parsed.authToken ||
      !isHex(parsed.authToken) ||
      parsed.account.toLowerCase() !== account.toLowerCase()
    ) {
      return null;
    }

    const fields = decodeZoneRpcAuthTokenFields(parsed.authToken);
    if (
      fields.version !== VERSION_EIP712 ||
      fields.zoneId !== OMEGA_ZONE.zoneId ||
      fields.chainId !== BigInt(OMEGA_ZONE.chainId)
    ) {
      return null;
    }

    const expiresAt = parsed.expiresAt ?? Number(fields.expiresAt);
    if (expiresAt <= Math.floor(Date.now() / 1000) + 5) {
      clearPersistedZoneRpcAuthToken(account);
      return null;
    }

    return parsed.authToken;
  } catch {
    clearPersistedZoneRpcAuthToken(account);
    return null;
  }
}

/**
 * True when `authToken` is expired or within `bufferSeconds` of expiring (or is
 * unparseable). Callers re-mint a fresh token before using it so a stale token
 * never reaches the private RPC (which rejects it with HTTP 403).
 */
export function isZoneRpcAuthTokenExpired(
  authToken: Hex,
  bufferSeconds = 60,
): boolean {
  try {
    const { expiresAt } = decodeZoneRpcAuthTokenFields(authToken);
    return Number(expiresAt) <= Math.floor(Date.now() / 1000) + bufferSeconds;
  } catch {
    return true;
  }
}

export function clearPersistedZoneRpcAuthToken(account?: Address) {
  if (typeof document === "undefined") return;
  if (typeof window !== "undefined") {
    if (account) {
      window.sessionStorage.removeItem(zoneAuthStorageKey(account));
    } else {
      for (let index = window.sessionStorage.length - 1; index >= 0; index--) {
        const key = window.sessionStorage.key(index);
        if (key?.startsWith(`${ZONE_AUTH_STORAGE_KEY_PREFIX}:`)) {
          window.sessionStorage.removeItem(key);
        }
      }
    }
    window.localStorage.removeItem(LEGACY_ZONE_AUTH_STORAGE_KEY);
  }
  document.cookie = [
    `${ZONE_AUTH_COOKIE}=`,
    "Path=/api/omega-zone",
    "Max-Age=0",
    "SameSite=Lax",
  ].join("; ");
}

function zoneAuthStorageKey(account: Address): string {
  return `${ZONE_AUTH_STORAGE_KEY_PREFIX}:${account.toLowerCase()}:${OMEGA_ZONE.chainId}`;
}

function isHexSignature(value: unknown): value is Hex {
  return (
    typeof value === "string" &&
    /^0x[0-9a-f]+$/i.test(value) &&
    value.length > 2 &&
    value.length % 2 === 0
  );
}

function unixNow(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}
