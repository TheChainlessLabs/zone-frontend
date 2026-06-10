/**
 * Dev-only test wallet support for the Omega Zone integration.
 *
 * Gated entirely by `NEXT_PUBLIC_DEV_WALLET_PK`: when that env var is unset
 * (production, previews, CI), every export here is inert and no dev code path
 * is reachable. When it IS set (local zone-integration testing), it backs two
 * things:
 *
 *   1. a key-backed `dangerous_secp256k1` wagmi connector (see `config.ts`)
 *      that connects the test address without the interactive Tempo iframe, and
 *   2. a native zone-auth signer (below) that signs the zone RPC auth digest
 *      in-process with the test key.
 *
 * Why (2) is needed: the secp256k1-backed Tempo provider does not implement the
 * zone-rpc auth-token signing methods, and a generic `personal_sign` fallback
 * would apply the EIP-191 envelope — which the zone's raw-digest recovery does
 * not expect. Signing the raw digest here (matching the zone's
 * `cast wallet sign --no-hash` reference) yields a token the zone accepts.
 *
 * The private key only ever signs the short-lived zone auth digest; never use
 * this for anything outside local testnet testing.
 */
import type { Address, Hex } from "viem";
import { privateKeyToAccount, sign } from "viem/accounts";

import type { TempoNativeAuthSigner } from "./auth-token";

function normalizePrivateKey(raw: string | undefined): Hex | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return /^0x[0-9a-fA-F]{64}$/.test(hex) ? (hex as Hex) : null;
}

const devPrivateKey = normalizePrivateKey(process.env.NEXT_PUBLIC_DEV_WALLET_PK);
const makerPrivateKey = normalizePrivateKey(
  process.env.NEXT_PUBLIC_MAKER_WALLET_PK,
);

/** lowercase dev address → its private key, for every configured dev wallet. */
const devKeyByAddress = new Map<string, Hex>();
for (const pk of [devPrivateKey, makerPrivateKey]) {
  if (pk) devKeyByAddress.set(privateKeyToAccount(pk).address.toLowerCase(), pk);
}

/** The dev test wallet's address, or `null` when the dev wallet is disabled. */
export const devWalletAddress: Address | null = devPrivateKey
  ? privateKeyToAccount(devPrivateKey).address
  : null;

/** The dev maker wallet's address, or `null` when the maker wallet is disabled. */
export const makerWalletAddress: Address | null = makerPrivateKey
  ? privateKeyToAccount(makerPrivateKey).address
  : null;

/** True when at least one dev wallet (test or maker) is configured. */
export const isDevWalletEnabled = devKeyByAddress.size > 0;

/**
 * A native zone-auth signer backed by the dev keys, or `undefined` when no dev
 * wallet is configured. Used as the fallback signer in `getTempoNativeAuthSigner`
 * so a key-backed dev wallet can produce a zone-valid auth token without the
 * interactive Tempo wallet. Signs with the key that matches the CONNECTED
 * account, so the test wallet and the maker each get a token for themselves.
 */
export function getDevAuthSigner(): TempoNativeAuthSigner | undefined {
  if (devKeyByAddress.size === 0) return undefined;
  return {
    async signTempoZoneRpcAuthDigest({ account, digest }) {
      const privateKey =
        devKeyByAddress.get(account.toLowerCase()) ?? devPrivateKey;
      if (!privateKey) {
        throw new Error(
          `[omega-zone] no dev key configured for connected account ${account}`,
        );
      }
      return sign({ hash: digest, privateKey, to: "hex" });
    },
  };
}
