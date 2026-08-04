"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { truncateAddress } from "@/components/shell/WalletStateProvider";
import { ModalShell } from "./modal-shell";

export type TempoWalletState =
  | "idle"
  | "connecting"
  | "reviewing-login"
  | "authenticating-zone"
  | "authorizing-session"
  | "connected"
  | "failed";

export interface TempoWalletModalProps {
  open: boolean;
  onClose: () => void;
  state: TempoWalletState;
  address?: string;
  errorMessage?: string;
  onCreateAccount?: () => void;
  onSignIn?: () => void;
  onContinue?: () => void;
  /** Dev-only: connect the key-backed test wallet. Renders an extra button when
   *  provided (gated by NEXT_PUBLIC_DEV_WALLET_PK upstream). */
  onDevSignIn?: () => void;
  /** Dev-only: connect the key-backed maker wallet (for two-party fills).
   *  Renders an extra button when provided (gated by NEXT_PUBLIC_MAKER_WALLET_PK). */
  onMakerSignIn?: () => void;
}

export function TempoWalletModal({
  open,
  onClose,
  state,
  address,
  errorMessage = "Tempo Wallet could not complete the request. Try again.",
  onCreateAccount,
  onSignIn,
  onContinue,
  onDevSignIn,
  onMakerSignIn,
}: TempoWalletModalProps) {
  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={titleFor(state)}
      description={descriptionFor(state)}
      desktopMaxWidth={
        state === "idle" ||
        state === "reviewing-login" ||
        state === "authorizing-session"
          ? "max-w-lg"
          : "max-w-md"
      }
    >
      {state === "idle" ? (
        <div className="flex flex-col gap-3">
          <OmegaLoginDisclosure />
          <Button onClick={onCreateAccount} className="min-h-[44px] md:min-h-0">
            <Icon.Wallet aria-hidden />
            <span>Create Tempo account</span>
          </Button>
          <Button
            variant="outline"
            onClick={onSignIn}
            className="min-h-[44px] md:min-h-0"
          >
            <Icon.Sign aria-hidden />
            <span>Sign in with Tempo Wallet</span>
          </Button>
          {onDevSignIn ? (
            <Button
              variant="ghost"
              onClick={onDevSignIn}
              className="min-h-[44px] md:min-h-0"
            >
              <Icon.Sign aria-hidden />
              <span>Sign in with Test Wallet (dev)</span>
            </Button>
          ) : null}
          {onMakerSignIn ? (
            <Button
              variant="ghost"
              onClick={onMakerSignIn}
              className="min-h-[44px] md:min-h-0"
            >
              <Icon.Sign aria-hidden />
              <span>Sign in with Maker Wallet (dev)</span>
            </Button>
          ) : null}
        </div>
      ) : null}

      {state === "reviewing-login" ? (
        <div className="flex flex-col gap-4">
          <OmegaLoginDisclosure />
          {!address && onCreateAccount ? (
            <Button
              onClick={onCreateAccount}
              className="min-h-[44px] md:min-h-0"
            >
              <Icon.Wallet aria-hidden />
              <span>Create Tempo account</span>
            </Button>
          ) : null}
          <Button
            onClick={onContinue ?? onSignIn}
            variant={address ? "default" : "outline"}
            className="min-h-[44px] md:min-h-0"
          >
            <Icon.Sign aria-hidden />
            <span>{address ? "Continue login" : "Sign in with Tempo Wallet"}</span>
          </Button>
        </div>
      ) : null}

      {state === "connecting" ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner />
          <Status state="awaiting-signature" label="Open Tempo Wallet" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Complete the request in Tempo Wallet.
          </p>
        </div>
      ) : null}

      {state === "authenticating-zone" ? (
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner />
            <Status state="awaiting-signature" label="Sign Omega auth token" />
            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              Sign a short-lived token that proves this wallet can read your
              private Omega Zone balances, orders, fills, and transfers.
            </p>
          </div>
          <AuthTokenDisclosure />
        </div>
      ) : null}

      {state === "authorizing-session" ? (
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner />
            <Status state="awaiting-signature" label="Authorize Omega session" />
            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              Tempo Wallet may summarize this as token limits and expiry. Review
              the full Omega session scope before approving.
            </p>
          </div>
          <SessionAccessKeyDisclosure />
        </div>
      ) : null}

      {state === "connected" ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <Status state="connected" label="Tempo connected" />
          {address ? (
            <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
              {truncateAddress(address)}
            </span>
          ) : null}
          <Button
            variant="ghost"
            onClick={onClose}
            className="min-h-[44px] md:min-h-0"
          >
            Close
          </Button>
        </div>
      ) : null}

      {state === "failed" ? (
        <div className="flex flex-col gap-4">
          <Status state="failed" />
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            {errorMessage}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Cancel
            </Button>
            <Button onClick={onSignIn} className="min-h-[44px] md:min-h-0">
              Retry
            </Button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function titleFor(state: TempoWalletState): string {
  switch (state) {
    case "idle":
      return "Sign in to Omega";
    case "connecting":
      return "Connecting";
    case "reviewing-login":
      return "Finish Omega login";
    case "authenticating-zone":
      return "Sign Omega auth token";
    case "authorizing-session":
      return "Authorize Omega session";
    case "connected":
      return "Connected";
    case "failed":
      return "Connection failed";
  }
}

function descriptionFor(state: TempoWalletState): React.ReactNode {
  switch (state) {
    case "idle":
      return "Review the wallet requests Omega needs before any prompt opens.";
    case "connecting":
      return "Awaiting Tempo Wallet.";
    case "reviewing-login":
      return "Confirm the remaining Omega requests before continuing.";
    case "authenticating-zone":
      return "Approve private Omega Zone reads.";
    case "authorizing-session":
      return "Authorize the limited session key in Tempo Wallet.";
    case "connected":
      return "Tempo account ready.";
    case "failed":
      return null;
  }
}

function OmegaLoginDisclosure() {
  return (
    <section
      aria-labelledby="omega-login-review-title"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-left"
    >
      <div className="mb-3 flex items-start gap-2">
        <Icon.Info
          aria-hidden
          size={16}
          className="mt-0.5 shrink-0 text-[var(--muted-foreground)]"
        />
        <div>
          <h3
            id="omega-login-review-title"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            What Omega will ask you to sign
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
            Two scoped requests unlock private Zone data and local order
            signing. Neither gives Omega your root wallet key.
          </p>
        </div>
      </div>

      <dl className="grid gap-2 text-xs">
        <DisclosureRow
          label="First"
          value="Sign an Omega Zone auth token for private balances, orders, fills, and transfers."
        />
        <DisclosureRow
          label="Second"
          value="Authorize a limited 1-day session key for Omega Zone orders and token movements."
        />
        <DisclosureRow
          label="Limits"
          value="The session key is capped to about 1000 PATH.USD plus fee headroom, and 1000 ALPHAUSD."
        />
      </dl>
    </section>
  );
}

function AuthTokenDisclosure() {
  return (
    <section
      aria-labelledby="omega-auth-token-title"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-left"
    >
      <div className="mb-3 flex items-start gap-2">
        <Icon.Sign
          aria-hidden
          size={16}
          className="mt-0.5 shrink-0 text-[var(--muted-foreground)]"
        />
        <div>
          <h3
            id="omega-auth-token-title"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            What this signature allows
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
            Private read access for this Omega Zone session.
          </p>
        </div>
      </div>

      <dl className="grid gap-2 text-xs">
        <DisclosureRow
          label="Reads"
          value="Your Zone balances, darkpool balances, orders, fills, transfers, and withdrawal status."
        />
        <DisclosureRow
          label="Writes"
          value="None. This token only authenticates private RPC reads."
        />
        <DisclosureRow label="Expires" value="About 15 minutes." />
      </dl>
    </section>
  );
}

function SessionAccessKeyDisclosure() {
  return (
    <section
      aria-labelledby="omega-session-scope-title"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-left"
    >
      <div className="mb-3 flex items-start gap-2">
        <Icon.Info
          aria-hidden
          size={16}
          className="mt-0.5 shrink-0 text-[var(--muted-foreground)]"
        />
        <div>
          <h3
            id="omega-session-scope-title"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            What this key can sign
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
            Only Omega Zone actions on the testnet account you just connected.
          </p>
        </div>
      </div>

      <dl className="grid gap-2 text-xs">
        <DisclosureRow
          label="Actions"
          value="Token approvals, deposits, withdrawals, limit and market orders, order cancels, and outbox withdrawal requests."
        />
        <DisclosureRow
          label="Contracts"
          value="Omega darkpool and outbox, plus PATH.USD and ALPHAUSD token approvals to those Omega contracts."
        />
        <DisclosureRow
          label="Caps"
          value="About 1000 PATH.USD plus fee headroom, and 1000 ALPHAUSD."
        />
        <DisclosureRow label="Expires" value="1 day." />
      </dl>

      <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
        It cannot sign arbitrary wallet transactions or spend outside the shown
        token caps.
      </p>
    </section>
  );
}

function DisclosureRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3">
      <dt className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className="leading-relaxed text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none"
    />
  );
}
