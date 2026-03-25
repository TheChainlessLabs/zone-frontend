import { expect, test } from "@playwright/test";
import {
  injectMockWallet,
  MAINNET_CHAIN_ID,
  TEST_ACCOUNT,
  truncateAddress,
} from "./support/injectedWallet";

test.describe("wallet connection", () => {
  test("shows the disconnected gate on protected entry points", async ({ page }) => {
    await injectMockWallet(page);

    for (const route of ["/trade", "/portfolio", "/account"]) {
      await page.goto(route);
      await expect(page.getByTestId("disconnected-state")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Connect Wallet to Get Started" })
      ).toBeVisible();
    }
  });

  test("connects through the injected wallet and unlocks protected content", async ({
    page,
  }) => {
    await injectMockWallet(page);

    await page.goto("/trade");
    await page.getByRole("button", { name: "Connect Wallet to Get Started" }).click();
    await expect(page.getByRole("heading", { name: "Connect Wallet" })).toBeVisible();
    await page.getByRole("button", { name: "Browser Wallet" }).click();

    await expect(page.getByTestId("disconnected-state")).toHaveCount(0);
    await expect(page.getByText("Recent Fills")).toBeVisible();
    await expect(page.getByText(truncateAddress(TEST_ACCOUNT))).toBeVisible();
  });

  test("preserves the wallet session after reload", async ({ page }) => {
    await injectMockWallet(page);

    await page.goto("/trade");
    await page.getByRole("button", { name: "Connect Wallet to Get Started" }).click();
    await page.getByRole("button", { name: "Browser Wallet" }).click();
    await expect(page.getByText("Recent Fills")).toBeVisible();

    await page.reload();

    await expect(page.getByTestId("protected-loading")).toHaveCount(0);
    await expect(page.getByTestId("disconnected-state")).toHaveCount(0);
    await expect(page.getByText("Recent Fills")).toBeVisible();
    await expect(page.getByText(truncateAddress(TEST_ACCOUNT))).toBeVisible();
  });

  test("blocks deep-linked account detail routes while disconnected", async ({ page }) => {
    await injectMockWallet(page);

    await page.goto("/account/order/ORD-20260306-0042");

    await expect(page.getByTestId("disconnected-state")).toBeVisible();
    await expect(page.getByText("Back to Orders")).toHaveCount(0);
  });

  test("allows deep-linked account detail routes after connection", async ({ page }) => {
    await injectMockWallet(page);

    await page.goto("/trade");
    await page.getByRole("button", { name: "Connect Wallet to Get Started" }).click();
    await page.getByRole("button", { name: "Browser Wallet" }).click();
    await expect(page.getByText("Recent Fills")).toBeVisible();

    await page.goto("/account/order/ORD-20260306-0042");

    await expect(page.getByText("Back to Orders")).toBeVisible();
    await expect(page.getByText("#ORD-20260306-0042")).toBeVisible();
  });

  test("shows the unsupported network state when the wallet is on the wrong chain", async ({
    page,
  }) => {
    await injectMockWallet(page);

    await page.goto("/trade");
    await page.getByRole("button", { name: "Connect Wallet to Get Started" }).click();
    await page.getByRole("button", { name: "Browser Wallet" }).click();
    await expect(page.getByText("Recent Fills")).toBeVisible();

    await page.evaluate(async (chainId) => {
      const ethereum = (
        window as Window & {
          ethereum?: { request?: (args: unknown) => Promise<unknown> };
        }
      ).ethereum;
      await ethereum?.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    }, MAINNET_CHAIN_ID);

    await page.goto("/portfolio");

    await expect(page.getByTestId("unsupported-network-state")).toBeVisible();
    await expect(page.getByText("Unsupported Network")).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to Anvil" })).toBeVisible();
    await expect(page.getByText("Total Portfolio Value")).toHaveCount(0);
  });
});
