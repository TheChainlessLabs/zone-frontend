import { defineChain, http, type Address, type Hex } from "viem";
import { createConfig } from "wagmi";
import { dangerous_secp256k1, tempoWallet } from "wagmi/tempo";
import { Dialog } from "accounts";

const DEFAULT_TEMPO_RPC_URL = "https://rpc.moderato.tempo.xyz";
const DEFAULT_ZONE_PUBLIC_RPC_URL = "https://omega-zone.example.com/";
const DEFAULT_ZONE_PRIVATE_RPC_URL =
  "https://omega-zone.example.com/private";
const DEFAULT_ZONE_SERVER_PUBLIC_RPC_URL = "http://omega-zone-gateway:8080/";
const DEFAULT_ZONE_SERVER_PRIVATE_RPC_URL =
  "http://omega-zone-gateway:8080/private";

// Zone-specific identifiers are env-driven with NO hardcoded default zone — the
// committed source pins no particular zone. Provide them via env (.env.local for
// local dev, deployment env for prod, vitest `test.env` for tests):
//   NEXT_PUBLIC_OMEGA_ZONE_ID, NEXT_PUBLIC_OMEGA_ZONE_CHAIN_ID,
//   NEXT_PUBLIC_OMEGA_ZONE_PORTAL, NEXT_PUBLIC_OMEGA_ZONE_OALPHA.
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
  oalpha: (process.env.NEXT_PUBLIC_OMEGA_ZONE_OALPHA ?? "") as Address,
  darkpool: "0x0b00000000000000000000000000000000000001" as Address,

  tempoState: "0x1c00000000000000000000000000000000000000" as Address,
  zoneInbox: "0x1c00000000000000000000000000000000000001" as Address,
  zoneOutbox: "0x1c00000000000000000000000000000000000002" as Address,
};

export const OMEGA_ZONE_ADDRESSES = {
  portal: OMEGA_ZONE.portal,
  pathUsd: OMEGA_ZONE.pathUsd,
  oalpha: OMEGA_ZONE.oalpha,
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
  id: 42431,
  name: "Tempo Testnet (Moderato)",
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [OMEGA_ZONE.tempoRpc],
      webSocket: ["wss://rpc.moderato.tempo.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: process.env.NEXT_PUBLIC_TEMPO_EXPLORER_URL ??
        "https://explore.testnet.tempo.xyz",
    },
  },
  testnet: true,
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
      // Force the in-page iframe dialog. The connector's default picks
      // `Dialog.popup()` whenever `isInsecureContext()` is true, and that
      // helper flags *any* `http:` origin as insecure — including
      // `http://localhost`, which browsers actually treat as a secure context
      // (WebAuthn works there). On dev that fallback popped a separate browser
      // window on connect. `Dialog.iframe()` keeps the wallet in the same
      // window and still self-falls-back to a popup only where the browser
      // genuinely can't embed it (Safari `wallet_connect`, or an untrusted
      // host without IntersectionObserver v2). SSR-safe: `iframe()` returns a
      // no-op when `window` is undefined.
      //
      // Skipped under vitest/jsdom: the iframe bootstrap touches browser
      // globals that jsdom tears down mid-async, spraying noise into the test
      // log. Tests don't exercise the dialog, so we let the connector keep its
      // library default there.
      ...(isVitest ? {} : { dialog: Dialog.iframe() }),
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
