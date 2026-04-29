// @ts-nocheck
// Daniel Cho — surgical pass on components/trade/order-form.tsx.
// Changes vs. design-V2 head:
//   1. New top-line ExecSummaryRow at the head of the ticket — side · pair · midpoint · available — one mono row, large enough to read at desk distance.
//   2. Available balance promoted out of the 10px label tracker into the summary row.
//   3. Limit-price cell border + ring colour-locked to the active side (success on Buy, destructive on Sell). Cyan label tint dropped — accent moves onto the value when the user is editing.
//   4. `Use midpoint` promoted from a 10px text shortcut to a real chip-sized button.
//   5. Submit CTA now carries the literal order summary the user is signing: `Submit · Buy 1,000 USDC at 0.9213 EURC`. No more `Buy USDC`.
//   6. Removed the in-form Type/Fee/Est-receive strip — duplicates the ExecutionContextStrip the page already renders below the form. Single home for that data.
//   7. Keyboard hotkeys wired at form level: B = Buy, S = Sell, M = use midpoint, Enter = submit (when focused inside form), Esc = clear amount. Matches TWS / Bloomberg ticket-pad conventions.
//
// All semantics preserved — same OrderFormProps, same OrderFormSubmitPayload, same Tabs/Animate/Icon imports. This file is drop-in replaceable for the production component.

"use client";

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
  midpoint: string;
  loading?: boolean;
  errorMessage?: string;
  onSubmit?: (payload: OrderFormSubmitPayload) => void;
}

const PCT_SHORTCUTS: Array<{ label: string; value: number }> = [
  { label: "25", value: 0.25 },
  { label: "50", value: 0.5 },
  { label: "75", value: 0.75 },
  { label: "MAX", value: 1 },
];

const MOCK_AVAILABLE = "10000.00";

function formatGroup(value: string): string {
  // Tabular grouping for the summary row — `10000.00` -> `10,000.00`.
  const [whole, frac] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

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

  // Keyboard hotkeys at form level. Match TWS / Bloomberg ticket-pad muscle memory.
  // Skip when the user is typing in a text input — only trigger from form-level keydowns
  // outside the inputs, or via accelerator keys that don't conflict with text entry.
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

  // Side-locked tone — drives both the segmented toggle and the price-cell ring.
  const sideTone = side === "buy" ? "var(--success)" : "var(--destructive)";

  // CTA label — explicit order summary the user is signing.
  const ctaLabel = (() => {
    if (numericAmount <= 0) {
      return `${side === "buy" ? "Buy" : "Sell"} ${pair.base}`;
    }
    const sizeStr = formatGroup(numericAmount.toFixed(2));
    const priceStr =
      mode === "limit" && price
        ? price
        : midpoint || "—";
    const verb = side === "buy" ? "Buy" : "Sell";
    return `Submit · ${verb} ${sizeStr} ${pair.base} at ${priceStr} ${pair.quote}`;
  })();

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
      aria-label="Order entry"
    >
      {/* Top-line execution summary — Bloomberg/EMSX-style ticket head.
          Side · Pair · Midpoint · Available, all on one row, mono tabular. */}
      <ExecSummaryRow
        side={side}
        pair={pair}
        midpoint={midpoint}
        available={MOCK_AVAILABLE}
        loading={loading}
      />

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

      {/* Buy / Sell segmented toggle — same shape, hotkeys announced inline */}
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
          hotkey="B"
        />
        <SideButton
          side="sell"
          active={side === "sell"}
          onClick={() => setSide("sell")}
          disabled={loading}
          hotkey="S"
        />
      </div>

      {/* Limit price (limit only) — side-locked ring, midpoint chip on the right */}
      {mode === "limit" ? (
        <Animate variant="enter" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="limit-price"
              className="text-xs font-medium text-[var(--muted-foreground)]"
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
              <span className="ml-2 font-mono text-[9px] opacity-60">M</span>
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
                borderColor: `color-mix(in oklab, ${sideTone} 30%, var(--border))`,
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {pair.quote}
            </span>
          </div>
        </Animate>
      ) : null}

      {/* Amount input — primary cell, side-locked focus ring */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="amount"
          className="text-xs font-medium text-[var(--muted-foreground)]"
        >
          Amount
        </label>
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
                borderColor: `color-mix(in oklab, ${sideTone} 30%, var(--border))`,
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

      {/* You receive — same weight as the amount input value */}
      <div className="flex items-baseline justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          You receive
        </span>
        <span className="font-mono text-lg tabular-nums text-[var(--foreground)]">
          {estReceive ? `${formatGroup(estReceive)} ${pair.quote}` : "—"}
        </span>
      </div>

      {/* NOTE: Removed the in-form Type/Fee/Est-receive strip.
          That data lives in <ExecutionContextStrip /> below the form on the page.
          One home for execution metadata. */}

      {/* Error tile or submit CTA — CTA carries the explicit order summary */}
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
            "h-12 w-full px-3 text-[13px] font-medium tabular-nums",
            side === "buy"
              ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
              : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
          )}
          title="Press Enter to submit"
        >
          <span className="truncate font-mono">{ctaLabel}</span>
          <span className="ml-2 inline-flex h-5 items-center rounded-[var(--radius-sm)] border border-current/30 px-1.5 font-mono text-[9px] uppercase tracking-[0.14em] opacity-80">
            ↵
          </span>
        </Button>
      )}

      {/* Privacy notice + fee disclosure — fee restated here only because it
          is the single number the user must accept at submit time. */}
      <div className="flex items-center justify-between text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <Icon.Private size={11} aria-hidden />
          Orders match privately at midpoint.
        </span>
        <span className="font-mono uppercase tracking-[0.14em]">
          Fee {fee}
        </span>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------------
// ExecSummaryRow — the new top-line ticket-head row.
// Reads in one glance: side · pair · midpoint · available.
// Borrowed from Bloomberg EMSX ticket-pad layout.
// ----------------------------------------------------------------------------

function ExecSummaryRow({
  side,
  pair,
  midpoint,
  available,
  loading,
}: {
  side: Side;
  pair: LaunchPair;
  midpoint: string;
  available: string;
  loading: boolean;
}) {
  const sideTone = side === "buy" ? "var(--success)" : "var(--destructive)";
  const sideLabel = side === "buy" ? "BUY" : "SELL";

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5"
      aria-label="Order summary"
    >
      <span
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: sideTone }}
      >
        {sideLabel}
      </span>
      <span className="flex items-baseline gap-2 overflow-hidden">
        <span className="truncate font-mono text-sm font-medium tabular-nums text-[var(--foreground)]">
          {pair.base}/{pair.quote}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          mid
        </span>
        <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
          {loading || !midpoint ? "—" : midpoint}
        </span>
      </span>
      <span className="flex flex-col items-end leading-tight">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Available
        </span>
        <span className="font-mono text-xs tabular-nums text-[var(--foreground)]">
          {loading ? "—" : `${formatGroup(available)} ${pair.base}`}
        </span>
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SideButton — same shape as before, with an inline hotkey badge so the
// keyboard affordance is discoverable.
// ----------------------------------------------------------------------------

function SideButton({
  side,
  active,
  onClick,
  disabled,
  hotkey,
}: {
  side: Side;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  hotkey: string;
}) {
  const isBuy = side === "buy";
  const tone = isBuy ? "var(--success)" : "var(--destructive)";
  const Glyph = isBuy ? Icon.Buy : Icon.Sell;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-keyshortcuts={hotkey}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors",
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
      <span
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.14em]",
          active ? "opacity-70" : "opacity-40",
        )}
        aria-hidden
      >
        {hotkey}
      </span>
    </button>
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
