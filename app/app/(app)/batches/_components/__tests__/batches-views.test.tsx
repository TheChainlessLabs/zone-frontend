/**
 * /batches view tests — live settlement explorer (zone RPC only).
 *
 * The demo-fixture system and the `?state=` toggle were removed: these surfaces
 * render LIVE zone data exclusively. Every state (populated / empty / error /
 * no-results / not-found) is driven here by the mocked zone JSON-RPC. The tests
 * guard the rendered shape, the honest non-data states, and the privacy hard
 * rule (no counterparty, no order/fill IDs, no owner).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// next/navigation hooks aren't initialised under jsdom — stub them so the
// "use client" components render.
function mockSearchParams(entries: Record<string, string> = {}) {
  vi.doMock("next/navigation", () => ({
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
  }));
}

// A zone batch summary as the public RPC returns it (see ZoneBatchSummary).
function mkZoneBatch(
  number: number,
  status: "submitted" | "verified" | "pending" | "failed" = "submitted",
) {
  const sealed = 1_700_000_000;
  const settled = status === "submitted" || status === "verified";
  return {
    batchNumber: `0x${number.toString(16)}`,
    zoneBlockFrom: "0x64",
    zoneBlockTo: "0xc8",
    tempoBlockNumber: "0x1",
    root: status === "pending" ? `0x${"00".repeat(32)}` : `0x${"ab".repeat(32)}`,
    prevBlockHash: `0x${"cd".repeat(32)}`,
    nextBlockHash: `0x${"ef".repeat(32)}`,
    status,
    sealedAt: status === "pending" ? undefined : `0x${sealed.toString(16)}`,
    settledAt: settled ? `0x${(sealed + 120).toString(16)}` : undefined,
    orderCount: "0xc",
    fillCount: "0x9",
    aggregatePairs: [
      "0x20c0000000000000000000000000000000000001/0x20c0000000000000000000000000000000000000",
    ],
    aggregateVolume: [
      {
        token: "0x20c0000000000000000000000000000000000001",
        amount: "0x16e360",
      },
      {
        token: "0x20c0000000000000000000000000000000000000",
        amount: "0x2dc6c0",
      },
    ],
    settlementTxHash: settled ? `0x${"12".repeat(32)}` : undefined,
    proofRef: status === "verified" ? `0x${"34".repeat(32)}` : undefined,
  };
}

type RpcConfig = {
  list?: unknown[];
  listThrows?: boolean;
  detail?: unknown | null;
  detailThrows?: boolean;
  search?: unknown | null;
  nextCursor?: string;
};

function json(result: unknown) {
  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function mockBatchRpc(cfg: RpcConfig = {}) {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      method?: string;
      params?: unknown[];
    };
    if (body.method === "zone_listBatches") {
      if (cfg.listThrows) return new Response("boom", { status: 500 });
      return json({ batches: cfg.list ?? [], nextCursor: cfg.nextCursor });
    }
    if (body.method === "zone_getBatch") {
      if (cfg.detailThrows) return new Response("boom", { status: 500 });
      return json(cfg.detail ?? null);
    }
    if (body.method === "zone_searchBatch") {
      return json(cfg.search ?? null);
    }
    return json(null);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function renderList(cfg: RpcConfig = {}, entries: Record<string, string> = {}) {
  mockSearchParams(entries);
  const fetchMock = mockBatchRpc(cfg);
  vi.resetModules();
  const mod = await import("../batches-list-view");
  return { ...render(<mod.BatchesListView />), fetchMock };
}

async function renderDetail(
  id: string,
  cfg: RpcConfig = {},
  entries: Record<string, string> = {},
) {
  mockSearchParams(entries);
  mockBatchRpc(cfg);
  vi.resetModules();
  const mod = await import("../batch-detail-view");
  return render(<mod.BatchDetailView id={id} />);
}

describe("BatchesListView (live)", () => {
  it("renders the explorer header + recent-batches section", async () => {
    await renderList({ list: [mkZoneBatch(4821)] });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "Settlement explorer" }),
      ).toBeDefined(),
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Recent batches" }),
    ).toBeDefined();
  }, 10_000);

  it("reports a successful zone RPC connection to Tempo L1", async () => {
    await renderList({ list: [mkZoneBatch(4821)] });
    await waitFor(() =>
      expect(screen.getByLabelText("Zone RPC connected")).toBeDefined(),
    );
    expect(screen.getByText("Connected · Tempo L1")).toBeDefined();
  });

  it("surfaces the search affordance", async () => {
    await renderList({ list: [mkZoneBatch(4821)] });
    await waitFor(() =>
      expect(screen.getByLabelText("Search batches")).toBeDefined(),
    );
  });

  it("renders batch ids in the kit's #-prefixed grouped form", async () => {
    const { container } = await renderList({ list: [mkZoneBatch(4821)] });
    await waitFor(() =>
      expect(container.textContent ?? "").toContain("#4,821"),
    );
  });

  it("renders real block, count, pair, and token-volume aggregates", async () => {
    const { container } = await renderList({ list: [mkZoneBatch(4821)] });
    await waitFor(() =>
      expect(container.textContent ?? "").toContain("1.5 ALPHAUSD"),
    );
    expect(container.textContent ?? "").toContain("3 PATH.USD");
    expect(container.textContent ?? "").toContain("100–200");
    expect(container.textContent ?? "").not.toContain("USDC");
    expect(container.textContent ?? "").not.toContain("~12");
  });

  it("uses the zone cursor instead of client-only pagination", async () => {
    const { fetchMock } = await renderList({
      list: [mkZoneBatch(4821)],
      nextCursor: "0x12d",
    });
    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>("button", { name: "Next" }).disabled).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const secondRequest = JSON.parse(
      String((fetchMock.mock.calls[1]?.[1] as RequestInit | undefined)?.body),
    ) as { params: unknown[] };
    expect(secondRequest.params).toEqual([{ limit: 7, cursor: "0x12d" }]);
  });

  it("never surfaces individual fill IDs or order IDs (no 'owner')", async () => {
    const { container } = await renderList({ list: [mkZoneBatch(4821)] });
    await waitFor(() =>
      expect((container.textContent ?? "").toLowerCase()).not.toContain(
        "owner",
      ),
    );
  });

  it("empty zone → honest empty state (no demo batches)", async () => {
    await renderList({ list: [] });
    await waitFor(() =>
      expect(screen.getByText("No zone batches yet.")).toBeDefined(),
    );
    expect(
      screen.getByText(
        "Check back after the zone produces its first block range.",
      ),
    ).toBeDefined();
  });

  it("unreachable zone → error state with a Retry button (no demo fallback)", async () => {
    await renderList({ listThrows: true });
    await waitFor(() =>
      expect(screen.getByText("Failed to load batches.")).toBeDefined(),
    );
    expect(screen.getByText("Refresh to retry.")).toBeDefined();
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(retry.className).toMatch(/(^|\s)press-down(\s|$)/);
  });

  it("search-no-results echoes the query and offers next steps", async () => {
    await renderList({ search: null }, { search: "0xdead" });
    await waitFor(() =>
      expect(screen.getByText('No batches match "0xdead".')).toBeDefined(),
    );
    expect(screen.getByText("Try a different ID or hash.")).toBeDefined();
  });
});

describe("BatchDetailView (live)", () => {
  it("renders the identity header with batch number, status, and privacy note", async () => {
    await renderDetail("4821", { detail: mkZoneBatch(4821, "submitted") });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "#4,821" }),
      ).toBeDefined(),
    );
    expect(screen.getAllByText("Submitted").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Public batch data contains aggregate counts/i),
    ).toBeDefined();
  });

  it("renders only lifecycle states represented by the RPC contract", async () => {
    await renderDetail("4821", { detail: mkZoneBatch(4821, "verified") });
    await waitFor(() => expect(screen.getByText("Produced")).toBeDefined());
    expect(screen.getAllByText("L1 submitted").length).toBeGreaterThan(0);
    expect(screen.getByText("Proof verified")).toBeDefined();
  });

  it("renders the Overview sidebar and aggregate pair/token data", async () => {
    await renderDetail("4821", { detail: mkZoneBatch(4821, "verified") });
    await waitFor(() => expect(screen.getByText("Overview")).toBeDefined());
    expect(
      screen.getByRole("heading", { level: 2, name: "Pairs in batch" }),
    ).toBeDefined();
    expect(screen.getByText("ALPHAUSD/PATH.USD")).toBeDefined();
    expect(screen.getByText("1.5 ALPHAUSD · 3 PATH.USD")).toBeDefined();
    expect(screen.queryByText(/TEE/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /Verify proof/i })).toBeNull();
  });

  it("does not fabricate pending settlement timestamps, roots, or proofs", async () => {
    const { container } = await renderDetail("4822", {
      detail: mkZoneBatch(4822, "pending"),
    });
    await waitFor(() =>
      expect(screen.getAllByText("Pending").length).toBeGreaterThan(0),
    );
    expect(screen.getByText("Observed Unavailable")).toBeDefined();
    expect(container.querySelector("#sealed")).toBeNull();
    expect(container.querySelector("#proof-hash")).toBeNull();
    expect(screen.queryByText(/TEE-attested/i)).toBeNull();
  });

  it("missing batch → honest not-found state (no demo fixture)", async () => {
    await renderDetail("9999", { detail: null });
    await waitFor(() =>
      expect(screen.getByText("Batch not found.")).toBeDefined(),
    );
    expect(
      screen.getByText(
        "No batch matches this identifier. Head back to /batches.",
      ),
    ).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Back to /batches" }),
    ).toBeDefined();
  });

  it("unreachable zone → error state with a Retry button", async () => {
    await renderDetail("4821", { detailThrows: true });
    await waitFor(() =>
      expect(screen.getByText("Failed to load batch.")).toBeDefined(),
    );
    expect(screen.getByText("Refresh to retry.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("preserves the lifecycle + metadata hash deep-link anchors", async () => {
    const { container } = await renderDetail("4821", {
      detail: mkZoneBatch(4821, "verified"),
    });
    await waitFor(() =>
      expect(container.querySelector("#settled")).not.toBeNull(),
    );
    expect(container.querySelector("#queued")).not.toBeNull();
    expect(container.querySelector("#proven")).not.toBeNull();
    expect(container.querySelector("#sealed")).not.toBeNull();
    expect(container.querySelector("#proof-hash")).not.toBeNull();
    expect(container.querySelector("#settlement-tx")).not.toBeNull();
  });
});
