"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Receipt } from "@/components/ui/receipt";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
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
  /** Token symbol for the available balance. Defaults to the pair base. */
  availableToken?: string;
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
  availableToken,
  submittedAt,
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onConfirm,
  onRetry,
}: OrderConfirmationModalProps) {
  const isBusy = state === "signing" || state === "submitting";
  const [base] = pair.split("/");
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
  const availableLabel = `${available ?? amount} ${availableToken ?? base}`;
  const feeLabel = `${formatFixedQuantity(feeAmount)} ${base}`;
  const netLabel = `${formatFixedQuantity(netAmount)} ${base}`;
  const typeLabel = mode === "limit" ? "Limit" : "Market";
  const sideLabel = side === "buy" ? "Buy" : "Sell";
  const displayErrorMessage = formatOrderErrorMessage(errorMessage);

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Confirm order"
      description={
        <>
          <span className="font-mono">{pair}</span> · {typeLabel} · Review and
          sign to submit.
        </>
      }
    >
      <div className="flex min-w-0 flex-col gap-5">
        <Receipt cta={undefined}>
          <Receipt.Header label="ORDER PREVIEW" />
          <Receipt.Metadata>
            <Receipt.Row label="Pair" value={pair} />
            <Receipt.Row label="Side" value={sideLabel} />
            <Receipt.Row label="Type" value={typeLabel} />
            <Receipt.Row label="Submitted at" value={submittedAtLabel} />
            <Receipt.Row label="Available" value={availableLabel} />
          </Receipt.Metadata>
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
        <ConfirmationStateSurface state={state} message={displayErrorMessage} />

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
                className="min-h-[44px] gap-2 md:min-h-0"
              >
                <Icon.Sign size={16} aria-hidden />
                Sign
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

function formatOrderErrorMessage(message: string): string {
  if (message.includes("Invalid params") && message.includes("eth_sendTransaction")) {
    return "Tempo Wallet rejected the zone transaction request. Retry once; if it repeats, the wallet likely does not support this Omega Zone transaction path yet.";
  }
  if (message.length <= 320) return message;
  return `${message.slice(0, 320).trim()}...`;
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
    <div className="flex min-w-0 max-w-full flex-col gap-2 overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3">
      <Status state="failed" />
      <p className="max-h-36 min-w-0 overflow-y-auto text-xs leading-relaxed text-[var(--foreground)] [overflow-wrap:anywhere]">
        {message}
      </p>
    </div>
  );
}
