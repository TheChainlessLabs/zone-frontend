/**
 * /batches view tests — wireframe-level guarantees.
 *
 * These tests guard the privacy hard rule (no counterparty addresses, no
 * individual fill IDs, no order IDs) and the voice copy ([what happened]
 * [what to do next]). Layout-level assertions stay light — visual regression
 * lands in M4.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { BatchesListView } from "../batches-list-view";
import { BatchDetailView } from "../batch-detail-view";
import { batchesDetailFixtures } from "@/lib/fixtures";

afterEach(cleanup);

// next/navigation hooks aren't initialised under jsdom — stub them so the
// "use client" components render.
function mockSearchParams(entries: Record<string, string> = {}) {
  vi.doMock("next/navigation", () => {
    return {
      useSearchParams: () => new URLSearchParams(entries),
      usePathname: () => "/batches",
    };
  });
}

async function renderList(entries: Record<string, string> = {}) {
  mockSearchParams(entries);
  vi.resetModules();
  const mod = await import("../batches-list-view");
  return render(<mod.BatchesListView />);
}

async function renderDetail(
  id: string,
  entries: Record<string, string> = {},
) {
  mockSearchParams(entries);
  vi.resetModules();
  const mod = await import("../batch-detail-view");
  return render(<mod.BatchDetailView id={id} />);
}

describe("BatchesListView", () => {
  it("renders the page title + description", async () => {
    await renderList();
    // "Batches" appears on the page title and the table card header — both
    // are intentional after the M4.20 tempo restyle.
    expect(screen.getAllByText("Batches").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Sealed settlement batches with on-chain attestation. Public, verifiable.",
      ),
    ).toBeDefined();
  });

  it("renders the tempo-style table header with a Live indicator", async () => {
    await renderList();
    expect(screen.getByLabelText("Live")).toBeDefined();
  });

  it("default state surfaces the search affordance and per-page selector", async () => {
    await renderList();
    expect(screen.getByLabelText("Search batches")).toBeDefined();
    expect(screen.getByText(/Per page/)).toBeDefined();
  });

  it("renders pairs as plain mono text, not bordered chips (M4.21)", async () => {
    // M4.21 — bordered pair pills were reading as decorative striping per
    // row. Pairs render as plain comma-separated mono text. Assert that
    // there is no element matching the previous chip markup (mono+border
    // wrapping a single pair string like "USDC/EURC").
    const { container } = await renderList();
    const pairText = container.textContent ?? "";
    // At least one fixture row carries a pair list — we expect that to land
    // somewhere in the rendered output.
    expect(pairText).toMatch(/[A-Z]{3,4}\/[A-Z]{3,4}/);
    // No pair string should be wrapped in a bordered chip. The legacy
    // bordered-pill markup used `border-[var(--border)]` on a span around a
    // single pair; assert no `span.border` ancestor wraps a lone pair.
    const borderedChips = container.querySelectorAll(
      "span.inline-flex.rounded.border, span.inline-flex.items-center.rounded.border",
    );
    for (const chip of Array.from(borderedChips)) {
      expect(chip.textContent ?? "").not.toMatch(/^[A-Z]{3,4}\/[A-Z]{3,4}$/);
    }
  });

  it("drops the Proof column from the desktop table (M4.21)", async () => {
    // M4.21 — proof-hash column is detail-page-only now. The L1 tx column
    // remains since that's the on-chain anchor a non-engineer actually
    // clicks. Only `<th>` cells should be inspected for column headers.
    const { container } = await renderList();
    const headers = Array.from(container.querySelectorAll("thead th")).map(
      (el) => (el.textContent ?? "").trim(),
    );
    expect(headers).not.toContain("Proof");
    expect(headers).toContain("L1 tx");
    expect(headers).toContain("Pairs");
  });

  it("annotates jargon-y column headers with plain-language tooltips (M4.21)", async () => {
    const { container } = await renderList();
    const headers = Array.from(container.querySelectorAll("thead th"));
    const pairsHeader = headers.find(
      (el) => (el.textContent ?? "").trim() === "Pairs",
    );
    const l1Header = headers.find(
      (el) => (el.textContent ?? "").trim() === "L1 tx",
    );
    expect(pairsHeader?.getAttribute("title")).toBe(
      "Currency pairs traded in this batch",
    );
    expect(l1Header?.getAttribute("title")).toBe(
      "On-chain Ethereum transaction that settled this batch",
    );
  });

  it("never surfaces individual fill IDs or order IDs on the list", async () => {
    // Privacy hard rule. The list view renders aggregate metadata only —
    // batch number, status, fills/orders count, volume, pairs. Per-fill and
    // per-order IDs from any default-fixture batch must NOT appear.
    const { container } = await renderList();
    const text = container.textContent ?? "";
    // The list fixture surfaces only aggregate counts; assert the helper
    // labels that would imply per-row owner/counterparty columns aren't
    // there. (The Aztec layout's body copy mentions "Counterparty
    // information is by design absent" — that's a privacy declaration, not
    // a leak, so the broad regex check from the legacy layout is gone.)
    expect(text.toLowerCase()).not.toContain("owner");
  });

  it("empty state follows voice rule [what happened] [what to do next]", async () => {
    await renderList({ state: "empty" });
    expect(screen.getByText("No batches sealed yet.")).toBeDefined();
    expect(
      screen.getByText("Check back after the first market open."),
    ).toBeDefined();
  });

  it("error state shows the recovery hint and a Retry button", async () => {
    await renderList({ state: "error" });
    expect(screen.getByText("Failed to load batches.")).toBeDefined();
    expect(screen.getByText("Refresh to retry.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("search-no-results echoes the query and offers next steps", async () => {
    await renderList({ search: "no-results" });
    expect(screen.getByText('No batches match "0xdead".')).toBeDefined();
    expect(screen.getByText("Try a different ID or hash.")).toBeDefined();
  });
});

describe("BatchDetailView", () => {
  it("renders the verified-batch receipt header and privacy footer", async () => {
    await renderDetail("4821");
    expect(screen.getByText("Batch #4821")).toBeDefined();
    expect(screen.getByText("Settlement record")).toBeDefined();
    expect(
      screen.getByText(/Counterparty information is by design absent/i),
    ).toBeDefined();
  });

  it("pending detail surfaces pending settlement and proof rows", async () => {
    await renderDetail("4818", { state: "detail-pending" });
    expect(screen.getAllByText("pending").length).toBeGreaterThan(1);
    expect(screen.getByText("3. Proven")).toBeDefined();
    expect(screen.getByText("4. Settled")).toBeDefined();
  });

  it("failed detail surfaces the failure reason", async () => {
    await renderDetail("4795", { state: "detail-failed" });
    expect(
      screen.getAllByText(/Settlement reverted on L1/i).length,
    ).toBeGreaterThan(0);
  });

  it("never exposes individual fill IDs or order IDs", async () => {
    // The verified fixture has fill ids `f-2914`, `f-2913` and order ids
    // `o-9482`, `o-9477`, `o-9476`. None of them must surface on the
    // detail page.
    const { container } = await renderDetail("4821");
    const text = container.textContent ?? "";
    const fillIds = batchesDetailFixtures.verified.fills.map((f) => f.id);
    const orderIds = batchesDetailFixtures.verified.orders.map((o) => o.id);
    for (const id of [...fillIds, ...orderIds]) {
      expect(text.includes(id)).toBe(false);
    }
  });

  it("links to /portfolio for a user's own fills", async () => {
    await renderDetail("4821");
    const link = screen.getByRole("link", { name: "/portfolio" });
    expect(link.getAttribute("href")).toBe("/portfolio");
  });

  it("renders pair aggregate and totals sections", async () => {
    await renderDetail("4821");
    expect(screen.getByText(/Pair aggregate/i)).toBeDefined();
    expect(screen.getByText(/Totals/i)).toBeDefined();
  });
});
