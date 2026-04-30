"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Receipt } from "@/components/ui/receipt";
import { Status } from "@/components/ui/status";
import { formatAbsoluteTime, formatThousands } from "@/lib/format";
import { ModalShell } from "./modal-shell";

/**
 * OrderConfirmationModal — final review before order submission.
 *
 * State machine:
 *   idle       — review screen with Cancel / Confirm
 *   signing    — Awaiting EIP-712 signature
 *   submitting — Submitting to gateway
 *   failed     — wallet rejected or submission error
 *
 * Voice rules:
 *   - "Match" / "Settled" / "Submitting…" — short, brand lexicon only.
 *   - "Sign" never "approve". (omega-docs/03-brand/messaging.md)
 *   - Pair labels are token tickers (`USDC/EURC`), never fiat.
 */
export type OrderConfirmationState =
  | "idle"
  | "signing"
  | "submitting"
  | "failed";

export type OrderSide = "buy" | "sell";
export type OrderMode = "market" | "limit";

export interface OrderConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  state: OrderConfirmationState;
  side: OrderSide;
  /** Pair in BASE/QUOTE token-ticker form, e.g. `USDC/EURC`. */
  pair: string;
  mode: OrderMode;
  /** Order amount in the base token, formatted. */
  amount: string;
  /** Limit price (only used when mode === "limit"), formatted. */
  price?: string;
  /** Indicative midpoint, formatted. */
  midpoint?: string;
  /** Fee summary as a rate, formatted. */
  fee?: string;
  /** Available balance in the base token, formatted. */
  available?: string;
  /** Preview timestamp in ISO-8601 UTC. Defaults to current time. */
  submittedAt?: string;
  errorMessage?: string;
  onConfirm?: () => void;
  onRetry?: () => void;
}

export function OrderConfirmationModal({
  open,
  onClose,
  state,
  side,
  pair,
  mode,
  amount,
  price,
  midpoint,
  fee = "0.005%",
  available,
  submittedAt,
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onConfirm,
  onRetry,
}: OrderConfirmationModalProps) {
  const isBusy = state === "signing" || state === "submitting";
  const [base, quote] = pair.split("/");
  const previewTimestamp = React.useMemo(
    () => submittedAt ?? new Date().toISOString(),
    [submittedAt],
  );
  const submittedAtLabel = formatAbsoluteTime(previewTimestamp);
  const amountValue = parseNumeric(amount);
  const feeRate = parseFeeRate(fee);
  const feeAmount = amountValue * feeRate;
  const netAmount = Math.max(amountValue - feeAmount, 0);
  const amountLabel = `${amount} ${base}`;
  const availableLabel = `${available ?? amount} ${base}`;
  const feeLabel = `${formatFixedQuantity(feeAmount)} ${base}`;
  const netLabel = `${formatFixedQuantity(netAmount)} ${base}`;
  const typeLabel = mode === "limit" ? "Limit" : "Market";
  const sideLabel = side === "buy" ? "Buy" : "Sell";

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Review order"
      description={
        <>
          <span className="font-mono">{pair}</span> · {typeLabel}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Receipt cta={undefined}>
          <Receipt.Header label="ORDER PREVIEW" />
          <Receipt.Metadata>
            <Receipt.Row label="Pair" value={pair} />
            <Receipt.Row label="Side" value={sideLabel} />
            <Receipt.Row label="Type" value={typeLabel} />
            <Receipt.Row label="Submitted at" value={submittedAtLabel} />
            <Receipt.Row label="Available" value={availableLabel} />
          </Receipt.Metadata>
          <Receipt.Actions>
            <Receipt.Action number={1} label="Sign" payload="Wallet approval" />
            <Receipt.Action number={2} label="Queue" payload="Next batch" />
            <Receipt.Action
              number={3}
              label="Match"
              payload={
                mode === "market"
                  ? "Private midpoint"
                  : price
                    ? `${price} ${quote}`
                    : "Private limit"
              }
            />
            <Receipt.Action
              number={4}
              label="Settle"
              payload="Batch finality"
            />
          </Receipt.Actions>
          <Receipt.Totals>
            <Receipt.Row label="Amount" value={amountLabel} />
            <Receipt.Row label="Fee" value={feeLabel} />
            <Receipt.Row label="Net" value={netLabel} />
          </Receipt.Totals>
          <p className="px-4 pb-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
            Matches privately at midpoint.
          </p>
        </Receipt>

        {/* State surface */}
        <ConfirmationStateSurface state={state} message={errorMessage} />

        {/* CTAs */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {state !== "failed" ? (
            <>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isBusy}
                className="min-h-[44px] md:min-h-0"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isBusy}
                className="min-h-[44px] md:min-h-0"
              >
                Confirm order
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={onClose}
                className="min-h-[44px] md:min-h-0"
              >
                Cancel
              </Button>
              <Button
                onClick={onRetry}
                className="min-h-[44px] md:min-h-0"
              >
                Retry
              </Button>
            </>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function parseNumeric(value: string): number {
  return Number.parseFloat(value.replaceAll(",", "")) || 0;
}

function parseFeeRate(value: string): number {
  return (Number.parseFloat(value.replace("%", "")) || 0) / 100;
}

function formatFixedQuantity(value: number): string {
  return formatThousands(value.toFixed(2));
}

function ConfirmationStateSurface({
  state,
  message,
}: {
  state: OrderConfirmationState;
  message: string;
}) {
  if (state === "idle") return null;

  if (state === "signing") {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="awaiting-signature" />
        <span className="text-xs text-[var(--muted-foreground)]">
          Sign the order in your wallet.
        </span>
      </div>
    );
  }

  if (state === "submitting") {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="submitting" />
        <span className="text-xs text-[var(--muted-foreground)]">
          Sending to the matching engine.
        </span>
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
