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
    expect(screen.getByText("Batches")).toBeDefined();
    expect(
      screen.getByText(
        "Sealed settlement batches with on-chain attestation. Public, verifiable.",
      ),
    ).toBeDefined();
  });

  it("default state surfaces the search affordance and per-page selector", async () => {
    await renderList();
    expect(screen.getByLabelText("Search batches")).toBeDefined();
    expect(screen.getByText(/Per page/)).toBeDefined();
  });

  it("never renders an Owner / counterparty column on the list", async () => {
    await renderList();
    // Privacy hard rule. The list view is aggregate metadata only.
    expect(screen.queryByText(/owner/i)).toBeNull();
    expect(screen.queryByText(/counterparty/i)).toBeNull();
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
  it("renders the verified-batch happy path with the externally verifiable banner", async () => {
    await renderDetail("4821");
    expect(screen.getByText("Batch #4821")).toBeDefined();
    expect(
      screen.getByText("Settlement attestation + L1 anchoring."),
    ).toBeDefined();
    expect(screen.getByText("Externally verifiable")).toBeDefined();
  });

  it("pending detail surfaces an awaiting-attestation banner", async () => {
    await renderDetail("4818", { state: "detail-pending" });
    expect(screen.getByText(/Awaiting attestation submission/)).toBeDefined();
  });

  it("failed detail surfaces a failure banner", async () => {
    await renderDetail("4795", { state: "detail-failed" });
    expect(
      screen.getByText(/Settlement reverted on L1/i),
    ).toBeDefined();
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
    // And no "Owner" / counterparty labels.
    expect(text).not.toMatch(/owner/i);
    expect(text).not.toMatch(/counterparty/i);
  });

  it("links to /portfolio for a user's own fills", async () => {
    await renderDetail("4821");
    const link = screen.getByRole("link", { name: "/portfolio" });
    expect(link.getAttribute("href")).toBe("/portfolio");
  });

  it("aggregate fills section title carries the (aggregate) clarifier", async () => {
    await renderDetail("4821");
    expect(screen.getByText("Fills (aggregate)")).toBeDefined();
  });
});
