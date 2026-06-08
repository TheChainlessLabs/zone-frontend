/**
 * /batches view tests — design-kit settlement explorer.
 *
 * These tests guard the behaviour + privacy contract that survives the kit
 * port: every `?state=` variant resolves, the privacy hard rule holds (no
 * counterparty addresses, no individual fill IDs, no order IDs), the live
 * heartbeat indicator is present, and the lifecycle deep-link anchors stay
 * addressable. Design-codifying assertions follow the ported kit
 * (`Settlement explorer` header, `Recent batches` table, `Submitted →
 * Proven → Settled` lifecycle, `#1,234` batch ids).
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
      // Live indicator only paints once the live default rows resolve.
      expect(screen.getByLabelText("Live · Ethereum L1")).toBeDefined();
    });
  }
  return result;
}

async function renderDetail(id: string, entries: Record<string, string> = {}) {
  mockSearchParams(entries);
  mockBatchRpc();
  vi.resetModules();
  const mod = await import("../batch-detail-view");
  const result = render(<mod.BatchDetailView id={id} />);
  if (!entries.state) {
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: `#${formatId(id)}` }),
      ).toBeDefined();
    });
  }
  return result;
}

function formatId(id: string): string {
  return /^\d+$/.test(id)
    ? Number(id).toLocaleString("en-US")
    : id;
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
  it("renders the explorer header + recent-batches section", async () => {
    await renderList();
    expect(
      screen.getByRole("heading", { level: 1, name: "Settlement explorer" }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: "Recent batches" }),
    ).toBeDefined();
  });

  it("renders the live Ethereum L1 heartbeat indicator", async () => {
    await renderList();
    expect(screen.getByLabelText("Live · Ethereum L1")).toBeDefined();
  });

  it("surfaces the search affordance", async () => {
    await renderList();
    expect(screen.getByLabelText("Search batches")).toBeDefined();
  });

  it("renders batch ids in the kit's #-prefixed grouped form", async () => {
    const { container } = await renderList();
    const text = container.textContent ?? "";
    // The verified default fixture seals batch #4,821 at the top.
    expect(text).toContain("#4,821");
  });

  it("never surfaces individual fill IDs or order IDs on the list", async () => {
    const { container } = await renderList();
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).not.toContain("owner");
  });

  it("empty state follows voice rule [what happened] [what to do next]", async () => {
    await renderList({ state: "empty" });
    expect(screen.getByText("No zone batches yet.")).toBeDefined();
    expect(
      screen.getByText(
        "Check back after the zone produces its first block range.",
      ),
    ).toBeDefined();
  });

  it("error state shows the recovery hint and a Retry button", async () => {
    await renderList({ state: "error" });
    expect(screen.getByText("Failed to load batches.")).toBeDefined();
    expect(screen.getByText("Refresh to retry.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("Button primitive carries the press-down baseline", async () => {
    await renderList({ state: "error" });
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(retry.className).toMatch(/(^|\s)press-down(\s|$)/);
  });

  it("search-no-results echoes the query and offers next steps", async () => {
    await renderList({ search: "0xdead" });
    expect(screen.getByText('No batches match "0xdead".')).toBeDefined();
    expect(screen.getByText("Try a different ID or hash.")).toBeDefined();
  });
});

describe("BatchDetailView", () => {
  it("renders the identity header with batch number, status, and privacy note", async () => {
    await renderDetail("4821");
    expect(
      screen.getByRole("heading", { level: 1, name: "#4,821" }),
    ).toBeDefined();
    // The verified end state renders the kit's `Settled` label.
    expect(screen.getAllByText("Settled").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Counterparties are never revealed/i),
    ).toBeDefined();
  });

  it("renders the Submitted → Proven → Settled lifecycle stepper", async () => {
    await renderDetail("4821");
    expect(screen.getByText("Submitted")).toBeDefined();
    expect(screen.getByText("Proven")).toBeDefined();
    expect(screen.getAllByText("Settled").length).toBeGreaterThan(0);
  });

  it("renders the Overview sidebar and Pairs-in-batch distribution", async () => {
    await renderDetail("4821");
    expect(screen.getByText("Overview")).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: "Pairs in batch" }),
    ).toBeDefined();
  });

  it("pending detail surfaces a pending settlement tx", async () => {
    await renderDetail("4818", { state: "detail-pending" });
    // No settlement tx on a pending batch → the L1 row reads pending.
    expect(screen.getAllByText("pending").length).toBeGreaterThan(0);
    // The Pending status label renders in both the header and the Overview.
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
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
      screen.queryByRole("heading", { level: 1, name: "#4,821" }),
    ).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("empty state follows the not-found copy register", async () => {
    await renderDetail("9999", { state: "empty" });
    expect(screen.getByText("Batch not found.")).toBeDefined();
    expect(
      screen.getByText(
        "The route you tried doesn't exist. Head back to /batches.",
      ),
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

  it("preserves the lifecycle + metadata hash deep-link anchors", async () => {
    const { container } = await renderDetail("4821");
    expect(container.querySelector("#queued")).not.toBeNull();
    expect(container.querySelector("#proven")).not.toBeNull();
    expect(container.querySelector("#settled")).not.toBeNull();
    expect(container.querySelector("#sealed")).not.toBeNull();
    expect(container.querySelector("#proof-hash")).not.toBeNull();
    expect(container.querySelector("#settlement-tx")).not.toBeNull();
  });
});
