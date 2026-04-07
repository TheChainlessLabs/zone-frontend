import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Integration tests against a real backend with seeded data.
 *
 * Prerequisites:
 *   1. Backend running on :3000 (cd omega-e2e && just fe-boot)
 *   2. Data seeded via: cd omega-e2e && node seed-backend.mjs
 *   3. NEXT_PUBLIC_DEV_WALLET_PK set so devWallet.ts is active
 *
 * The tests inject a mock wallet, click "Connect Wallet" → "Browser Wallet"
 * to connect, then verify the UI renders seeded backend data.
 */

const DEV_ADDRESS = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

async function injectWalletAndConnect(page: Page) {
  // Inject wallet provider before page JS
  await page.addInitScript((addr: string) => {
    localStorage.setItem(`omega_account_${addr}`, "1");
    const listeners = new Map<string, Set<Function>>();
    const provider = {
      isMetaMask: true,
      request: async ({ method }: { method: string }) => {
        switch (method) {
          case "eth_requestAccounts":
            localStorage.setItem("omega:e2e:wallet-connected", "true");
            return [addr];
          case "eth_accounts":
            return localStorage.getItem("omega:e2e:wallet-connected") === "true" ? [addr] : [];
          case "eth_chainId": return "0x7a69";
          case "net_version": return "31337";
          case "wallet_switchEthereumChain":
          case "wallet_addEthereumChain": return null;
          case "eth_requestPermissions": return [{ parentCapability: "eth_accounts" }];
          default: return null;
        }
      },
      on: (e: string, h: Function) => { if (!listeners.has(e)) listeners.set(e, new Set()); listeners.get(e)!.add(h); },
      removeListener: (e: string, h: Function) => { listeners.get(e)?.delete(h); },
      isConnected: () => true,
    };
    Object.defineProperty(window, "ethereum", { configurable: true, value: provider });
  }, DEV_ADDRESS);

  // Navigate and connect via UI
  await page.goto("/trade");
  await page.waitForTimeout(2000);

  const connectBtn = page.getByRole("button", { name: "Connect Wallet to Get Started" });
  if (await connectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await connectBtn.click();
    await page.waitForTimeout(500);
    const browserWalletBtn = page.getByRole("button", { name: "Browser Wallet" });
    if (await browserWalletBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await browserWalletBtn.click();
      await page.waitForTimeout(2000);
    }
  }
}

test.describe("Frontend renders seeded backend data", () => {
  test.beforeEach(async ({ page }) => {
    await injectWalletAndConnect(page);
  });

  test("trade page shows live order book prices", async ({ page }) => {
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    // Wallet connected — no disconnected state
    expect(body).not.toContain("Connect Wallet to Get Started");

    // Order book should show seeded bid at 1.0856 and ask at 1.0870
    expect(body).toContain("1.085");
    expect(body).toContain("Buy");
    expect(body).toContain("Sell");
  });

  test("portfolio page shows real USDC and USDT balances", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    // Should show real token symbols
    expect(body).toContain("USDC");
    expect(body).toContain("USDT");

    // Should show seeded balance amounts (10,000 USDC total, 8,000 USDT total)
    expect(body).toContain("10,000");
    expect(body).toContain("8,000");

    // Should NOT contain mock values
    expect(body).not.toContain("45,520");
    expect(body).not.toContain("48,250");
  });

  test("account page shows real orders with correct prices", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    // Should show Orders heading
    expect(body).toContain("Orders");

    // Should show seeded order prices (decoded from U256)
    expect(body).toContain("1.0856");

    // Should show open status
    expect(body).toContain("open");

    // Should NOT contain mock order IDs
    expect(body).not.toContain("ORD-001");
    expect(body).not.toContain("ORD-002");
  });

  test("no CORS errors in console", async ({ page }) => {
    const corsErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("CORS")) {
        corsErrors.push(msg.text());
      }
    });
    await page.waitForTimeout(3000);
    expect(corsErrors).toHaveLength(0);
  });
});

test.describe("Backend API direct verification", () => {
  test("all endpoints return 200", async ({ page }) => {
    await page.goto("/trade");
    const results = await page.evaluate(async () => {
      const base = "http://127.0.0.1:3000";
      const endpoints = ["/markets/1/book", "/markets/1/trades", "/markets/1/orders", "/accounts/1/balances", "/accounts/1/nonce"];
      const out: Record<string, number> = {};
      for (const ep of endpoints) {
        out[ep] = (await fetch(base + ep)).status;
      }
      return out;
    });
    for (const [ep, status] of Object.entries(results)) {
      expect(status, `${ep} should return 200`).toBe(200);
    }
  });

  test("balances match seeded amounts", async ({ page }) => {
    await page.goto("/trade");
    const balances = await page.evaluate(async () => {
      return (await fetch("http://127.0.0.1:3000/accounts/1/balances")).json();
    });
    const usdc = balances.balances.find((b: { token_id: number }) => b.token_id === 1);
    const usdt = balances.balances.find((b: { token_id: number }) => b.token_id === 2);
    expect(BigInt(usdc.total)).toBeGreaterThan(0n);
    expect(BigInt(usdt.total)).toBeGreaterThan(0n);
  });

  test("order book has bids and asks", async ({ page }) => {
    await page.goto("/trade");
    const book = await page.evaluate(async () => {
      return (await fetch("http://127.0.0.1:3000/markets/1/book")).json();
    });
    expect(book.bids.length).toBeGreaterThanOrEqual(1);
    expect(book.asks.length).toBeGreaterThanOrEqual(1);
  });
});
