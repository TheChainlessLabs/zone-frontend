/**
 * Dev-only test wallet support for the Omega Zone integration.
 *
 * Gated entirely by `NEXT_PUBLIC_DEV_WALLET_PK`: when that env var is unset
 * (production, previews, CI), every export here is inert and no dev code path
 * is reachable. When it IS set (local zone-integration testing), it backs two
 * connectors:
 *
 * a key-backed `dangerous_secp256k1` wagmi connector (see `config.ts`) that
 * connects the test address without the interactive Tempo iframe. Zone auth is
 * signed through that connector's standard `eth_signTypedData_v4` provider path.
 */
import type { Address, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

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

/** The dev test wallet's address, or `null` when the dev wallet is disabled. */
export const devWalletAddress: Address | null = devPrivateKey
  ? privateKeyToAccount(devPrivateKey).address
  : null;

/** The dev maker wallet's address, or `null` when the maker wallet is disabled. */
export const makerWalletAddress: Address | null = makerPrivateKey
  ? privateKeyToAccount(makerPrivateKey).address
  : null;

/** True when at least one dev wallet (test or maker) is configured. */
export const isDevWalletEnabled = Boolean(devPrivateKey || makerPrivateKey);
