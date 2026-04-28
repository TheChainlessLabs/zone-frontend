import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { configureAxe } from "vitest-axe";

import {
  ConnectWalletModal,
  DepositModal,
  OrderConfirmationModal,
  WithdrawModal,
  type ConnectWalletState,
  type DepositState,
  type OrderConfirmationState,
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

const CONNECT_STATES: ConnectWalletState[] = [
  "idle",
  "connecting",
  "connected",
  "failed",
  "no-nft-pass",
];
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

it.each(CONNECT_STATES)(
  "ConnectWalletModal — no a11y violations · %s",
  async (state) => {
    render(
      <ConnectWalletModal
        open
        state={state}
        activeConnector="MetaMask"
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
        token="USDC"
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
      <WithdrawModal open state={state} token="USDC" onClose={() => {}} />
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
        type="limit"
        amount="10,000.00"
        price="0.9213"
        estReceive="9,213.40"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    await expectNoViolations();
    cleanup();
  }
);
