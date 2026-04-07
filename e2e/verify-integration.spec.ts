import { test, expect } from "@playwright/test";

/**
 * Integration tests against a real backend with seeded data.
 *
 * Prerequisites:
 *   1. Backend running on :3000 (cd omega-e2e && just fe-boot)
 *   2. Data seeded via: cd omega-e2e && node seed-backend.mjs
 *   3. NEXT_PUBLIC_DEV_WALLET_PK set in app/.env.local (dev wallet auto-connects)
 *
 * The dev wallet (devWallet.ts) injects a real EIP-712 signing provider
 * backed by the Anvil test key. No MetaMask needed.
 */

const API_URL = "http://127.0.0.1:3000";
const DEV_WALLET_ADDRESS = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

test.describe("Backend API verification", () => {
  test("all endpoints reachable without CORS errors", async ({ page }) => {
    await page.goto("/trade");

    const results = await page.evaluate(async (apiUrl: string) => {
      const endpoints = [
        "/markets/1/book",
        "/markets/1/trades",
        "/markets/1/orders",
        "/accounts/1/balances",
        "/accounts/1/nonce",
      ];
      const statuses: Record<string, number> = {};
      for (const ep of endpoints) {
        const res = await fetch(`${apiUrl}${ep}`);
        statuses[ep] = res.status;
      }
      return statuses;
    }, API_URL);

    for (const [endpoint, status] of Object.entries(results)) {
      expect(status, `${endpoint} should return 200`).toBe(200);
    }
  });

  test("seeded balances are non-zero for USDC and USDT", async ({ page }) => {
    await page.goto("/trade");

    const balances = await page.evaluate(async (apiUrl: string) => {
      const res = await fetch(`${apiUrl}/accounts/1/balances`);
      return res.json();
    }, API_URL);

    expect(balances.account_id).toBe(1);

    const usdc = balances.balances.find(
      (b: { token_id: number }) => b.token_id === 1
    );
    expect(usdc, "USDC balance should exist").toBeTruthy();
    expect(BigInt(usdc.total)).toBeGreaterThan(0n);

    const usdt = balances.balances.find(
      (b: { token_id: number }) => b.token_id === 2
    );
    expect(usdt, "USDT balance should exist").toBeTruthy();
    expect(BigInt(usdt.total)).toBeGreaterThan(0n);
  });

  test("order book has seeded bids and asks", async ({ page }) => {
    await page.goto("/trade");

    const book = await page.evaluate(async (apiUrl: string) => {
      const res = await fetch(`${apiUrl}/markets/1/book`);
      return res.json();
    }, API_URL);

    expect(book.bids.length).toBeGreaterThanOrEqual(1);
    expect(book.asks.length).toBeGreaterThanOrEqual(1);
  });

  test("orders endpoint returns seeded orders for account 1", async ({
    page,
  }) => {
    await page.goto("/trade");

    const orders = await page.evaluate(async (apiUrl: string) => {
      const res = await fetch(`${apiUrl}/markets/1/orders`);
      return res.json();
    }, API_URL);

    expect(orders.orders.length).toBeGreaterThanOrEqual(2);
    for (const order of orders.orders) {
      expect(order.owner_account_id).toBe(1);
    }
  });
});

test.describe("Dev wallet auto-connection", () => {
  test("dev wallet injects and logs address on page load", async ({
    page,
  }) => {
    const devLogs: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("[Dev Wallet]")) {
        devLogs.push(msg.text());
      }
    });

    await page.goto("/trade");
    await page.waitForTimeout(2000);

    const injectionLog = devLogs.find((l) => l.includes("Injected"));
    expect(injectionLog).toContain(DEV_WALLET_ADDRESS);
  });

  test("no CORS errors in browser console", async ({ page }) => {
    const corsErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("CORS")) {
        corsErrors.push(msg.text());
      }
    });

    await page.goto("/trade");
    await page.waitForTimeout(3000);

    expect(corsErrors).toHaveLength(0);
  });

  test("pages load without runtime errors", async ({ page }) => {
    for (const path of ["/trade", "/portfolio", "/account", "/funding"]) {
      await page.goto(path);
      await page.waitForTimeout(1500);

      const body = await page.textContent("body");
      expect(body, `${path} should not have runtime errors`).not.toContain(
        "Unhandled Runtime Error"
      );
    }
  });
});
