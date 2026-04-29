#!/usr/bin/env node
/**
 * diagnose.mjs — load each /personas/preview/render/<id> route via Playwright,
 * collect runtime errors, mark which renders work and which throw.
 */

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "https://homelab.tail477b3c.ts.net:8447";
const IDS = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });

const results = [];
for (const id of IDS) {
  const page = await ctx.newPage();
  const errors = [];
  const consoleErrors = [];
  page.on("pageerror", (err) => errors.push(String(err.message).split("\n")[0]));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().split("\n")[0]);
  });
  try {
    const resp = await page.goto(`${BASE}/personas/preview/render/${id}`, {
      waitUntil: "networkidle",
      timeout: 20_000,
    });
    await page.waitForTimeout(800);
    const status = resp?.status() ?? 0;
    // Check if error boundary fallback rendered
    const fallbackVisible = await page
      .getByText(/render unavailable/i)
      .isVisible()
      .catch(() => false);
    results.push({
      id,
      status,
      ok: status === 200 && !fallbackVisible && errors.length === 0,
      fallback: fallbackVisible,
      errors,
      consoleErrors: consoleErrors.slice(0, 3),
    });
  } catch (e) {
    results.push({ id, status: 0, ok: false, errors: [String(e.message).split("\n")[0]] });
  } finally {
    await page.close();
  }
}
await browser.close();

console.log("\n=== Render diagnostic ===\n");
let ok = 0;
let bad = 0;
for (const r of results) {
  const flag = r.ok ? "✓" : "✗";
  const note = r.ok
    ? "renders"
    : r.fallback
      ? "error boundary"
      : r.errors[0] || r.consoleErrors[0] || "unknown";
  console.log(`${flag} persona ${r.id} · ${r.status} · ${note}`);
  if (r.ok) ok++; else bad++;
}
console.log(`\n${ok}/${IDS.length} render successfully · ${bad} broken\n`);

// Detail dump for broken ones
console.log("=== Broken — first error per persona ===\n");
for (const r of results) {
  if (r.ok) continue;
  const e = r.errors[0] ?? r.consoleErrors[0] ?? "(no message)";
  console.log(`${r.id}: ${e}`);
}
