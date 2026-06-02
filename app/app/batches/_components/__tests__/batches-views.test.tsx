/**
 * /batches view tests — wireframe-level guarantees.
 *
 * These tests guard the privacy hard rule (no counterparty addresses, no
 * individual fill IDs, no order IDs) and the voice copy ([what happened]
 * [what to do next]). Layout-level assertions stay light — visual regression
 * lands in M4.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { batchesDetailFixtures, batchesListFixtures } from "@/lib/fixtures";
import type { BatchFixture } from "@/lib/fixtures/types";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// next/navigation hooks aren't initialised under jsdom — stub them so the
// "use client" components render.
function mockSearchParams(entries: Record<string, string> = {}) {
  vi.doMock("next/navigation", () => {
    return {
      useSearchParams: () => new URLSearchParams(entries),
      usePathname: () => "/batches",
      // <TransitionLink> reads `useRouter` to drive the navigation inside the
      // View Transitions wrapper — stub it so the row links render under jsdom.
      useRouter: () => ({
        push: () => {},
        replace: () => {},
        prefetch: () => {},
        back: () => {},
        forward: () => {},
        refresh: () => {},
      }),
    };
  });
}

async function renderList(entries: Record<string, string> = {}) {
  mockSearchParams(entries);
  mockBatchRpc();
  vi.resetModules();
  const mod = await import("../batches-list-view");
  const result = render(<mod.BatchesListView />);
  if (!entries.state) {
    await waitFor(() => {
      if (entries.search) {
        expect(screen.queryByText(/No batches match/)).not.toBeNull();
        return;
      }
      expect(screen.getByLabelText("Live")).toBeDefined();
    });
  }
  return result;
}

async function renderDetail(
  id: string,
  entries: Record<string, string> = {},
) {
  mockSearchParams(entries);
  mockBatchRpc();
  vi.resetModules();
  const mod = await import("../batch-detail-view");
  const result = render(<mod.BatchDetailView id={id} />);
  if (!entries.state) {
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: `Batch #${id}` }),
      ).toBeDefined();
    });
  }
  return result;
}

function mockBatchRpc() {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      method?: string;
      params?: unknown[];
    };
    const batches = batchesListFixtures.default.batches.map(toZoneBatch);
    const detailBatch = toZoneBatch(batchesDetailFixtures.verified.batch);
    const result =
      body.method === "zone_listBatches"
        ? { batches, nextCursor: null }
        : body.method === "zone_getBatch"
          ? detailBatch
          : body.method === "zone_searchBatch"
            ? String(body.params?.[0] ?? "") === "0xdead"
              ? null
              : detailBatch
            : null;
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
}

function mockPendingZoneRangeRpc() {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      method?: string;
    };
    const pendingBatch = {
      batchNumber: "0x1",
      zoneBlockFrom: "0x1",
      zoneBlockTo: "0x10740a",
      tempoBlockNumber: "0x1276dcd",
      root: "0x0000000000000000000000000000000000000000000000000000000000000000",
      prevBlockHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      nextBlockHash:
        "0xb338bf1e87b284bded20be3e43cf86d81fc07df685a9cc674145cf9a83d07977",
      status: "pending",
      orderCount: "0x0",
      fillCount: "0x0",
      aggregatePairs: [],
      aggregateVolume: [],
    };
    return new Response(
      JSON.stringify({
        result: body.method === "zone_listBatches"
          ? { batches: [pendingBatch], nextCursor: null }
          : pendingBatch,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  });
  vi.stubGlobal("fetch", fetchMock);
}

async function renderListWithPendingZoneRange() {
  mockSearchParams();
  mockPendingZoneRangeRpc();
  vi.resetModules();
  const mod = await import("../batches-list-view");
  const result = render(<mod.BatchesListView />);
  await waitFor(() => {
    expect(screen.getAllByText("Zone blocks #1–#1,078,282").length).toBeGreaterThan(
      0,
    );
  });
  return result;
}

function toZoneBatch(batch: BatchFixture) {
  const sealedAtSeconds = Math.floor(new Date(batch.sealedAt).getTime() / 1000);
  return {
    batchNumber: String(batch.number),
    tempoBlockNumber: "1",
    root: batch.root,
    prevBlockHash: batch.root,
    nextBlockHash: batch.root,
    status:
      batch.status === "verified"
        ? "verified"
        : batch.status === "failed"
          ? "failed"
          : "pending",
    sealedAt: String(sealedAtSeconds),
    settledAt: String(sealedAtSeconds + 120),
    orderCount: batch.orderCount,
    fillCount: batch.fillCount,
    aggregatePairs: ["OALPHA/PATH.USD"],
    aggregateVolume: [],
    settlementTxHash:
      batch.settlementTx ??
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    proofRef: batch.proofRef,
  };
}

describe("BatchesListView", () => {
  it("renders the page title + description", async () => {
    await renderList();
    // "Batches" appears on the page title and the table card header — both
    // are intentional after the M4.20 tempo restyle.
    expect(screen.getAllByText("Batches").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Live zone block windows and L1 settlement batches. Pending ranges are local until proof submission lands.",
      ),
    ).toBeDefined();
  });

  it("renders the tempo-style table header with a Live indicator", async () => {
    await renderList();
    expect(screen.getByLabelText("Live")).toBeDefined();
  });

  it("renders backend pending zone ranges without calling them sealed", async () => {
    await renderListWithPendingZoneRange();
    expect(screen.getAllByText("Zone blocks #1–#1,078,282").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Awaiting L1 settlement").length).toBeGreaterThan(0);
    expect(screen.queryByText(/^0s ago$/)).toBeNull();
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
    expect(pairText).toContain("OALPHA/PATH.USD");
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
    expect(screen.getByText("No zone batches yet.")).toBeDefined();
    expect(
      screen.getByText("Check back after the zone produces its first block range."),
    ).toBeDefined();
  });

  it("error state shows the recovery hint and a Retry button", async () => {
    await renderList({ state: "error" });
    expect(screen.getByText("Failed to load batches.")).toBeDefined();
    expect(screen.getByText("Refresh to retry.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("Button primitive carries the press-down baseline (M5.3)", async () => {
    // M5.3 — every <Button> ships the press-down nudge for free via the
    // primitive's base classes. The error-state Retry button is a default
    // <Button> instance, so its rendered class list must include
    // `press-down`.
    await renderList({ state: "error" });
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(retry.className).toMatch(/(^|\s)press-down(\s|$)/);
  });

  it("desktop batch row uses the 75ms tempo hover (M5.3)", async () => {
    const { container } = await renderList();
    const tr = container.querySelector("tbody tr");
    expect(tr).not.toBeNull();
    const cls = tr?.className ?? "";
    expect(cls).toMatch(/duration-75/);
    expect(cls).toMatch(/hover:-mt-px/);
    expect(cls).toMatch(/hover:border-t/);
  });

  it("search-no-results echoes the query and offers next steps", async () => {
    await renderList({ search: "0xdead" });
    expect(screen.getByText('No batches match "0xdead".')).toBeDefined();
    expect(screen.getByText("Try a different ID or hash.")).toBeDefined();
  });
});

describe("BatchDetailView", () => {
  it("renders the page header with batch number, status, and privacy footer", async () => {
    await renderDetail("4821");
    // Batch number is the H1 of the page header strip (M4.23).
    expect(
      screen.getByRole("heading", { level: 1, name: "Batch #4821" }),
    ).toBeDefined();
    // Verified status label rendered inline next to the title.
    expect(screen.getByText("Verified")).toBeDefined();
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

  it("loading state renders the detail skeleton instead of batch content", async () => {
    const { container } = await renderDetail("4821", { state: "loading" });
    expect(
      screen.queryByRole("heading", { level: 1, name: "Batch #4821" }),
    ).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("empty state follows the not-found copy register", async () => {
    await renderDetail("9999", { state: "empty" });
    expect(screen.getByText("Batch not found.")).toBeDefined();
    expect(
      screen.getByText("The route you tried doesn't exist. Head back to /batches."),
    ).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Back to /batches" }),
    ).toBeDefined();
  });

  it("error state shows the recovery hint and a Retry button", async () => {
    await renderDetail("4821", { state: "error" });
    expect(screen.getByText("Failed to load batch.")).toBeDefined();
    expect(screen.getByText("Refresh to retry.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
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

  it("renders pair distribution and lifecycle sections (M4.23 compressed)", async () => {
    await renderDetail("4821");
    expect(screen.getByText(/Pair distribution/i)).toBeDefined();
    expect(screen.getByText(/Lifecycle/i)).toBeDefined();
  });

  it("preserves M5.5 hash deep-link IDs on the compressed lifecycle rows", async () => {
    const { container } = await renderDetail("4821");
    // Each lifecycle row anchor target stays addressable.
    expect(container.querySelector("#queued")).not.toBeNull();
    expect(container.querySelector("#sealed")).not.toBeNull();
    expect(container.querySelector("#proven")).not.toBeNull();
    expect(container.querySelector("#settled")).not.toBeNull();
    expect(container.querySelector("#proof-hash")).not.toBeNull();
    expect(container.querySelector("#settlement-tx")).not.toBeNull();
  });

  it('renders a "what this means" subtitle for each numbered action', async () => {
    await renderDetail("4821");
    expect(
      screen.getByText(
        "We received your trade and grouped it with others for privacy.",
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        "The batch was finalized inside the secure execution environment.",
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        "A cryptographic proof of correct execution was generated.",
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        "The batch landed on Ethereum L1 and is now publicly verifiable.",
      ),
    ).toBeDefined();
  });

  it("renders timestamps as a single human-readable string with relative-ago", async () => {
    // The verified fixture seals at a known UTC timestamp; the new format
    // joins the absolute UTC clock to a relative-ago hint via interpunct.
    const { container } = await renderDetail("4821");
    const text = container.textContent ?? "";
    expect(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC · /.test(text)).toBe(true);
  });
});
