import { expect, it } from "vitest";

import {
  accountFixtures,
  batchesDetailFixtures,
  batchesListFixtures,
  batchesSearchFixtures,
  connectModalFixtures,
  DEFAULT_PAIR,
  depositModalFixtures,
  LAUNCH_PAIRS,
  orderConfirmationModalFixtures,
  portfolioFixtures,
  tradeFixtures,
  VALID_STATES,
  withdrawModalFixtures,
} from "@/lib/fixtures";

it("LAUNCH_PAIRS has the 5 v0 launch pairs and USDC/EURC is the default", () => {
  expect(LAUNCH_PAIRS).toHaveLength(5);
  expect(LAUNCH_PAIRS.map((p) => p.pair)).toEqual([
    "USDC/EURC",
    "USDC/USDT",
    "USDT/EURC",
    "ETH/USDC",
    "BTC/USDC",
  ]);
  expect(DEFAULT_PAIR.pair).toBe("USDC/EURC");
});

it("LAUNCH_PAIRS uses stablecoin/crypto tokens only — no fiat tickers", () => {
  const FIAT = ["EUR", "USD", "GBP", "JPY"];
  for (const { base, quote } of LAUNCH_PAIRS) {
    expect(FIAT).not.toContain(base);
    expect(FIAT).not.toContain(quote);
  }
});

it("/trade exposes all seven page states", () => {
  for (const s of VALID_STATES) {
    expect(tradeFixtures[s]).toBeDefined();
  }
});

it("/portfolio exposes six page states — wrong-network is N/A", () => {
  expect(portfolioFixtures.default).toBeDefined();
  expect(portfolioFixtures.empty).toBeDefined();
  expect(portfolioFixtures.loading).toBeDefined();
  expect(portfolioFixtures.error).toBeDefined();
  expect(portfolioFixtures.skeleton).toBeDefined();
  expect(portfolioFixtures.disconnected).toBeDefined();
  // wrong-network intentionally absent — see portfolio/index.ts
  expect((portfolioFixtures as Record<string, unknown>)["wrong-network"]).toBeUndefined();
});

it("/batches list exposes default/empty/loading/error", () => {
  expect(batchesListFixtures.default.batches.length).toBeGreaterThan(0);
  expect(batchesListFixtures.empty.batches).toEqual([]);
  expect(batchesListFixtures.loading.isLoading).toBe(true);
  expect(batchesListFixtures.error.error?.code).toBe("EXPLORER_UNREACHABLE");
});

it("/batches detail exposes verified/pending/failed", () => {
  expect(batchesDetailFixtures.verified.batch.status).toBe("verified");
  expect(batchesDetailFixtures.pending.batch.status).toBe("pending");
  expect(batchesDetailFixtures.failed.batch.status).toBe("failed");
});

it("/batches search exposes results + no-results", () => {
  expect(batchesSearchFixtures.results.results.length).toBeGreaterThan(0);
  expect(batchesSearchFixtures["no-results"].results).toEqual([]);
});

it("/account exposes default + disconnected", () => {
  expect(accountFixtures.default.address).toBeDefined();
  expect(accountFixtures.disconnected.address).toBeNull();
});

it("Connect modal covers all five states", () => {
  expect(Object.keys(connectModalFixtures).sort()).toEqual([
    "connected",
    "connecting",
    "failed",
    "idle",
    "no-nft-pass",
  ]);
});

it("Deposit modal covers all six states", () => {
  expect(Object.keys(depositModalFixtures).sort()).toEqual([
    "approving",
    "depositing",
    "failed",
    "idle",
    "pending",
    "success",
  ]);
});

it("Withdraw modal covers all five states", () => {
  expect(Object.keys(withdrawModalFixtures).sort()).toEqual([
    "failed",
    "idle",
    "pending",
    "signing",
    "success",
  ]);
});

it("Order Confirmation modal covers all four states", () => {
  expect(Object.keys(orderConfirmationModalFixtures).sort()).toEqual([
    "failed",
    "idle",
    "signing",
    "submitting",
  ]);
});

it("trade fixtures use only LAUNCH_PAIRS", () => {
  const allowed = new Set(LAUNCH_PAIRS.map((p) => p.pair));
  for (const s of VALID_STATES) {
    expect(allowed.has(tradeFixtures[s].pair)).toBe(true);
  }
});
