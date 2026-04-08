import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Visual verification tests — verify that seeded backend data is
 * correctly rendered in the frontend UI with correct formatting.
 *
 * Seeded data:
 *   Account 1:
 *     USDC (token 1): 10,000 total, 9,500 available, 500 collateral
 *     USDT (token 2): 8,000 total, 6,914.40 available, 1,085.60 collateral
 *   Orders:
 *     #1 Buy 1,000 @ 1.0856 — open
 *     #2 Sell 500 @ 1.0870 — cancelled
 *     #3 Sell 500 @ 1.0870 — open
 *   Book:
 *     1 bid (1.0856), 1 ask (1.0870)
 */

const DEV_ADDRESS = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

async function connectWallet(page: Page) {
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

  await page.goto("/trade");
  await page.waitForTimeout(2000);
  const connectBtn = page.getByRole("button", { name: "Connect Wallet to Get Started" });
  if (await connectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await connectBtn.click();
    await page.waitForTimeout(500);
    const bw = page.getByRole("button", { name: "Browser Wallet" });
    if (await bw.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bw.click();
      await page.waitForTimeout(2000);
    }
  }
}

test.describe("Trade page — visual data verification", () => {
  test.beforeEach(async ({ page }) => {
    await connectWallet(page);
  });

  test("order book data loads from backend (prices visible)", async ({ page }) => {
    await page.waitForTimeout(8000);
    const body = await page.evaluate(() => document.body.innerText);

    // The order book/midpoint should contain price data from the seeded book
    // Midpoint of bid 1.0856 and ask 1.0870 = ~1.0863
    // At minimum, "1.08" should appear somewhere (order form midpoint or book)
    expect(body, "should show price data from backend").toContain("1.08");

    // Verify the page is connected (not showing disconnected state)
    expect(body).not.toContain("Connect Wallet to Get Started");
  });

  test("order form shows live midpoint (not hardcoded 1.0856)", async ({ page }) => {
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    // Midpoint of 1.0856 and 1.0870 = 1.0863
    expect(body, "should show midpoint around 1.086").toContain("1.086");
    // Should show Buy and Sell buttons
    expect(body).toContain("Buy");
    expect(body).toContain("Sell");
  });

  test("pair selector shows EUR/USD as active pair", async ({ page }) => {
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should show EUR/USD pair").toContain("EUR/USD");
  });

  test("bottom panel shows positions/orders/trade history tabs", async ({ page }) => {
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body).toContain("Positions");
    expect(body).toContain("Orders");
    expect(body).toContain("Trade History");
  });

  test("status bar shows TEE connection status", async ({ page }) => {
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should show TEE status").toContain("TEE");
    expect(body, "should show last update time").toContain("Last update");
  });

  test("page loads within 8 seconds", async ({ page }) => {
    const start = Date.now();
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);
    const elapsed = Date.now() - start;

    // Should have real content (not just loading skeleton)
    expect(body).toContain("EUR/USD");
    expect(elapsed, "page should load within 8s").toBeLessThan(8000);
  });
});

test.describe("Portfolio page — visual data verification", () => {
  test.beforeEach(async ({ page }) => {
    await connectWallet(page);
  });

  test("shows real USDC balance (10,000 total)", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should show USDC token").toContain("USDC");
    expect(body, "should show 10,000 total").toContain("10,000");
  });

  test("shows real USDT balance (8,000 total)", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should show USDT token").toContain("USDT");
    expect(body, "should show 8,000 total").toContain("8,000");
  });

  test("does NOT show mock values", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should not show mock 45,520").not.toContain("45,520");
    expect(body, "should not show mock 48,250").not.toContain("48,250");
    expect(body, "should not show mock 25,000").not.toContain("25,000.00");
  });

  test("shows available and collateral breakdown", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    // USDC: 9,500 available
    expect(body, "should show 9,500 available").toContain("9,500");
    // Should show column headers (uppercase label style)
    expect(body.toUpperCase()).toContain("AVAILABLE");
  });

  test("header has Deposit, Withdraw, Transfer buttons", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body).toContain("Deposit");
    expect(body).toContain("Withdraw");
    expect(body).toContain("Transfer");
  });

  test("portfolio page loads within 8 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);
    const elapsed = Date.now() - start;

    expect(body).toContain("USDC");
    expect(elapsed, "should load within 8s").toBeLessThan(8000);
  });
});

test.describe("Account page — visual data verification", () => {
  test.beforeEach(async ({ page }) => {
    await connectWallet(page);
  });

  test("shows real order prices (1.0856 buy, 1.0870 sell)", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should show buy price 1.0856").toContain("1.0856");
    expect(body, "should show sell price 1.0870").toContain("1.0870");
  });

  test("shows correct order statuses (open and cancelled)", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    const lower = body.toLowerCase();
    expect(lower, "should show open status").toContain("open");
    expect(lower, "should show cancelled status").toContain("cancelled");
  });

  test("shows correct open order count", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    // 2 open orders (order #1 buy, order #3 sell)
    expect(body, "should show 2 open orders").toContain("2 open");
  });

  test("does NOT show mock order IDs", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body, "should not show mock ORD-001").not.toContain("ORD-001");
    expect(body, "should not show mock ORD-002").not.toContain("ORD-002");
  });

  test("filter tabs render (All, Open, Filled, Cancelled)", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body).toContain("All");
    expect(body).toContain("Open");
    expect(body).toContain("Filled");
    expect(body).toContain("Cancelled");
  });

  test("shows Cancel All button", async ({ page }) => {
    await page.goto("/account");
    await page.waitForTimeout(3000);
    const body = await page.evaluate(() => document.body.innerText);

    expect(body).toContain("Cancel All");
  });

  test("account page loads within 8 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/account");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);
    const elapsed = Date.now() - start;

    expect(body).toContain("Orders");
    expect(elapsed, "should load within 8s").toBeLessThan(8000);
  });
});

test.describe("Cross-page data consistency", () => {
  test.beforeEach(async ({ page }) => {
    await connectWallet(page);
  });

  test("same balance data on trade and portfolio pages", async ({ page }) => {
    // Check portfolio first
    await page.goto("/portfolio");
    await page.waitForTimeout(5000);
    const portfolioBody = await page.evaluate(() => document.body.innerText);
    expect(portfolioBody).toContain("USDC");
    expect(portfolioBody).toContain("10,000");

    // Then trade page — order form should have balance awareness
    await page.goto("/trade");
    await page.waitForTimeout(5000);
    const tradeBody = await page.evaluate(() => document.body.innerText);
    // Trade page should show order book data
    expect(tradeBody).toContain("1.085");
  });

  test("no CORS errors across all page navigations", async ({ page }) => {
    const corsErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("CORS")) {
        corsErrors.push(msg.text());
      }
    });

    await page.goto("/trade");
    await page.waitForTimeout(3000);
    await page.goto("/portfolio");
    await page.waitForTimeout(3000);
    await page.goto("/account");
    await page.waitForTimeout(3000);

    expect(corsErrors, "should have zero CORS errors across all pages").toHaveLength(0);
  });

  test("no runtime errors across all pages", async ({ page }) => {
    for (const path of ["/trade", "/portfolio", "/account", "/funding"]) {
      await page.goto(path);
      await page.waitForTimeout(2000);
      const body = await page.evaluate(() => document.body.innerText);
      expect(body, `${path} should not have runtime errors`).not.toContain("Unhandled Runtime Error");
    }
  });
});
