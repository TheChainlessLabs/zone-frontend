"use client";

/**
 * OrderForm — Market + Limit order entry surface.
 *
 * Composition:
 *   • Tabs: Market / Limit (controlled)
 *   • Buy / Sell segmented toggle (success-tinted Buy, destructive-tinted Sell)
 *   • Limit price input (Limit mode only; cyan precision-strong accent)
 *   • Amount input (large mono tabular)
 *   • Percentage shortcuts (25 / 50 / 75 / MAX)
 *   • "You receive" estimate row
 *   • Order details strip (Type · Fee · Est. receive)
 *   • Submit CTA (success bg for Buy, destructive bg for Sell)
 *   • Privacy notice (Orders match privately at midpoint.)
 *
 * Voice: omega-docs/03-brand/messaging.md — terse, period-terminated, no
 * exclamations, no "approve" (use "Sign").
 *
 * State: form state is local (useState). Submit fires `onSubmit({...})`,
 * which the page wires to OrderConfirmationModal.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Animate } from "@/components/ui/animate";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";
import type { Side } from "@/lib/fixtures/types";

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
  /** When true, the form renders skeleton placeholders. */
  loading?: boolean;
  /** When set, the form renders an inline error tile in place of the CTA. */
  errorMessage?: string;
  onSubmit?: (payload: OrderFormSubmitPayload) => void;
}

const PCT_SHORTCUTS: Array<{ label: string; value: number }> = [
  { label: "25", value: 0.25 },
  { label: "50", value: 0.5 },
  { label: "75", value: 0.75 },
  { label: "MAX", value: 1 },
];

/** Mock available balance (BASE) per pair — stable so review shots don't flap. */
const MOCK_AVAILABLE = "10000.00";

export function OrderForm({
  pair,
  mode,
  onModeChange,
  midpoint,
  loading = false,
  errorMessage,
  onSubmit,
}: OrderFormProps) {
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>(midpoint || "");

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
  const estReceive =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericPrice) &&
    numericAmount > 0 &&
    numericPrice > 0
      ? (numericAmount * numericPrice).toFixed(2)
      : "";

  const fee = "0.005%";
  const submitDisabled =
    loading || !!errorMessage || numericAmount <= 0 ||
    (mode === "limit" && numericPrice <= 0);

  const handlePct = (factor: number) => {
    const base = parseFloat(MOCK_AVAILABLE);
    const next = (base * factor).toFixed(2);
    setAmount(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;
    onSubmit?.({
      mode,
      side,
      amount,
      price: mode === "limit" ? price : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
      aria-label="Order entry"
    >
      {/* Tabs: Market / Limit */}
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as OrderMode)}
        className="w-full"
      >
        <TabsList className="grid h-9 w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-0" />
        <TabsContent value="limit" className="mt-0" />
      </Tabs>

      {/* Buy / Sell segmented toggle */}
      <div
        role="radiogroup"
        aria-label="Side"
        className="grid grid-cols-2 gap-2"
      >
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

      {/* Limit price (limit only) */}
      {mode === "limit" ? (
        <Animate variant="enter" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="limit-price"
              className="text-xs font-medium"
              style={{ color: "var(--accent-strong, #22d3ee)" }}
            >
              Limit price
            </label>
            <button
              type="button"
              onClick={() => setPrice(midpoint)}
              disabled={!midpoint}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] disabled:opacity-50"
            >
              Use midpoint
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
                ["--tw-ring-color" as string]: "var(--accent-strong, #22d3ee)",
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {pair.quote}
            </span>
          </div>
        </Animate>
      ) : null}

      {/* Amount input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
          <label htmlFor="amount">Amount</label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
            Available {MOCK_AVAILABLE} {pair.base}
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
              className="h-14 pr-20 font-mono text-2xl tabular-nums"
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

      {/* You receive */}
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2.5">
        <span className="text-xs text-[var(--muted-foreground)]">
          You receive
        </span>
        <span className="font-mono text-sm tabular-nums">
          {estReceive ? `${estReceive} ${pair.quote}` : "—"}
        </span>
      </div>

      {/* Order details strip — three columns */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
        <DetailCell label="Type" value={mode === "limit" ? "Limit" : "Market"} />
        <DetailCell label="Fee" value={fee} />
        <DetailCell
          label="Est. receive"
          value={estReceive ? `${estReceive} ${pair.quote}` : "—"}
        />
      </div>

      {/* Error tile or submit CTA */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs leading-relaxed text-[var(--destructive)]"
        >
          <Icon.Failed
            size={14}
            aria-hidden
            className="mt-0.5 shrink-0"
          />
          <span>{errorMessage}</span>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={submitDisabled}
          className={cn(
            "h-12 w-full text-sm font-medium",
            side === "buy"
              ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
              : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
          )}
        >
          {side === "buy" ? "Buy" : "Sell"} {pair.base}
        </Button>
      )}

      {/* Privacy notice */}
      <p className="flex items-center justify-center gap-1.5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        <Icon.Private size={11} aria-hidden />
        Orders match privately at midpoint.
      </p>
    </form>
  );
}

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
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
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

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-[var(--card)] px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums">{value}</span>
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
