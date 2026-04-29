// @ts-nocheck
// Sophie Dubois — surgical polish on the OrderForm card. Adds an italic editorial venue plate, demotes Buy/Sell colour to a confirmation-only register, removes per-input shadow envelopes that read as Vercel-template, and restores Source Serif 4 italic as the host voice on /trade.
"use client";

/**
 * OrderForm — Persona-10 redesign of the Market + Limit order entry surface.
 *
 * What changed (vs. the shipped `app/components/trade/order-form.tsx`):
 *
 *  1. Adds a "venue plate" header inside the card: a 10px mono eyebrow
 *     (`OMEGA · /TRADE`) and a Source Serif 4 italic lede
 *     (`Match at midpoint. Settle on chain.`). The italic was previously
 *     used only on /portfolio; the brand brief calls for italic-display on
 *     every editorial moment, not one cameo. (visual-identity.md, ADR-001.)
 *
 *  2. Buy / Sell at rest is monochrome — both pills carry only an arrow glyph
 *     and a thin border. Tone (success / destructive) appears on the *active*
 *     pill only and on the submit CTA. The intent control no longer
 *     telegraphs DEX-energy. The confirmation modal is where colour earns
 *     its place. (Anti-ref: Binance / OKX coloured intent rows.)
 *
 *  3. Removes the soft-shadow envelope from inputs and percentage shortcuts.
 *     Hairline borders only, per visual-identity.md "Surface treatment —
 *     where it does NOT go: inputs at rest, tables, list rows."
 *
 *  4. Replaces the three-column "Type · Fee · Est. receive" tile-strip with
 *     a single hairline rule and three label/value pairs set on a 12-column
 *     baseline. Same data, less chrome.
 *
 *  5. The privacy notice is moved *above* the CTA and set in italic
 *     Source Serif at 13px. It now reads as the thesis, not the footnote.
 *     ("Orders match privately at midpoint." — messaging.md canon copy.)
 *
 *  6. The pair badge inside the venue plate is removed (the PairSwitcher
 *     above the form already carries it; we don't repeat it).
 *
 * What did not change:
 *  - Form-state model, submit payload shape, prop signature.
 *  - Tab semantics (Market / Limit) and the limit-price input's behaviour.
 *  - Skeleton + error tile + disabled rules.
 *  - Token names: --foreground, --muted-foreground, --border, --card,
 *    --success, --destructive, --radius-md, --radius-xl. All resolved from
 *    the existing _generated/tokens.css.
 *
 * The only visual register added is the Source Serif 4 italic, which is
 * already loaded by app/layout.tsx via next/font/google. No new token, no
 * new dependency, no new asset.
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
    loading ||
    !!errorMessage ||
    numericAmount <= 0 ||
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

  const ledeFor = (m: OrderMode): string =>
    m === "market"
      ? "Match at midpoint. Settle on chain."
      : "Set the price. The book matches at or above.";

  return (
    <form
      onSubmit={handleSubmit}
      // No surface-soft on the form card. The card is a venue, not a
      // popover. Hairline border + restrained padding only. (visual-
      // identity.md "Surface treatment — where it does NOT go".)
      className="flex flex-col gap-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6"
      aria-label="Order entry"
    >
      {/* Venue plate. Eyebrow + italic lede. The brand speaks before the
          form asks. */}
      <header className="flex flex-col gap-1.5 pb-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Omega · /trade
        </span>
        <p
          className="text-[20px] leading-[1.35] text-[var(--foreground)]"
          style={{
            fontFamily:
              "var(--font-source-serif-4), 'Source Serif 4', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
          }}
        >
          {ledeFor(mode)}
        </p>
      </header>

      {/* A single hairline separates the editorial register from the
          functional register. Same gesture museum identities use to
          separate exhibition title from caption block. */}
      <div className="-mx-6 h-px bg-[var(--border)]" aria-hidden />

      {/* Tabs: Market / Limit — kept, but the visual weight is reduced
          so the venue plate dominates. */}
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

      {/* Buy / Sell — monochrome at rest, tone only on the active pill. */}
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

      {/* Limit price (limit only) — accent-strong removed. The label is
          plain mono caption like every other label. The "Use midpoint"
          action stays but loses the cyan emphasis. */}
      {mode === "limit" ? (
        <Animate variant="enter" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
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
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:underline disabled:opacity-50"
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
              className="h-12 pr-16 font-mono text-base tabular-nums"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {pair.quote}
            </span>
          </div>
        </Animate>
      ) : null}

      {/* Amount — the largest data field. Mono tabular at 24px with a
          quiet caption row above. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          <label htmlFor="amount">Amount</label>
          <span>
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
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {pair.base}
            </span>
          ) : null}
        </div>
      </div>

      {/* Percentage shortcuts. Border-only, no fill. */}
      <div className="grid grid-cols-4 gap-2">
        {PCT_SHORTCUTS.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePct(s.value)}
            disabled={loading}
            className="h-9 font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Single hairline above the summary block — replaces the three
          tile-cells. Three label/value pairs sit in a flat grid. */}
      <div className="-mx-6 h-px bg-[var(--border)]" aria-hidden />
      <dl className="grid grid-cols-3 gap-x-6 gap-y-1 px-0">
        <Pair label="Type" value={mode === "limit" ? "Limit" : "Market"} />
        <Pair label="Fee" value={fee} />
        <Pair
          label="Est. receive"
          value={estReceive ? `${estReceive} ${pair.quote}` : "—"}
          align="right"
        />
      </dl>

      {/* Privacy thesis — italic Source Serif 4, sits above the CTA so the
          register precedes the act. (messaging.md canon copy: "Orders
          match privately at midpoint.") */}
      <p
        className="text-[13px] leading-[1.45] text-[var(--muted-foreground)]"
        style={{
          fontFamily:
            "var(--font-source-serif-4), 'Source Serif 4', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 300,
        }}
      >
        Orders match privately at midpoint.
      </p>

      {/* Error tile or submit CTA. Submit CTA is the *only* place colour
          earns. Side determines tone. */}
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
            "h-12 w-full text-sm font-medium tracking-[0.01em]",
            side === "buy"
              ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
              : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
          )}
        >
          {side === "buy" ? "Buy" : "Sell"} {pair.base}
        </Button>
      )}
    </form>
  );
}

/* Buy / Sell pill. Resting state is monochrome — only an arrow glyph and
   a hairline border. Active state introduces tone (success / destructive)
   at low saturation: 10% tint background, 35% tint border, full-tone text. */
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
          ? ""
          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
      style={
        active
          ? {
              backgroundColor: `color-mix(in oklab, ${tone} 10%, transparent)`,
              borderColor: `color-mix(in oklab, ${tone} 35%, transparent)`,
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

/* Flat label/value pair — replaces the bordered tile-cell. Three of these
   sit on a single row beneath the hairline. */
function Pair({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        align === "right" ? "items-end text-right" : "items-start",
      )}
    >
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className="font-mono text-xs tabular-nums text-[var(--foreground)]">
        {value}
      </dd>
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
