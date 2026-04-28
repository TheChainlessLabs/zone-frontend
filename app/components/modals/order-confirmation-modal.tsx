"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
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
export type OrderType = "limit" | "midpoint";

export interface OrderConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  state: OrderConfirmationState;
  side: OrderSide;
  /** Pair in BASE/QUOTE token-ticker form, e.g. `USDC/EURC`. */
  pair: string;
  type: OrderType;
  /** Order amount in the base token, formatted. */
  amount: string;
  /** Limit price (only used when type === "limit"), formatted. */
  price?: string;
  /** Estimated receive in the quote token, formatted. */
  estReceive: string;
  /** Fee summary in USD, formatted. */
  feeUsd?: string;
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
  type,
  amount,
  price,
  estReceive,
  feeUsd = "$0.42",
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onConfirm,
  onRetry,
}: OrderConfirmationModalProps) {
  const isBusy = state === "signing" || state === "submitting";
  const [base, quote] = pair.split("/");

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Review order"
      description={
        <>
          <span className="font-mono">{pair}</span> · {type === "limit" ? "Limit" : "Midpoint"}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Side + pair header */}
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/40 p-3">
          <div className="flex items-center gap-3">
            <Badge variant={side === "buy" ? "success" : "destructive"}>
              {side === "buy" ? (
                <Icon.Buy size={12} aria-hidden />
              ) : (
                <Icon.Sell size={12} aria-hidden />
              )}
              {side === "buy" ? "Buy" : "Sell"} {base}
            </Badge>
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              vs {quote}
            </span>
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            {type === "limit" ? "Limit" : "Midpoint"}
          </span>
        </div>

        {/* Midpoint warning */}
        {type === "midpoint" ? (
          <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
            <Icon.Info
              size={14}
              aria-hidden
              className="mt-0.5 shrink-0 text-[var(--foreground)]"
            />
            <span>
              Midpoint orders match against the live midpoint at batch seal.
              Final fill price may differ slightly from the indicative quote.
            </span>
          </div>
        ) : null}

        {/* Order details */}
        <dl className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-xs">
          <Row label="Amount" value={`${amount} ${base}`} />
          {type === "limit" && price ? (
            <Row label="Price" value={`${price} ${quote}`} />
          ) : null}
          <Row label="Estimated receive" value={`${estReceive} ${quote}`} />
          <Row label="Network fee" value={feeUsd} />
        </dl>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
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
