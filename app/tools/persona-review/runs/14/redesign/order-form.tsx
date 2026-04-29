// @ts-nocheck
// Surgical polish on the OrderForm: drop the soft-shadow envelope, demote the side toggle from tinted to neutral, kill the duplicate Type/Fee/Est strip (ExecutionContextStrip below the form already carries it), retire the under-CTA padlock caption (state belongs in page chrome once, not under every button), and re-air the spacing rhythm — Hana Mori, Persona 14.

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

  // Hana: the form sits on a dot-grid page, on a soft-shadowed card, with a
  // tinted CTA. That's three envelopes for one piece of content. I'm dropping
  // the .surface-soft shadow + card fill; the page provides containment, and
  // a single hairline divider organises the form. One envelope.
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-7 px-1"
      aria-label="Order entry"
    >
      {/* Mode + Side, paired as one decision row.
          Hana: previously two stacked controls; here one row with a hairline
          divider between mode and side. Less SaaS, more editorial spread. */}
      <div className="flex flex-col gap-5">
        <Tabs
          value={mode}
          onValueChange={(v) => onModeChange(v as OrderMode)}
          className="w-full"
        >
          <TabsList className="grid h-9 w-full grid-cols-2 bg-transparent p-0 border-b border-[var(--border)] rounded-none">
            <TabsTrigger
              value="market"
              className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[var(--foreground)] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              Market
            </TabsTrigger>
            <TabsTrigger
              value="limit"
              className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[var(--foreground)] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              Limit
            </TabsTrigger>
          </TabsList>
          <TabsContent value="market" className="mt-0" />
          <TabsContent value="limit" className="mt-0" />
        </Tabs>

        {/* Side — neutral. Hana: the CTA carries the colour later. The
            segmented should be silent here. Active state is foreground +
            hairline; inactive is muted. No green tint, no red tint. */}
        <div
          role="radiogroup"
          aria-label="Side"
          className="grid grid-cols-2 gap-0 border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden"
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
      </div>

      {/* Limit price (limit only). Hana: keep the cyan label cue but only on
          the label itself; the input is neutral mono. */}
      {mode === "limit" ? (
        <Animate variant="enter" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="limit-price"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
            >
              Limit price
            </label>
            <button
              type="button"
              onClick={() => setPrice(midpoint)}
              disabled={!midpoint}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] disabled:opacity-50"
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
              className="h-12 pr-16 font-mono text-base tabular-nums bg-transparent border-x-0 border-t-0 border-b border-[var(--border)] rounded-none focus-visible:ring-0 focus-visible:border-[var(--foreground)] px-0"
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {pair.quote}
            </span>
          </div>
        </Animate>
      ) : null}

      {/* Amount input. Hana: hairline-bottom-only, no border-box. Bigger
          number, smaller token chip. The number is the subject. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="amount"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          >
            Amount
          </label>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Available {MOCK_AVAILABLE} {pair.base}
          </span>
        </div>
        <div className="relative">
          {loading ? (
            <Skeleton className="h-14 w-full rounded-none" />
          ) : (
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              className="h-14 pr-20 font-mono text-3xl tabular-nums bg-transparent border-x-0 border-t-0 border-b border-[var(--border)] rounded-none focus-visible:ring-0 focus-visible:border-[var(--foreground)] px-0"
            />
          )}
          {!loading ? (
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {pair.base}
            </span>
          ) : null}
        </div>
      </div>

      {/* Percentage shortcuts. Hana: tracked uppercase mono, hairline only,
          no fill, no soft envelope. The Row's site uses link-weight type for
          this kind of utility row, not button chrome. */}
      <div className="grid grid-cols-4 gap-0 border-y border-[var(--border)]">
        {PCT_SHORTCUTS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => handlePct(s.value)}
            disabled={loading}
            className={cn(
              "h-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] disabled:opacity-50",
              i > 0 && "border-l border-[var(--border)]",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* You receive — single row, no enclosed box. Hana: a hairline-top
          divider plus mono baseline; this used to be a panel inside a panel. */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          You receive
        </span>
        <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
          {estReceive ? `${estReceive} ${pair.quote}` : "—"}
        </span>
      </div>

      {/* Hana removed: the inner three-cell DetailCell strip (Type · Fee ·
          Est. receive). The ExecutionContextStrip already carries this below
          the form. Stating it twice in 80px is the loudest move on the page. */}

      {/* Error tile or submit CTA. Hana: keep the colour here, but no longer
          on the segmented above. The CTA owns the accent; nothing else. */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 border-l-2 border-[var(--destructive)] pl-3 py-2 text-xs leading-relaxed text-[var(--destructive)]"
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
            "h-12 w-full text-sm font-medium rounded-[var(--radius-md)]",
            side === "buy"
              ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
              : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
          )}
        >
          {side === "buy" ? "Buy" : "Sell"} {pair.base}
        </Button>
      )}

      {/* Hana removed: the under-CTA padlock caption. The fact that orders
          match privately at midpoint belongs in page chrome once, set as a
          tracked-uppercase whisper at the foot of the page — not under
          every button. The Row doesn't restate its policy after every CTA. */}
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
  const Glyph = isBuy ? Icon.Buy : Icon.Sell;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center gap-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        // Hana: neutral active state. The eye finds the active side via
        // weight + fill contrast, not via emerald/red tint. Colour is reserved
        // for the CTA. Muuto's catalogue rule: colour is climate, not emphasis.
        active
          ? "bg-[var(--foreground)] text-[var(--background)]"
          : "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        // Hairline divider between the two cells.
        !isBuy && "border-l border-[var(--border)]",
      )}
    >
      <Glyph size={13} aria-hidden />
      <span>{isBuy ? "Buy" : "Sell"}</span>
    </button>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse bg-[var(--muted)] motion-reduce:animate-none",
        className,
      )}
    />
  );
}
