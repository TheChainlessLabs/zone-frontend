"use client";

/**
 * OrderForm — the design-kit Market + Limit order-entry surface.
 *
 * Ported from the kit's `OrderForm.jsx`: a calm, sectioned, single resting
 * `.panel`. Side-locked tone (Buy = success, Sell = destructive) runs through
 * the side toggle, the input rings, and the submit CTA. The context strip's
 * Midpoint / Est. received cells roll via NumberTicker so the live data has a
 * pulse. Layout, top-to-bottom:
 *
 *   • Buy / Sell segmented toggle (side-locked tint)
 *   • Limit price input (Limit mode only; "Use midpoint M" chip)
 *   • Amount input (large mono tabular) with the available balance inline above
 *   • Percentage shortcuts (25 / 50 / 75 / MAX)
 *   • Context strip: Midpoint · Est. received · Fee
 *   • Submit CTA (`Buy OALPHA` / `Sell OALPHA`) with an ↵ badge
 *
 * Wiring the app keeps (behaviour, not look): the EIP-712 submit flow runs
 * through `onSubmit` and the OrderConfirmationModal; ticket-pad keyboard
 * hotkeys (B = Buy, S = Sell, M = use midpoint, Enter = submit, Esc = clear)
 * stay live as invisible muscle-memory affordances; loading renders a skeleton
 * amount field; an error tile replaces the CTA when `errorMessage` is set.
 *
 * Voice: omega-docs/03-brand/messaging.md — terse, period-terminated, no
 * exclamations, no "approve" (use "Sign").
 */

import * as React from "react";

import { OrderConfirmationModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Animate } from "@/components/ui/animate";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";
import type { Side } from "@/lib/fixtures/types";

import { NumberTicker } from "./motion";

export type OrderMode = "market" | "limit";

export interface OrderFormSubmitPayload {
  mode: OrderMode;
  side: Side;
  amount: string;
  price?: string;
}

export interface OrderFormProps {
  pair: LaunchPair;
  mode: OrderMode;
  onModeChange: (mode: OrderMode) => void;
  /** Live midpoint as a decimal string. Empty = unknown (em-dash). */
  midpoint: string;
  /** Live available trading balance in the base token, formatted. */
  available?: string;
  /** Side-aware wallet balances: buy spends quote, sell spends base. */
  availableBySide?: Partial<Record<Side, string>>;
  fee?: string;
  /** When true, the form renders skeleton placeholders. */
  loading?: boolean;
  /** When set, the form renders an inline error tile in place of the CTA. */
  errorMessage?: string;
  onSubmit?: (payload: OrderFormSubmitPayload) => void | Promise<void>;
}

const PCT_SHORTCUTS: Array<{ label: string; value: number }> = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "MAX", value: 1 },
];

/** Tabular grouping for the summary row — `10000.00` -> `10,000.00`. */
function formatGroup(value: string): string {
  const [whole, frac] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

export function OrderForm({
  pair,
  mode,
  onModeChange: _onModeChange,
  midpoint,
  available = "0.00",
  availableBySide,
  fee = "0.005%",
  loading = false,
  errorMessage,
  onSubmit,
}: OrderFormProps) {
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>(midpoint || "");
  const [pendingOrder, setPendingOrder] =
    React.useState<OrderFormSubmitPayload | null>(null);
  const [confirmationState, setConfirmationState] =
    React.useState<"idle" | "signing" | "submitting" | "failed">("idle");
  const [submissionError, setSubmissionError] = React.useState<string>();

  // Sync the limit-price input default whenever the midpoint or mode shifts —
  // the user can still override. Empty midpoint stays empty.
  React.useEffect(() => {
    if (mode === "limit" && !price && midpoint) {
      setPrice(midpoint);
    }
  }, [mode, midpoint, price]);

  const numericAmount = parseFloat(amount || "0");
  const numericPrice = parseFloat(
    (mode === "limit" ? price : midpoint) || "0",
  );
  const activeAvailable = availableBySide?.[side] ?? available;
  const activeAvailableToken = side === "buy" ? pair.quote : pair.base;
  const estReceive =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericPrice) &&
    numericAmount > 0 &&
    numericPrice > 0
      ? side === "buy"
        ? numericAmount.toFixed(2)
        : (numericAmount * numericPrice).toFixed(2)
      : "";
  const estReceiveToken = side === "buy" ? pair.base : pair.quote;

  const submitDisabled =
    loading ||
    !!errorMessage ||
    numericAmount <= 0 ||
    (mode === "limit" && numericPrice <= 0);

  const handlePct = (factor: number) => {
    const balance = parseFloat(activeAvailable.replace(/,/g, ""));
    const maxBase =
      side === "buy" && numericPrice > 0 ? balance / numericPrice : balance;
    const next = (maxBase * factor).toFixed(2);
    setAmount(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;
    setPendingOrder({
      mode,
      side,
      amount,
      price: mode === "limit" ? price : undefined,
    });
  };

  const handleConfirm = async () => {
    if (!pendingOrder) return;
    setSubmissionError(undefined);
    setConfirmationState("signing");
    try {
      const result = onSubmit?.(pendingOrder);
      if (result && typeof result === "object" && "then" in result) {
        setConfirmationState("submitting");
        await result;
      }
      setPendingOrder(null);
      setAmount("");
      setConfirmationState("idle");
      if (pendingOrder.mode === "limit") {
        setPrice(midpoint || "");
      }
    } catch (error) {
      setConfirmationState("failed");
      setSubmissionError(getErrorMessage(error));
    }
  };

  const handleCancel = () => {
    if (confirmationState === "signing" || confirmationState === "submitting") {
      return;
    }
    setPendingOrder(null);
    setConfirmationState("idle");
    setSubmissionError(undefined);
  };

  // Ticket-pad keyboard hotkeys (TWS / Bloomberg muscle memory) — the app
  // keeps these as invisible behaviour. Skip when typing in an input; Esc
  // clears amount from anywhere.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const isTextField =
      target.tagName === "INPUT" || target.tagName === "TEXTAREA";

    if (!isTextField) {
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        setSide("buy");
        return;
      }
      if (k === "s") {
        e.preventDefault();
        setSide("sell");
        return;
      }
      if (k === "m" && mode === "limit" && midpoint) {
        e.preventDefault();
        setPrice(midpoint);
        return;
      }
    }

    if (e.key === "Escape" && !loading) {
      setAmount("");
    }
  };

  // Side-locked tone — drives the segmented toggle, the input rings, and the
  // CTA background.
  const sideTone = side === "buy" ? "var(--success)" : "var(--destructive)";
  const ctaLabel = `${side === "buy" ? "Buy" : "Sell"} ${pair.base}`;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="panel flex flex-col gap-[18px] rounded-[var(--radius-xl)] p-5"
        aria-label="Order entry"
      >
        {/* Buy / Sell segmented toggle. */}
        <div role="radiogroup" aria-label="Side" className="grid grid-cols-2 gap-2">
          <SideButton
            side="buy"
            active={side === "buy"}
            onClick={() => setSide("buy")}
            disabled={loading}
          />
          <SideButton
            side="sell"
            active={side === "sell"}
            onClick={() => setSide("sell")}
            disabled={loading}
          />
        </div>

        {/* Limit price (limit only) — side-locked ring + border tint, with a
            "Use midpoint M" chip. */}
        {mode === "limit" ? (
          <Animate variant="enter" className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="limit-price"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
              >
                Limit price
              </label>
              <button
                type="button"
                onClick={() => setPrice(midpoint)}
                disabled={!midpoint}
                className={cn(
                  "inline-flex h-6 items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-2",
                  "font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]",
                  "transition-colors hover:text-[var(--foreground)] hover:border-[var(--foreground)]",
                  "disabled:opacity-50",
                )}
                aria-keyshortcuts="M"
                title="Set limit price to current midpoint (M)"
              >
                Use midpoint
                <span className="ml-2 font-mono text-[10px] opacity-60">M</span>
              </button>
            </div>
            <div className="relative">
              <Input
                id="limit-price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={midpoint || "0.0000"}
                disabled={loading}
                className={cn(
                  "h-12 pr-16 font-mono text-base tabular-nums",
                  "focus-visible:ring-1",
                )}
                style={{
                  ["--tw-ring-color" as string]: sideTone,
                  borderColor: `color-mix(in oklab, ${sideTone} 28%, var(--border))`,
                }}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {pair.quote}
              </span>
            </div>
          </Animate>
        ) : null}

        {/* Amount input — primary cell, side-locked focus ring. The available
            balance sits inline above the field (kit position). */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="amount"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
            >
              Amount
            </label>
            <span
              data-testid="available-balance"
              className="font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]"
            >
              {loading
                ? "—"
                : `${formatGroup(activeAvailable)} ${activeAvailableToken}`}
            </span>
          </div>
          <div className="relative">
            {loading ? (
              <Skeleton className="h-14 w-full rounded-[var(--radius-md)]" />
            ) : (
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                className="h-14 pr-20 font-mono text-2xl tabular-nums focus-visible:ring-1"
                style={{
                  ["--tw-ring-color" as string]: sideTone,
                  borderColor: `color-mix(in oklab, ${sideTone} 28%, var(--border))`,
                }}
              />
            )}
            {!loading ? (
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {pair.base}
              </span>
            ) : null}
          </div>
        </div>

        {/* Percentage shortcuts */}
        <div className="grid grid-cols-4 gap-2">
          {PCT_SHORTCUTS.map((s) => (
            <Button
              key={s.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePct(s.value)}
              disabled={loading}
              className="h-9 font-mono text-[11px] uppercase tracking-[0.14em]"
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* Context strip — Midpoint · Est. received · Fee. The first two roll
            via NumberTicker so live data has a pulse. */}
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
          <ContextCell
            label="Midpoint"
            value={
              loading || !midpoint ? (
                "—"
              ) : (
                <NumberTicker value={midpoint} className="font-mono text-sm" />
              )
            }
          />
          <ContextCell
            label="Est. received"
            value={
              loading ? (
                "—"
              ) : estReceive ? (
                <span className="inline-flex items-baseline gap-1.5">
                  <NumberTicker
                    value={formatGroup(estReceive)}
                    className="font-mono text-sm"
                  />
                  <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted-foreground)]">
                    {estReceiveToken}
                  </span>
                </span>
              ) : (
                "—"
              )
            }
          />
          <ContextCell label="Fee" value={fee} />
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs leading-relaxed text-[var(--destructive)]"
          >
            <Icon.Failed size={14} aria-hidden className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <Button
            type="submit"
            disabled={submitDisabled}
            className={cn(
              "h-12 w-full px-3 text-[13px] font-medium tabular-nums",
              side === "buy"
                ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
                : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
            )}
            title="Press Enter to submit"
          >
            <span className="truncate font-mono">{ctaLabel}</span>
            <span className="ml-2 inline-flex h-5 items-center rounded-[var(--radius-sm)] border border-current/30 px-1.5 font-mono text-[10px] uppercase tracking-[0.14em] opacity-80">
              ↵
            </span>
          </Button>
        )}
      </form>

      {pendingOrder ? (
        <OrderConfirmationModal
          open
          onClose={handleCancel}
          state={confirmationState}
          side={pendingOrder.side}
          pair={`${pair.base}/${pair.quote}`}
          mode={pendingOrder.mode}
          amount={formatGroup(Number.parseFloat(pendingOrder.amount).toFixed(2))}
          price={pendingOrder.price}
          midpoint={midpoint}
          fee={fee}
          available={formatGroup(activeAvailable)}
          availableToken={activeAvailableToken}
          errorMessage={submissionError}
          onConfirm={handleConfirm}
          onRetry={handleConfirm}
        />
      ) : null}
    </>
  );
}

// ----------------------------------------------------------------------------
// SideButton — the kit's segmented Buy/Sell toggle (no hotkey badge; the
// hotkeys stay live as invisible affordances at the form level).
// ----------------------------------------------------------------------------

function SideButton({
  side,
  active,
  onClick,
  disabled,
}: {
  side: Side;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isBuy = side === "buy";
  const tone = isBuy ? "var(--success)" : "var(--destructive)";
  const Glyph = isBuy ? Icon.Buy : Icon.Sell;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-keyshortcuts={isBuy ? "B" : "S"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "press-down flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        active
          ? "text-[var(--foreground)]"
          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
      style={
        active
          ? {
              backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
              borderColor: `color-mix(in oklab, ${tone} 40%, transparent)`,
              color: tone,
            }
          : undefined
      }
    >
      <Glyph size={14} aria-hidden />
      <span>{isBuy ? "Buy" : "Sell"}</span>
    </button>
  );
}

function ContextCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 bg-[color-mix(in_oklab,var(--muted)_55%,var(--card))] px-3 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse rounded-[var(--radius-md)] bg-[var(--muted)] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Order failed.";
}
