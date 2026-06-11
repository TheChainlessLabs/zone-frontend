import { describe, expect, it } from "vitest";
import type { Address } from "viem";

import { mergeOmegaZoneActivity } from "@/lib/zone";
import type { OrderFixture } from "@/lib/view-types";

// The in-memory optimistic store is keyed by account, so each test uses a
// distinct address to avoid cross-test bleed.
function mkOrder(id: string): OrderFixture {
  return {
    id,
    pair: "OALPHA/PATH.USD",
    side: "buy",
    type: "limit",
    amount: "7.50",
    price: "1.000000",
    filledPercent: 0,
    status: "pending",
    submittedAt: "2026-06-11T07:06:46.000Z",
  };
}

describe("mergeOmegaZoneActivity order reconciliation", () => {
  it("accumulates orders by id by default (optimistic patch)", () => {
    const account = "0x0000000000000000000000000000000000000a01" as Address;
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    const merged = mergeOmegaZoneActivity(account, {
      orders: [mkOrder("o-2")],
    });
    expect(merged.orders.map((o) => o.id).sort()).toEqual(["o-2", "o-opt"]);
  });

  it("REPLACES orders when the patch is an authoritative snapshot", () => {
    const account = "0x0000000000000000000000000000000000000a02" as Address;
    // An optimistic place-time "pending" row is recorded first…
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    // …then the authoritative zone_getMyOrders snapshot (order has since filled,
    // so the open set is empty) must drop the stale optimistic row.
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [] },
      { ordersAuthoritative: true },
    );
    expect(reconciled.orders).toEqual([]);
  });

  it("authoritative replace keeps still-resting orders", () => {
    const account = "0x0000000000000000000000000000000000000a03" as Address;
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    const reconciled = mergeOmegaZoneActivity(
      account,
      { orders: [mkOrder("o-real")] },
      { ordersAuthoritative: true },
    );
    expect(reconciled.orders.map((o) => o.id)).toEqual(["o-real"]);
  });

  it("ignores ordersAuthoritative when patch omits orders entirely", () => {
    const account = "0x0000000000000000000000000000000000000a04" as Address;
    mergeOmegaZoneActivity(account, { orders: [mkOrder("o-opt")] });
    const merged = mergeOmegaZoneActivity(
      account,
      { fills: [] },
      { ordersAuthoritative: true },
    );
    expect(merged.orders.map((o) => o.id)).toEqual(["o-opt"]);
  });
});
