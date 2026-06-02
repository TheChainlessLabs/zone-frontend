import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { configureAxe } from "vitest-axe";
import { vi } from "vitest";

import {
  DepositModal,
  OrderConfirmationModal,
  TempoWalletModal,
  WithdrawModal,
  type DepositState,
  type OrderConfirmationState,
  type TempoWalletState,
  type WithdrawState,
} from "@/components/modals";

afterEach(cleanup);

// Same axe config as the primitives suite — color-contrast and region rules
// are not meaningful in jsdom. Real-browser audits land in M7.
const axe = configureAxe({
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
  },
});

async function expectNoViolations() {
  // Modals render into document.body via portals — sweep the whole body.
  const results = await axe(document.body);
  expect(results.violations).toEqual([]);
}

const DEPOSIT_STATES: DepositState[] = [
  "idle",
  "approving",
  "depositing",
  "pending",
  "success",
  "failed",
];
const WITHDRAW_STATES: WithdrawState[] = [
  "idle",
  "signing",
  "pending",
  "success",
  "failed",
];
const ORDER_STATES: OrderConfirmationState[] = [
  "idle",
  "signing",
  "submitting",
  "failed",
];
const TEMPO_WALLET_STATES: TempoWalletState[] = [
  "idle",
  "connecting",
  "connected",
  "failed",
];

it.each(TEMPO_WALLET_STATES)(
  "TempoWalletModal — no a11y violations · %s",
  async (state) => {
    render(
      <TempoWalletModal
        open
        state={state}
        address="0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    await expectNoViolations();
    cleanup();
  }
);

it.each(DEPOSIT_STATES)(
  "DepositModal — no a11y violations · %s",
  async (state) => {
    render(
      <DepositModal
        open
        state={state}
        token="PATH.USD"
        amount="1000.00"
        permitSigned={state !== "idle" && state !== "approving"}
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    await expectNoViolations();
    cleanup();
  }
);

it.each(WITHDRAW_STATES)(
  "WithdrawModal — no a11y violations · %s",
  async (state) => {
    render(
      <WithdrawModal open state={state} token="PATH.USD" onClose={() => {}} />
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    await expectNoViolations();
    cleanup();
  }
);

it.each(ORDER_STATES)(
  "OrderConfirmationModal — no a11y violations · %s",
  async (state) => {
    render(
      <OrderConfirmationModal
        open
        state={state}
        side="buy"
        pair="USDC/EURC"
        mode="limit"
        amount="10,000.00"
        price="0.9213"
        midpoint="0.9213"
        available="10,000.00"
        submittedAt="2026-04-30T09:12:44.000Z"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    await expectNoViolations();
    cleanup();
  }
);

it("OrderConfirmationModal renders the receipt summary when open", () => {
  render(
    <OrderConfirmationModal
      open
      state="idle"
      side="buy"
      pair="USDC/EURC"
      mode="limit"
      amount="10,000.00"
      price="0.9213"
      midpoint="0.9213"
      available="10,000.00"
      submittedAt="2026-04-30T09:12:44.000Z"
      onClose={() => {}}
    />,
  );

  // Receipt-format content present
  expect(screen.getByRole("dialog")).toBeDefined();
  expect(screen.getByText(/ORDER PREVIEW/i)).toBeDefined();
});

it("OrderConfirmationModal closes on Escape when idle", async () => {
  const onClose = vi.fn();

  render(
    <OrderConfirmationModal
      open
      state="idle"
      side="buy"
      pair="USDC/EURC"
      mode="limit"
      amount="10,000.00"
      price="0.9213"
      midpoint="0.9213"
      available="10,000.00"
      submittedAt="2026-04-30T09:12:44.000Z"
      onClose={onClose}
    />,
  );

  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() => {
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
