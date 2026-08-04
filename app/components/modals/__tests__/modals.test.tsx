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
  "queued",
  "success",
  "failed",
];
const WITHDRAW_STATES: WithdrawState[] = [
  "idle",
  "signing",
  "pending",
  "queued",
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
  "reviewing-login",
  "authenticating-zone",
  "authorizing-session",
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

it("TempoWalletModal discloses the Omega session access-key scope", () => {
  render(
    <TempoWalletModal
      open
      state="authorizing-session"
      address="0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
      onClose={() => {}}
    />,
  );

  expect(screen.getByText("What this key can sign")).toBeDefined();
  expect(screen.getByText(/limit and market orders/i)).toBeDefined();
  expect(screen.getByText(/Omega darkpool and outbox/i)).toBeDefined();
  expect(screen.getByText(/1000 PATH\.USD/i)).toBeDefined();
  expect(
    screen.getByText(/cannot sign arbitrary wallet transactions/i),
  ).toBeDefined();
});

it("TempoWalletModal explains both login signatures before prompting", () => {
  render(
    <TempoWalletModal
      open
      state="idle"
      address="0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
      onClose={() => {}}
    />,
  );

  expect(screen.getByText("What Omega will ask you to sign")).toBeDefined();
  expect(screen.getByText(/auth token for private balances/i)).toBeDefined();
  expect(screen.getByText(/limited 1-day session key/i)).toBeDefined();
  expect(screen.getByText(/Neither gives Omega your root wallet key/i)).toBeDefined();
});

it("TempoWalletModal describes the auth-token signature as read-only", () => {
  render(
    <TempoWalletModal
      open
      state="authenticating-zone"
      address="0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
      onClose={() => {}}
    />,
  );

  expect(screen.getByText("What this signature allows")).toBeDefined();
  expect(screen.getByText(/private Omega Zone balances/i)).toBeDefined();
  expect(screen.getByText(/only authenticates private RPC reads/i)).toBeDefined();
});

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

it("DepositModal describes queued deposits as awaiting zone credit", () => {
  const onClose = vi.fn();

  render(
    <DepositModal
      open
      state="queued"
      token="PATH.USD"
      amount="100.00"
      permitSigned
      txHash="0xb47ad4f63f3f782cf19c778ee39015e1bfccd03ece71c1c60f06e9a533eabc29"
      onClose={onClose}
    />,
  );

  expect(screen.getByText("Awaiting zone credit")).toBeDefined();
  expect(
    screen.getByText(
      "Confirmed on Tempo. Waiting for Omega Zone to credit your balance.",
    ),
  ).toBeDefined();
  expect(screen.queryByText(/settlement/i)).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

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

it("WithdrawModal describes queued withdrawals as awaiting L1 settlement, not settled", () => {
  render(
    <WithdrawModal
      open
      state="queued"
      token="PATH.USD"
      withdrawalBatchIndex="7"
      onClose={() => {}}
    />,
  );

  expect(screen.getByText("Awaiting L1 settlement")).toBeDefined();
  expect(screen.getByText(/Settling in batch #7/i)).toBeDefined();
  // Must not claim the withdrawal is settled before L1 settlement.
  expect(screen.queryByText("Settled")).toBeNull();
  // The L2 zone tx hash must not be rendered as an explorer link.
  expect(screen.queryByRole("link")).toBeNull();
});

it("WithdrawModal starts each opening with a blank amount and the connected address", async () => {
  const connectedAddress = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";
  const otherAddress = "0x000000000000000000000000000000000000beef";
  const onSubmit = vi.fn();
  const onValuesChange = vi.fn();
  const { rerender } = render(
    <WithdrawModal
      open
      state="idle"
      defaultRecipient={connectedAddress}
      onClose={() => {}}
      onSubmit={onSubmit}
      onValuesChange={onValuesChange}
    />,
  );

  const amount = screen.getByLabelText("Amount") as HTMLInputElement;
  const recipient = screen.getByLabelText("Recipient") as HTMLInputElement;
  expect(amount.value).toBe("");
  expect(recipient.value).toBe(connectedAddress);

  fireEvent.change(amount, { target: { value: "25" } });
  fireEvent.change(recipient, { target: { value: otherAddress } });

  rerender(
    <WithdrawModal
      open={false}
      state="idle"
      defaultRecipient={connectedAddress}
      onClose={() => {}}
      onSubmit={onSubmit}
      onValuesChange={onValuesChange}
    />,
  );
  rerender(
    <WithdrawModal
      open
      state="idle"
      defaultRecipient={connectedAddress}
      onClose={() => {}}
      onSubmit={onSubmit}
      onValuesChange={onValuesChange}
    />,
  );

  await waitFor(() => {
    expect((screen.getByLabelText("Amount") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Recipient") as HTMLInputElement).value).toBe(
      connectedAddress,
    );
    expect(onValuesChange).toHaveBeenCalledWith({
      recipient: connectedAddress,
      amount: "",
    });
  });

  fireEvent.click(screen.getByRole("button", { name: "Sign withdrawal" }));
  await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  expect(screen.getByText("Amount required. Enter how much to withdraw.")).toBeDefined();
});

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
