import { defineChain, http, type Address, type Hex } from "viem";
import { tempoModerato } from "viem/chains";
import { createConfig } from "wagmi";
import { dangerous_secp256k1, tempoWallet } from "wagmi/tempo";

const DEFAULT_TEMPO_RPC_URL = "https://rpc.moderato.tempo.xyz";
const DEFAULT_ZONE_PUBLIC_RPC_URL = "http://localhost:8546";
const DEFAULT_ZONE_PRIVATE_RPC_URL = "http://localhost:8544";
const DEFAULT_ZONE_SERVER_PUBLIC_RPC_URL = DEFAULT_ZONE_PUBLIC_RPC_URL;
const DEFAULT_ZONE_SERVER_PRIVATE_RPC_URL = DEFAULT_ZONE_PRIVATE_RPC_URL;

// Zone-specific identifiers are env-driven with NO hardcoded default zone — the
// committed source pins no particular zone. Provide them via env (.env.local for
// local dev, deployment env for prod, vitest `test.env` for tests):
//   NEXT_PUBLIC_OMEGA_ZONE_ID, NEXT_PUBLIC_OMEGA_ZONE_CHAIN_ID,
//   NEXT_PUBLIC_OMEGA_ZONE_PORTAL.
// chainIdHex is derived from the chainId. The remaining addresses (pathUsd,
// darkpool, tempoState, zone in/outbox) are fixed precompiles, identical across
// zones, so they stay in source.
const ZONE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_OMEGA_ZONE_CHAIN_ID);

export const OMEGA_ZONE = {
  tempoRpc:
    process.env.NEXT_PUBLIC_TEMPO_RPC_URL ?? DEFAULT_TEMPO_RPC_URL,
  zoneRpc:
    process.env.NEXT_PUBLIC_ZONE_RPC_URL ?? DEFAULT_ZONE_PUBLIC_RPC_URL,
  zonePrivateRpc:
    process.env.NEXT_PUBLIC_ZONE_PRIVATE_RPC_URL ??
    DEFAULT_ZONE_PRIVATE_RPC_URL,
  zoneServerRpc:
    process.env.OMEGA_ZONE_RPC_URL ??
    process.env.ZONE_RPC_URL ??
    DEFAULT_ZONE_SERVER_PUBLIC_RPC_URL,
  zoneServerPrivateRpc:
    process.env.OMEGA_ZONE_PRIVATE_RPC_URL ??
    process.env.ZONE_PRIVATE_RPC_URL ??
    DEFAULT_ZONE_SERVER_PRIVATE_RPC_URL,

  zoneId: Number(process.env.NEXT_PUBLIC_OMEGA_ZONE_ID),
  chainId: ZONE_CHAIN_ID,
  chainIdHex: `0x${ZONE_CHAIN_ID.toString(16)}` as Hex,

  portal: (process.env.NEXT_PUBLIC_OMEGA_ZONE_PORTAL ?? "") as Address,
  pathUsd: "0x20c0000000000000000000000000000000000000" as Address,
  alphaUsd: "0x20c0000000000000000000000000000000000001" as Address,
  darkpool: "0x0b00000000000000000000000000000000000001" as Address,

  tempoState: "0x1c00000000000000000000000000000000000000" as Address,
  zoneInbox: "0x1c00000000000000000000000000000000000001" as Address,
  zoneOutbox: "0x1c00000000000000000000000000000000000002" as Address,
};

export const OMEGA_ZONE_ADDRESSES = {
  portal: OMEGA_ZONE.portal,
  pathUsd: OMEGA_ZONE.pathUsd,
  alphaUsd: OMEGA_ZONE.alphaUsd,
  darkpool: OMEGA_ZONE.darkpool,
  tempoState: OMEGA_ZONE.tempoState,
  zoneInbox: OMEGA_ZONE.zoneInbox,
  zoneOutbox: OMEGA_ZONE.zoneOutbox,
} as const satisfies Record<string, Address>;

export const OMEGA_ZONE_RPC_URLS = {
  tempoL1: OMEGA_ZONE.tempoRpc,
  publicBrowser: OMEGA_ZONE.zoneRpc,
  privateBrowser: OMEGA_ZONE.zonePrivateRpc,
  publicServer: OMEGA_ZONE.zoneServerRpc,
  privateServer: OMEGA_ZONE.zoneServerPrivateRpc,
} as const;

export const OMEGA_ZONE_RPC_PROXY_URLS = {
  public: "/api/omega-zone/public-rpc",
  private: "/api/omega-zone/private-rpc",
} as const;

export function zonePublicRpcUrl(): string {
  return typeof window === "undefined"
    ? OMEGA_ZONE_RPC_URLS.publicServer
    : OMEGA_ZONE_RPC_PROXY_URLS.public;
}

export function zonePrivateRpcUrl(): string {
  return typeof window === "undefined"
    ? OMEGA_ZONE_RPC_URLS.privateServer
    : OMEGA_ZONE_RPC_PROXY_URLS.private;
}

export const ZERO_MEMO =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

/** True inside the vitest/jsdom unit-test run. */
const isVitest =
  typeof process !== "undefined" &&
  (process.env.VITEST === "true" || process.env.NODE_ENV === "test");

/**
 * Dev-only test wallet private key. When `NEXT_PUBLIC_DEV_WALLET_PK` is set to a
 * valid 32-byte hex key, a key-backed `dangerous_secp256k1` connector is added
 * so the test wallet can connect without the interactive Tempo iframe (used for
 * verifying owner-scoped zone surfaces locally). Unset in production → no dev
 * connector is registered. Never set this in a deployed environment.
 */
function parseDevKey(raw: string | undefined): Hex | null {
  if (isVitest) return null;
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return /^0x[0-9a-fA-F]{64}$/.test(hex) ? (hex as Hex) : null;
}

const devWalletPrivateKey = parseDevKey(process.env.NEXT_PUBLIC_DEV_WALLET_PK);
// Optional second dev wallet used as a market MAKER, so a real two-party fill
// can be created on the local zone (the darkpool blocks self-trading).
const makerWalletPrivateKey = parseDevKey(
  process.env.NEXT_PUBLIC_MAKER_WALLET_PK,
);

export const tempoL1Chain = defineChain({
  ...tempoModerato,
  rpcUrls: {
    default: {
      http: [OMEGA_ZONE.tempoRpc],
      webSocket: tempoModerato.rpcUrls.default.webSocket,
    },
  },
  blockExplorers: {
    default: {
      name: tempoModerato.blockExplorers.default.name,
      url: process.env.NEXT_PUBLIC_TEMPO_EXPLORER_URL ??
        tempoModerato.blockExplorers.default.url,
    },
  },
});

export const omegaZoneChain = defineChain({
  id: OMEGA_ZONE.chainId,
  name: "Omega Zone",
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [zonePublicRpcUrl()],
    },
  },
  testnet: true,
});

export const OMEGA_ZONE_CHAIN_ID = omegaZoneChain.id;
export const OMEGA_ZONE_CHAIN_NAME = omegaZoneChain.name;
export const OMEGA_TEMPO_L1_CHAIN_ID = tempoL1Chain.id;
export const OMEGA_TEMPO_L1_CHAIN_NAME = tempoL1Chain.name;
export const OMEGA_TEMPO_EXPLORER_URL =
  tempoL1Chain.blockExplorers.default.url;

export const omegaZoneConfig = createConfig({
  chains: [tempoL1Chain, omegaZoneChain],
  connectors: [
    tempoWallet({
      name: "Tempo Wallet",
      testnet: true,
      // Let the Tempo/accounts SDK choose iframe vs popup. WebAuthn passkeys
      // cannot reliably run in cross-origin iframes when the host origin is
      // HTTP or has TLS certificate errors, so the SDK falls back to popup for
      // those WebAuthn-sensitive cases.
    }),
    // Dev-only: a key-backed test wallet that connects without the interactive
    // Tempo iframe, for verifying owner-scoped zone surfaces locally. Only
    // registered when NEXT_PUBLIC_DEV_WALLET_PK is a valid key (never in prod).
    ...(devWalletPrivateKey
      ? [
          dangerous_secp256k1({
            name: "Test Wallet (dev)",
            testnet: true,
            privateKey: devWalletPrivateKey,
          }),
        ]
      : []),
    // Dev-only: a second key-backed wallet acting as a MAKER, so a real
    // two-party fill can be produced locally (the darkpool blocks self-trades).
    ...(makerWalletPrivateKey
      ? [
          dangerous_secp256k1({
            name: "Maker Wallet (dev)",
            testnet: true,
            privateKey: makerWalletPrivateKey,
          }),
        ]
      : []),
  ],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [omegaZoneChain.id]: http(zonePublicRpcUrl()),
    [tempoL1Chain.id]: http(OMEGA_ZONE.tempoRpc),
  },
});

export function tempoAddressUrl(address: string): string {
  return `${OMEGA_TEMPO_EXPLORER_URL}/address/${address}`;
}

export function tempoTxUrl(txHash: string): string {
  return `${OMEGA_TEMPO_EXPLORER_URL}/tx/${txHash}`;
}
