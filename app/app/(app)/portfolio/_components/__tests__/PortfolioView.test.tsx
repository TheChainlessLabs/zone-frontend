import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { PortfolioView } from "@/app/(app)/portfolio/_components/PortfolioView";
import type { PortfolioFixture } from "@/lib/view-types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(cleanup);

it("shows the newest deposits first in recent activity", () => {
  render(
    <PortfolioView
      fixture={portfolioWithOldestFirstDeposits}
      onDeposit={() => {}}
      onWithdraw={() => {}}
      onMore={() => {}}
    />,
  );

  const recentActivity = screen
    .getByRole("heading", { name: "Recent activity" })
    .closest("section");

  expect(recentActivity).not.toBeNull();
  expect(within(recentActivity as HTMLElement).getByText("50.00")).toBeDefined();
  expect(
    within(recentActivity as HTMLElement).queryByText("10.00"),
  ).toBeNull();
});

it("only labels recent activity as limited to the last 24 hours", () => {
  render(
    <PortfolioView
      fixture={portfolioWithOldestFirstDeposits}
      onDeposit={() => {}}
      onWithdraw={() => {}}
      onMore={() => {}}
    />,
  );

  const recentActivity = screen
    .getByRole("heading", { name: "Recent activity" })
    .closest("section");
  expect(recentActivity).not.toBeNull();
  expect(
    within(recentActivity as HTMLElement).getByText("5 entries · last 24h"),
  ).toBeDefined();

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

  const activity = screen
    .getByRole("heading", { name: "Activity" })
    .closest("section");
  expect(activity).not.toBeNull();
  expect(within(activity as HTMLElement).getByText("5 entries")).toBeDefined();
  expect(
    within(activity as HTMLElement).queryByText(/last 24h/i),
  ).toBeNull();
});

it("shows the decoded side and order type in activity", () => {
  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        recentFills: [
          {
            id: "f-market-sell",
            orderId: "o-market-sell",
            pair: "ALPHAUSD/PATH.USD",
            side: "sell",
            type: "market",
            amount: "1.00",
            price: "1.000000",
            matchedAt: "2026-07-07T10:48:00.000Z",
            status: "matched",
            txHash:
              "0xabababababababababababababababababababababababababababababababab",
          },
        ],
      }}
      onDeposit={() => {}}
      onWithdraw={() => {}}
      onMore={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
  const table = screen.getByRole("table");
  const row = within(table).getByText("ALPHAUSD/PATH.USD").closest("tr");

  expect(row).not.toBeNull();
  expect(within(row as HTMLElement).getByText("Sell")).toBeDefined();
  expect(within(row as HTMLElement).getByText("Market")).toBeDefined();
});

it("shows a resting order submission in activity", () => {
  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [restingSellOrder],
        deposits: [],
      }}
      onCancelOrder={async () => {}}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
  const row = screen.getByText("ALPHAUSD/PATH.USD").closest("tr");

  expect(row).not.toBeNull();
  expect(within(row as HTMLElement).getByText("Sell")).toBeDefined();
  expect(within(row as HTMLElement).getByText("Limit")).toBeDefined();
  expect(within(row as HTMLElement).getByText("Pending")).toBeDefined();
  expect(within(row as HTMLElement).getByText("2.00")).toBeDefined();
});

it("keeps terminal orders in full activity after they leave open orders", () => {
  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [],
        activityOrders: [{ ...restingSellOrder, status: "cancelled" }],
        deposits: [],
      }}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
  const row = screen.getByText("ALPHAUSD/PATH.USD").closest("tr");

  expect(row).not.toBeNull();
  expect(within(row as HTMLElement).getByText("Cancelled")).toBeDefined();
  expect(within(row as HTMLElement).getByText("2.00")).toBeDefined();
});

it("shows a fully executed same-transaction limit order only as a fill", () => {
  const txHash =
    "0xac37424eca265867559f6d9b4fbe9dcf1893a1f9b2881283f92505f01a5995c3" as const;
  const submittedOrder = {
    ...restingSellOrder,
    id: "o-8",
    amount: "1.00",
    amountRaw: "1000000",
    txHash,
  };

  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [],
        activityOrders: [submittedOrder],
        recentFills: [
          {
            id: `f-${txHash.slice(2)}-2-taker`,
            orderId: "o-8",
            pair: "ALPHAUSD/PATH.USD",
            side: "sell",
            type: "limit",
            amount: "1.00",
            amountRaw: "1000000",
            price: "1.000000",
            matchedAt: submittedOrder.submittedAt,
            status: "matched",
            txHash,
          },
        ],
        deposits: [],
        withdrawals: [],
      }}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

  expect(screen.getByText("1 entries")).toBeDefined();
  expect(screen.getAllByText("ALPHAUSD/PATH.USD")).toHaveLength(1);
  expect(screen.getByText("Matched")).toBeDefined();
  expect(screen.queryByText("Pending")).toBeNull();
});

it("shows a resting buy and crossing sell as one buy and one sell", () => {
  const buyTx =
    "0xa0c9f205c1bb7c86ab0a45cf75e76f567d00923443457d8979e675096173137c" as const;
  const sellTx =
    "0xa8f9cac83fcdfdc02b7296b867503bc4ba1198826ef1c9167893d7de1e3c73e0" as const;
  const buyOrder = {
    ...restingSellOrder,
    id: "o-9",
    side: "buy" as const,
    amount: "2.00",
    amountRaw: "2000000",
    price: "2.000000",
    status: "matched" as const,
    txHash: buyTx,
  };
  const sellOrder = {
    ...buyOrder,
    id: "o-10",
    side: "sell" as const,
    txHash: sellTx,
  };

  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [],
        activityOrders: [sellOrder, buyOrder],
        recentFills: [
          {
            id: `f-${sellTx.slice(2)}-4-maker`,
            orderId: "o-9",
            pair: "ALPHAUSD/PATH.USD",
            side: "buy",
            type: "limit",
            amount: "2.00",
            amountRaw: "2000000",
            price: "2.000000",
            matchedAt: sellOrder.submittedAt,
            status: "matched",
            txHash: sellTx,
          },
          {
            id: `f-${sellTx.slice(2)}-4-taker`,
            orderId: "o-10",
            pair: "ALPHAUSD/PATH.USD",
            side: "sell",
            type: "limit",
            amount: "2.00",
            amountRaw: "2000000",
            price: "2.000000",
            matchedAt: sellOrder.submittedAt,
            status: "matched",
            txHash: sellTx,
          },
        ],
        deposits: [],
        withdrawals: [],
      }}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

  expect(screen.getByText("2 entries")).toBeDefined();
  const rows = screen
    .getAllByText("ALPHAUSD/PATH.USD")
    .map((market) => market.closest("tr") as HTMLElement);
  expect(rows).toHaveLength(2);
  expect(rows.filter((row) => within(row).queryByText("Buy"))).toHaveLength(1);
  expect(rows.filter((row) => within(row).queryByText("Sell"))).toHaveLength(1);
});

it("keeps a partially executed same-transaction order and its fill", () => {
  const txHash =
    "0xbc37424eca265867559f6d9b4fbe9dcf1893a1f9b2881283f92505f01a5995c3" as const;
  const submittedOrder = {
    ...restingSellOrder,
    id: "o-9",
    amount: "2.00",
    txHash,
  };

  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [submittedOrder],
        activityOrders: [submittedOrder],
        recentFills: [
          {
            id: `f-${txHash.slice(2)}-2-taker`,
            orderId: "o-9",
            pair: "ALPHAUSD/PATH.USD",
            side: "sell",
            type: "limit",
            amount: "1.00",
            price: "1.000000",
            matchedAt: submittedOrder.submittedAt,
            status: "matched",
            txHash,
          },
        ],
        deposits: [],
        withdrawals: [],
      }}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

  expect(screen.getByText("2 entries")).toBeDefined();
  expect(screen.getAllByText("ALPHAUSD/PATH.USD")).toHaveLength(2);
  expect(screen.getByText("Pending")).toBeDefined();
  expect(screen.getByText("Matched")).toBeDefined();
});

it("keeps a same-transaction order with a sub-cent residual", () => {
  const txHash =
    "0xcc37424eca265867559f6d9b4fbe9dcf1893a1f9b2881283f92505f01a5995c3" as const;
  const submittedOrder = {
    ...restingSellOrder,
    id: "o-10",
    amount: "1.00",
    amountRaw: "1009999",
    txHash,
  };

  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [submittedOrder],
        activityOrders: [submittedOrder],
        recentFills: [
          {
            id: `f-${txHash.slice(2)}-2-taker`,
            orderId: "o-10",
            pair: "ALPHAUSD/PATH.USD",
            side: "sell",
            type: "limit",
            amount: "1.00",
            amountRaw: "1000001",
            price: "1.000000",
            matchedAt: submittedOrder.submittedAt,
            status: "matched",
            txHash,
          },
        ],
        deposits: [],
        withdrawals: [],
      }}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

  expect(screen.getByText("2 entries")).toBeDefined();
  expect(screen.getAllByText("ALPHAUSD/PATH.USD")).toHaveLength(2);
});

it("delegates cancellation and does not hide the order locally", async () => {
  let finishCancellation: (() => void) | undefined;
  const onCancelOrder = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishCancellation = resolve;
      }),
  );
  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [restingSellOrder],
        deposits: [],
      }}
      onCancelOrder={onCancelOrder}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onCancelOrder).toHaveBeenCalledWith(restingSellOrder);
  expect(
    (screen.getByRole("button", { name: "Cancelling…" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  finishCancellation?.();
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
  expect(screen.getAllByText("Sell ALPHAUSD/PATH.USD").length).toBeGreaterThan(0);
});

it("keeps the order visible and reports cancellation failures", async () => {
  render(
    <PortfolioView
      fixture={{
        ...portfolioWithOldestFirstDeposits,
        openOrders: [restingSellOrder],
        deposits: [],
      }}
      onCancelOrder={vi.fn().mockRejectedValue(new Error("Order is no longer open."))}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

  expect((await screen.findByRole("alert")).textContent).toContain(
    "Order is no longer open.",
  );
  expect(screen.getAllByText("Sell ALPHAUSD/PATH.USD").length).toBeGreaterThan(0);
});

const restingSellOrder: PortfolioFixture["openOrders"][number] = {
  id: "o-42",
  pair: "ALPHAUSD/PATH.USD",
  side: "sell",
  type: "limit",
  amount: "2.00",
  price: "1.000000",
  filledPercent: 0,
  status: "pending",
  submittedAt: "2026-07-07T11:30:00.000Z",
  txHash:
    "0x4242424242424242424242424242424242424242424242424242424242424242",
};

const portfolioWithOldestFirstDeposits: PortfolioFixture = {
  totalValueUSD: "150.00",
  balances: [
    {
      token: "PATH.USD",
      available: "150.00",
      locked: "0.00",
      total: "150.00",
    },
  ],
  openOrders: [],
  recentFills: [],
  deposits: [1, 2, 3, 4, 5].map((n) => ({
    id: `d-${n}`,
    token: "PATH.USD",
    amount: `${n}0.00`,
    status: "credited",
    initiatedAt: `2026-06-16T10:0${n}:00.000Z`,
    txHash: `0x${String(n).repeat(64)}` as `0x${string}`,
  })),
  withdrawals: [],
};
