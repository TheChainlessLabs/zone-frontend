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
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onConfirm,
  onRetry,
}: OrderConfirmationModalProps) {
  const isBusy = state === "signing" || state === "submitting";
  const [base, quote] = pair.split("/");
  const verb = side === "buy" ? "Buy" : "Sell";
  const executionPrice = mode === "limit" ? price : midpoint;
  const summary = [
    "You sign",
    `${verb} ${amount} ${base}${executionPrice ? ` at ${executionPrice} ${quote}` : ""}`,
    `Fee ${fee}`,
    "Settles in next batch",
    mode === "market"
      ? "Matches privately at midpoint"
      : "Matches privately",
  ].join(" · ");

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Review order"
      description={
        <>
          <span className="font-mono">{pair}</span> · {mode === "limit" ? "Limit" : "Market"}
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
            {mode === "limit" ? "Limit" : "Market"}
          </span>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 p-4">
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            {summary}
          </p>
        </div>

        <dl className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-xs">
          <Row label="Amount" value={`${amount} ${base}`} />
          {mode === "limit" && price ? (
            <Row label="Price" value={`${price} ${quote}`} />
          ) : null}
          {mode === "market" && midpoint ? (
            <Row label="Indicative midpoint" value={`${midpoint} ${quote}`} />
          ) : null}
          <Row label="Fee" value={fee} />
          <Row
            label="Settlement"
            value={mode === "market" ? "Next batch · private midpoint match" : "Next batch · private match"}
          />
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
