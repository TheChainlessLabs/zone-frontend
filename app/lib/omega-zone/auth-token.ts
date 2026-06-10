import {
  concatHex,
  isHex,
  keccak256,
  numberToHex,
  stringToHex,
  type Address,
  type Hex,
} from "viem";

import { OMEGA_ZONE } from "./config";
import { getDevAuthSigner } from "./dev-wallet";

export interface ZoneAuthWindow {
  issuedAt?: number | bigint;
  expiresAt?: number | bigint;
}

export interface ZoneAuthFieldsParams extends ZoneAuthWindow {
  zoneId?: number;
  chainId?: number | bigint;
}

export interface TempoNativeAuthSigner {
  signTempoZoneRpcAuthToken?: (parameters: {
    account: Address;
    digest: Hex;
    fields: Hex;
  }) => Promise<Hex>;
  signTempoZoneRpcAuthDigest?: (parameters: {
    account: Address;
    digest: Hex;
    fields: Hex;
  }) => Promise<Hex>;
  request?: (parameters: {
    method: string;
    params?: readonly unknown[];
  }) => Promise<unknown>;
}

export interface BuildZoneRpcAuthTokenParams extends ZoneAuthWindow {
  account: Address;
  signMessage: (parameters: {
    account: Address;
    message: { raw: Hex };
  }) => Promise<Hex>;
  nativeSigner?: TempoNativeAuthSigner;
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

const TEMPO_NATIVE_RPC_SIGN_METHODS = [
  "tempo_signZoneRpcAuthToken",
  "tempo_signZoneRpcAuthDigest",
  "tempo_signAuthorizationToken",
] as const;
const ZONE_AUTH_COOKIE = "omega-zone-auth-token";
const ZONE_AUTH_STORAGE_KEY = "omega-zone:auth-token";
const ZONE_AUTH_FIELDS_HEX_LENGTH = 58;
const DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS = 15 * 60;

export function encodeZoneRpcAuthFields({
  zoneId = OMEGA_ZONE.zoneId,
  chainId = OMEGA_ZONE.chainId,
  issuedAt,
  expiresAt,
}: ZoneAuthFieldsParams = {}): Hex {
  const issued = issuedAt === undefined ? unixNow() : BigInt(issuedAt);
  const expires =
    expiresAt === undefined ? issued + BigInt(15 * 60) : BigInt(expiresAt);

  return concatHex([
    numberToHex(0, { size: 1 }),
    numberToHex(zoneId, { size: 4 }),
    numberToHex(BigInt(chainId), { size: 8 }),
    numberToHex(issued, { size: 8 }),
    numberToHex(expires, { size: 8 }),
  ]);
}

export function zoneRpcAuthDigest(fields: Hex): Hex {
  return keccak256(
    concatHex([stringToHex("TempoZoneRPC", { size: 32 }), fields]),
  );
}

export function decodeZoneRpcAuthTokenFields(
  authToken: Hex,
): ZoneRpcAuthTokenFields {
  const fields = authToken.slice(-ZONE_AUTH_FIELDS_HEX_LENGTH);
  if (fields.length !== ZONE_AUTH_FIELDS_HEX_LENGTH) {
    throw new Error("Invalid Omega Zone auth token.");
  }

  return {
    version: Number.parseInt(fields.slice(0, 2), 16),
    zoneId: Number.parseInt(fields.slice(2, 10), 16),
    chainId: BigInt(`0x${fields.slice(10, 26)}`),
    issuedAt: BigInt(`0x${fields.slice(26, 42)}`),
    expiresAt: BigInt(`0x${fields.slice(42, 58)}`),
  };
}

export async function buildZoneRpcAuthToken({
  account,
  signMessage,
  nativeSigner,
  issuedAt,
  expiresAt,
}: BuildZoneRpcAuthTokenParams): Promise<Hex> {
  const fields = encodeZoneRpcAuthFields({ issuedAt, expiresAt });
  const digest = zoneRpcAuthDigest(fields);
  const signature =
    (await signWithNativeTempoWallet({
      account,
      digest,
      fields,
      nativeSigner,
    })) ??
    (await signMessage({
      account,
      message: { raw: digest },
    }));

  return concatHex([signature, fields]);
}

export function getTempoNativeAuthSigner(
  walletClient: unknown,
): TempoNativeAuthSigner | undefined {
  const candidate = walletClient as Partial<TempoNativeAuthSigner> | undefined;
  if (candidate?.signTempoZoneRpcAuthDigest || candidate?.signTempoZoneRpcAuthToken) {
    return candidate as TempoNativeAuthSigner;
  }
  // Dev-only: when the test wallet is enabled (NEXT_PUBLIC_DEV_WALLET_PK) and the
  // connected client can't sign the zone auth digest natively, sign in-process
  // with the test key. Inert in production (returns undefined).
  return getDevAuthSigner();
}

export function persistZoneRpcAuthToken(
  authToken: Hex,
  account?: Address,
  maxAgeSeconds = DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS,
) {
  if (typeof document === "undefined") return;
  if (typeof window !== "undefined" && account) {
    const fields = decodeZoneRpcAuthTokenFields(authToken);
    const payload: PersistedZoneRpcAuthToken = {
      account,
      authToken,
      expiresAt: Number(fields.expiresAt),
    };
    window.localStorage.setItem(ZONE_AUTH_STORAGE_KEY, JSON.stringify(payload));
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = [
    `${ZONE_AUTH_COOKIE}=${authToken}`,
    "Path=/api/omega-zone",
    `Max-Age=${maxAgeSeconds}`,
    "SameSite=Lax",
    secure,
  ].join("; ");
}

export function readPersistedZoneRpcAuthToken(
  account: Address | undefined,
): Hex | null {
  if (!account || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ZONE_AUTH_STORAGE_KEY);
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
      fields.version !== 0 ||
      fields.zoneId !== OMEGA_ZONE.zoneId ||
      fields.chainId !== BigInt(OMEGA_ZONE.chainId)
    ) {
      return null;
    }

    const expiresAt = parsed.expiresAt ?? Number(fields.expiresAt);
    if (expiresAt <= Math.floor(Date.now() / 1000) + 5) {
      clearPersistedZoneRpcAuthToken();
      return null;
    }

    return parsed.authToken;
  } catch {
    clearPersistedZoneRpcAuthToken();
    return null;
  }
}

export function clearPersistedZoneRpcAuthToken() {
  if (typeof document === "undefined") return;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ZONE_AUTH_STORAGE_KEY);
  }
  document.cookie = [
    `${ZONE_AUTH_COOKIE}=`,
    "Path=/api/omega-zone",
    "Max-Age=0",
    "SameSite=Lax",
  ].join("; ");
}

async function signWithNativeTempoWallet({
  account,
  digest,
  fields,
  nativeSigner,
}: {
  account: Address;
  digest: Hex;
  fields: Hex;
  nativeSigner?: TempoNativeAuthSigner;
}): Promise<Hex | null> {
  if (!nativeSigner) return null;

  if (nativeSigner.signTempoZoneRpcAuthToken) {
    return nativeSigner.signTempoZoneRpcAuthToken({ account, digest, fields });
  }
  if (nativeSigner.signTempoZoneRpcAuthDigest) {
    return nativeSigner.signTempoZoneRpcAuthDigest({ account, digest, fields });
  }
  if (!nativeSigner.request) return null;

  for (const method of TEMPO_NATIVE_RPC_SIGN_METHODS) {
    try {
      const result = await nativeSigner.request({
        method,
        params: [
          {
            account,
            digest,
            fields,
            zoneId: OMEGA_ZONE.zoneId,
            chainId: OMEGA_ZONE.chainId,
          },
        ],
      });
      if (typeof result === "string" && isHex(result)) return result;
    } catch {
      // Not all Tempo Wallet builds expose a native auth-token signer yet.
    }
  }

  return null;
}

function unixNow(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}
