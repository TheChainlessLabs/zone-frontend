#!/usr/bin/env node
/**
 * capture.mjs — Playwright screenshot harness for the 20-persona review.
 *
 * Captures every v0 surface × {dark, light} × {desktop, mobile} including
 * modal interactions. Writes to `screenshots/<viewport>/<theme>/<slug>.png`
 * relative to this script.
 *
 * Targets the live homelab tile (HTTPS over Tailscale). The frontend's
 * WalletStateProvider exposes `?walletState=` overrides; the AppShell's
 * fixtures expose `?state=` overrides; that's how we reach states without
 * walking the modal flow.
 *
 * Usage:
 *   node tools/persona-review/capture.mjs
 *
 * Env knobs:
 *   BASE_URL  — defaults to the homelab URL
 *   HEADLESS  — `0` to watch the run; default headless
 *   THEMES    — comma-list, default `dark,light`
 *   VIEWPORTS — comma-list, default `desktop,mobile`
 */

import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = resolve(__dirname, "screenshots");

const BASE_URL = process.env.BASE_URL ?? "https://homelab.tail477b3c.ts.net:8447";
const HEADLESS = process.env.HEADLESS !== "0";
const THEMES = (process.env.THEMES ?? "dark,light").split(",");
const VIEWPORTS_FILTER = (process.env.VIEWPORTS ?? "desktop,mobile").split(",");

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
};

/**
 * Each entry is one capture target.
 * - slug: filename (without extension)
 * - url: absolute or relative-to-base path
 * - prep: optional async (page) => void, run before screenshot
 * - mobileOnly / desktopOnly: skip on the other viewport
 * - waitFor: optional selector to wait for before capturing
 */
const TARGETS = [
  // ── Static routes ────────────────────────────────────────────────────────
  { slug: "trade--disconnected", url: "/trade" },
  { slug: "trade--connected-market", url: "/trade?walletState=connected" },
  {
    slug: "trade--connected-limit",
    url: "/trade?walletState=connected",
    prep: async (page) => {
      // Click the Limit tab in the order-form toggle.
      const limit = page.getByRole("tab", { name: /limit/i }).first();
      if (await limit.isVisible().catch(() => false)) {
        await limit.click();
        await page.waitForTimeout(350);
      }
    },
  },
  { slug: "trade--wrong-network", url: "/trade?walletState=wrong-network" },
  { slug: "trade--no-nft-pass", url: "/trade?walletState=no-nft-pass" },

  { slug: "portfolio--default", url: "/portfolio?walletState=connected" },
  { slug: "portfolio--loading", url: "/portfolio?walletState=connected&state=loading" },
  { slug: "portfolio--error", url: "/portfolio?walletState=connected&state=error" },
  { slug: "portfolio--empty", url: "/portfolio?walletState=connected&state=empty" },
  { slug: "portfolio--disconnected", url: "/portfolio" },

  { slug: "batches--default", url: "/batches" },
  { slug: "batches--loading", url: "/batches?state=loading" },
  { slug: "batches--error", url: "/batches?state=error" },
  { slug: "batches--empty", url: "/batches?state=empty" },
  { slug: "batches--search-results", url: "/batches?search=results" },
  { slug: "batches--search-no-results", url: "/batches?search=no-results" },

  { slug: "batches-detail--verified", url: "/batches/4821" },
  { slug: "batches-detail--pending", url: "/batches/4821?state=detail-pending" },
  { slug: "batches-detail--failed", url: "/batches/4821?state=detail-failed" },

  { slug: "account--connected", url: "/account?walletState=connected" },
  { slug: "account--disconnected", url: "/account" },

  { slug: "brand", url: "/brand" },
  { slug: "system", url: "/system" },
  { slug: "not-found", url: "/this-route-does-not-exist" },

  // ── Modal interactions ───────────────────────────────────────────────────
  {
    slug: "modal-connect--idle",
    url: "/trade",
    prep: async (page) => {
      const trigger = page.getByRole("button", { name: /connect wallet/i }).first();
      await trigger.click();
      await page.waitForTimeout(500);
    },
  },
  {
    slug: "modal-connect--connecting",
    url: "/trade?walletState=connecting",
    // The wallet provider auto-opens the modal whenever state === connecting.
  },
  {
    slug: "modal-connect--no-nft-pass",
    url: "/trade?walletState=no-nft-pass",
    prep: async (page) => {
      const trigger = page.getByRole("link", { name: /pass required/i }).first();
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click();
        await page.waitForTimeout(400);
      }
    },
  },
  {
    slug: "modal-deposit--idle",
    url: "/portfolio?walletState=connected",
    prep: async (page) => {
      // /portfolio has multiple Deposit buttons (hero + skeleton); first visible.
      const trigger = page.getByRole("button", { name: /^deposit$/i }).first();
      await trigger.click();
      await page.waitForTimeout(500);
    },
  },
  {
    slug: "modal-withdraw--idle",
    url: "/portfolio?walletState=connected",
    prep: async (page) => {
      const trigger = page.getByRole("button", { name: /^withdraw$/i }).first();
      await trigger.click();
      await page.waitForTimeout(500);
    },
  },
];

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    if (t === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, theme);
  // Let the CSS settle.
  await page.waitForTimeout(150);
}

async function ensureOutDir(viewport, theme) {
  const dir = resolve(OUT_ROOT, viewport, theme);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function captureOne({ context, viewport, theme, target }) {
  const page = await context.newPage();
  const url = target.url.startsWith("http") ? target.url : `${BASE_URL}${target.url}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    await setTheme(page, theme);
    if (target.waitFor) await page.waitForSelector(target.waitFor, { timeout: 5_000 });
    // Calm any entrance animations before capture.
    await page.waitForTimeout(400);
    if (target.prep) await target.prep(page);
    const dir = await ensureOutDir(viewport, theme);
    const out = resolve(dir, `${target.slug}.png`);
    await page.screenshot({ path: out, fullPage: true });
    process.stdout.write(`✓ ${viewport}/${theme}/${target.slug}.png\n`);
  } catch (err) {
    process.stdout.write(`✗ ${viewport}/${theme}/${target.slug} — ${String(err).split("\n")[0]}\n`);
  } finally {
    await page.close();
  }
}

async function main() {
  const t0 = Date.now();
  const browser = await chromium.launch({ headless: HEADLESS });
  let total = 0;
  for (const viewport of VIEWPORTS_FILTER) {
    if (!VIEWPORTS[viewport]) continue;
    const context = await browser.newContext({
      viewport: VIEWPORTS[viewport],
      ignoreHTTPSErrors: true,
      userAgent:
        viewport === "mobile"
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          : undefined,
      reducedMotion: "reduce",
    });
    for (const theme of THEMES) {
      for (const target of TARGETS) {
        if (target.mobileOnly && viewport !== "mobile") continue;
        if (target.desktopOnly && viewport !== "desktop") continue;
        await captureOne({ context, viewport, theme, target });
        total++;
      }
    }
    await context.close();
  }
  await browser.close();
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  process.stdout.write(`\nDone — ${total} screenshots in ${seconds}s. Output at ${OUT_ROOT}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
