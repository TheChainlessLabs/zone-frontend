"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { tempoTxUrl } from "@/lib/zone";
import { ModalShell } from "./modal-shell";

/**
 * DepositModal — bridge supported private-alpha tokens from Tempo L1 into Omega Zone.
 *
 * State machine:
 *   idle       — picker, amount entry, fee summary, two CTAs
 *   approving  — Sign permit pending in wallet
 *   depositing — Sign deposit pending in wallet
 *   pending    — zone sequencer waiting for L1 confirmation (~30s)
 *   queued     — L1 confirmed; zone credit still pending
 *   success    — deposit credited in zone; tx hash link
 *   failed     — wallet rejected or zone RPC error
 *
 * Voice: "Sign permit" / "Sign deposit" — never "approve" /
 * "authorise" (omega-docs/03-brand/messaging.md).
 */
export type DepositState =
  | "idle"
  | "approving"
  | "depositing"
  | "pending"
  | "queued"
  | "success"
  | "failed";

export type DepositToken = "PATH.USD" | "ALPHAUSD";

const DEPOSIT_TOKENS: DepositToken[] = ["PATH.USD", "ALPHAUSD"];
const PERCENT_SHORTCUTS = [25, 50, 75] as const;

export interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  state: DepositState;
  token?: DepositToken;
  amount?: string;
  /** Wallet balance in the selected token, formatted. */
  walletBalance?: string;
  /** Network fee, formatted in Tempo native USD units. */
  networkFeeUsd?: string;
  /** True once the permit signature has landed. Greys out the first CTA. */
  permitSigned?: boolean;
  txHash?: string;
  errorMessage?: string;
  onTokenChange?: (token: DepositToken) => void;
  onAmountChange?: (amount: string) => void;
  onSignPermit?: () => void;
  onSignDeposit?: () => void;
  onRetry?: () => void;
}

export function DepositModal({
  open,
  onClose,
  state,
  token = "PATH.USD",
  amount = "",
  walletBalance = "12,500.00",
  networkFeeUsd = "—",
  permitSigned = false,
  txHash = "0x9f…3c4a",
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onTokenChange,
  onAmountChange,
  onSignPermit,
  onSignDeposit,
  onRetry,
}: DepositModalProps) {
  const isBusy =
    state === "approving" || state === "depositing" || state === "pending";

  const handlePercent = (pct: number) => {
    if (!onAmountChange) return;
    const balance = Number(walletBalance.replace(/,/g, ""));
    if (Number.isNaN(balance)) return;
    const next = (balance * (pct / 100)).toFixed(2);
    onAmountChange(next);
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Deposit"
      description={`Bridge ${token} from Tempo L1 into Omega Zone.`}
    >
      <div className="flex flex-col gap-5">
        {/* Chain selector — locked to Tempo L1 for v0 */}
        <div className="flex flex-col gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Chain
          </Label>
          <button
            type="button"
            disabled
            aria-disabled
            className="flex h-10 items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)] px-3 text-sm opacity-80"
          >
            <span className="flex items-center gap-2">
              <Icon.Wallet size={14} aria-hidden />
              Tempo L1
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              L1 only
            </span>
          </button>
        </div>

        {/* Token selector */}
        <div className="flex flex-col gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Token
          </Label>
          <div className="flex gap-2">
            {DEPOSIT_TOKENS.map((t) => (
              <Chip
                key={t}
                active={t === token}
                onClick={() => onTokenChange?.(t)}
              >
                {t}
              </Chip>
            ))}
          </div>
        </div>

        {/* Amount + percentage shortcuts */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <Label
              htmlFor="deposit-amount"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
            >
              Amount
            </Label>
            <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
              Wallet · {walletBalance} {token}
            </span>
          </div>
          <Input
            id="deposit-amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value)}
            className="font-mono tabular-nums"
            disabled={isBusy || state === "success"}
          />
          <div className="flex gap-2">
            {PERCENT_SHORTCUTS.map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => handlePercent(p)}
                disabled={isBusy || state === "success"}
              >
                {p}%
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAmountChange?.(walletBalance.replace(/,/g, ""))}
              disabled={isBusy || state === "success"}
            >
              Max
            </Button>
          </div>
        </div>

        {/* Fee summary */}
        <dl className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-xs">
          <div className="flex items-center justify-between">
            <dt className="text-[var(--muted-foreground)]">Network fee</dt>
            <dd className="font-mono tabular-nums">{networkFeeUsd}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--muted-foreground)]">You deposit</dt>
            <dd className="font-mono tabular-nums">
              {amount || "0.00"} {token}
            </dd>
          </div>
        </dl>

        {/* State surface */}
        <DepositStateSurface state={state} txHash={txHash} message={errorMessage} />

        {/* CTAs */}
        {state !== "success" && state !== "queued" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="min-h-[44px] flex-1 md:min-h-0"
              onClick={onSignPermit}
              disabled={permitSigned || state === "approving" || state === "depositing" || state === "pending"}
            >
              {permitSigned ? "Permit signed" : "Sign permit"}
            </Button>
            <Button
              className="min-h-[44px] flex-1 md:min-h-0"
              onClick={state === "failed" ? onRetry : onSignDeposit}
              disabled={state === "approving" || state === "depositing" || state === "pending" || !permitSigned && state !== "failed"}
            >
              {state === "failed" ? "Retry" : "Sign deposit"}
            </Button>
          </div>
        ) : (
          <Button onClick={onClose} className="min-h-[44px] md:min-h-0">
            Done
          </Button>
        )}
      </div>
    </ModalShell>
  );
}

function DepositStateSurface({
  state,
  txHash,
  message,
}: {
  state: DepositState;
  txHash: string;
  message: string;
}) {
  if (state === "idle") return null;

  if (state === "approving" || state === "depositing") {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="awaiting-signature" />
        <span className="text-xs text-[var(--muted-foreground)]">
          {state === "approving"
            ? "Sign the permit in your wallet."
            : "Sign the deposit in your wallet."}
        </span>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="pending" />
        <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          We&rsquo;re confirming your deposit on Tempo. This usually takes
          about 30 seconds.
        </span>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="credited" />
        <a
          href={tempoTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {txHash}
          <Icon.External size={12} aria-hidden />
        </a>
      </div>
    );
  }

  if (state === "queued") {
    return (
      <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <div className="flex items-start gap-3">
          <Status state="pending" label="Awaiting zone credit" />
          <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            Confirmed on Tempo. Waiting for Omega Zone to credit your balance.
          </span>
        </div>
        <a
          href={tempoTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {txHash}
          <Icon.External size={12} aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3">
      <Status state="failed" />
      <span className="text-xs leading-relaxed text-[var(--foreground)]">
        {message}
      </span>
    </div>
  );
}
