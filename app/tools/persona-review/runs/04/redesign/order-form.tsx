// @ts-nocheck
// Surgical pass on OrderForm: contract-header restated above the action, UTC audit row, neutral primary CTA, available balance promoted to peer weight, decorative chips/donut/percent-shortcuts removed. Voice and field set unchanged.

"use client";

/**
 * OrderForm — Amira Haddad redesign (persona 04, attitude 2: surgical polish).
 *
 * Same component signature, same submit payload, same fields. What changes:
 *   1. Contract header row at the top — restates the trade in plain mono, the
 *      way Marquee, J.P. Morgan Markets, and a UBS execution dialog would.
 *      Ref: marquee.gs.com/welcome/our-platform/overview
 *   2. UTC audit row above the form — `As of 2026-04-27 09:00:14 UTC`. The
 *      trust anchor a CAT-compliant institutional reviewer expects to see.
 *      Ref: finra.org Consolidated Audit Trail.
 *   3. Buy / Sell as a labelled radio group, not two tinted pills. Active side
 *      colours the *price cell*, never the action button. Pump.fun tinted
 *      celebration CTAs are now a regulator-watched precedent — the action
 *      stays neutral.
 *   4. Available balance promoted to peer weight with the amount input.
 *   5. Percentage shortcuts (25/50/75/MAX) removed — treasury allocations are
 *      a fixed notional, not a fraction of wallet balance.
 *   6. Single contract strip below the form (Type / Fee / Settlement /
 *      Estimated receive). The duplicate ExecutionContextStrip in the page
 *      shell can be retired by the parent.
 *   7. Neutral primary CTA, full-contract label:
 *      `Sign · Buy 10,000 USDC at midpoint · Settle Ethereum L1`
 *      The button is the last legible chance to catch a wrong order.
 *   8. Privacy line kept verbatim. Decorative serif italic kept out — the serif
 *      is spent once on the wordmark, never on a section subhead.
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

/** Mock available balance (BASE) per pair — stable so review shots don't flap. */
const MOCK_AVAILABLE = "10000.00";

/** Settlement venue, surfaced inline. Static for v1. */
const SETTLEMENT_VENUE = "Ethereum L1";

const FEE = "0.005%";

/**
 * Compact UTC formatter — `2026-04-27 09:00:14 UTC`.
 * Stable for SSR; the real surface should source this from the gateway.
 */
function formatUtcStamp(d: Date): string {
  const iso = d.toISOString(); // 2026-04-27T09:00:14.123Z
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`;
}

function formatNotional(raw: string): string {
  const n = parseFloat(raw || "0");
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

  // Render-time UTC stamp. The production wire would read this from the
  // sequencer's `as_of` field, not the client clock.
  const [stamp] = React.useState(() => formatUtcStamp(new Date()));

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

  const submitDisabled =
    loading ||
    !!errorMessage ||
    numericAmount <= 0 ||
    (mode === "limit" && numericPrice <= 0);

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

  // --- Contract header text ----------------------------------------------------
  // Restated trade in plain mono. The reader's eye lands here first.
  const sideVerb = side === "buy" ? "Buy" : "Sell";
  const directionAsset = side === "buy" ? pair.base : pair.base; // BASE is the
  // token the user transacts; the receive side is the QUOTE. Kept explicit.
  const priceRef =
    mode === "limit"
      ? price && numericPrice > 0
        ? `${price} ${pair.quote}`
        : `— ${pair.quote}`
      : `mid ${midpoint || "—"} ${pair.quote}`;
  const notional = formatNotional(amount);
  const contractLine = `${pair.base}/${pair.quote} · ${sideVerb} ${directionAsset} · Notional ${notional} ${pair.base} · ${priceRef} · Settles ${SETTLEMENT_VENUE}`;

  // --- Full-contract CTA label ------------------------------------------------
  const ctaLabel = (() => {
    if (errorMessage) return "Resolve error to continue";
    if (numericAmount <= 0) return `Sign · ${sideVerb} ${pair.base}`;
    const at =
      mode === "limit" && numericPrice > 0
        ? `at ${price} ${pair.quote}`
        : `at midpoint`;
    return `Sign · ${sideVerb} ${notional} ${pair.base} ${at} · Settle ${SETTLEMENT_VENUE}`;
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5"
      aria-label="Order entry"
    >
      {/* Audit row — UTC stamp + sequencer reference, mono uppercase, top-right */}
      <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Order ticket
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] tabular-nums">
          {`As of ${stamp} · Sequencer #1`}
        </span>
      </div>

      {/* Contract header — the trade restated in plain mono, before any input */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Contract
        </span>
        <p className="font-mono text-sm leading-relaxed tabular-nums">
          {contractLine}
        </p>
      </div>

      {/* Tabs: Market / Limit — kept, but demoted to a small inline mode picker */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Mode
        </span>
        <Tabs
          value={mode}
          onValueChange={(v) => onModeChange(v as OrderMode)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="market" className="text-xs">
              Market
            </TabsTrigger>
            <TabsTrigger value="limit" className="text-xs">
              Limit
            </TabsTrigger>
          </TabsList>
          <TabsContent value="market" className="mt-0" />
          <TabsContent value="limit" className="mt-0" />
        </Tabs>
      </div>

      {/* Direction — labelled radio group, no tinted pills */}
      <fieldset
        className="flex flex-col gap-2"
        aria-label="Direction"
      >
        <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Direction
        </legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
          <DirectionOption
            label={`Buy ${pair.base}`}
            sublabel={`with ${pair.quote}`}
            active={side === "buy"}
            onClick={() => setSide("buy")}
            disabled={loading}
          />
          <DirectionOption
            label={`Sell ${pair.base}`}
            sublabel={`for ${pair.quote}`}
            active={side === "sell"}
            onClick={() => setSide("sell")}
            disabled={loading}
          />
        </div>
      </fieldset>

      {/* Limit price — side-coloured cell. Colour load lives here, not on CTA. */}
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
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:underline disabled:opacity-50"
            >
              Use midpoint {midpoint ? `(${midpoint})` : ""}
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
                // Side-coloured cell: subtle border tint, no fill.
                side === "buy"
                  ? "border-l-2 border-l-[var(--success)]"
                  : "border-l-2 border-l-[var(--destructive)]",
              )}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {pair.quote}
            </span>
          </div>
        </Animate>
      ) : null}

      {/* Notional — peer-weight available balance */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="amount"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          >
            Notional
          </label>
          <span className="font-mono text-xs tabular-nums text-[var(--foreground)]">
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

      {/* Single contract strip — Type · Fee · Settlement · Est. receive */}
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
        <DetailCell label="Type" value={mode === "limit" ? "Limit" : "Market"} />
        <DetailCell label="Fee" value={FEE} />
        <DetailCell label="Settles" value={SETTLEMENT_VENUE} />
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
          // Neutral primary action. No success-green or destructive-red on the
          // button — colour belongs on the price cell.
          className="h-12 w-full whitespace-normal px-4 text-sm font-medium leading-tight"
        >
          {ctaLabel}
        </Button>
      )}

      {/* Privacy line — kept verbatim, the only sentence that earns its place */}
      <p className="flex items-center justify-center gap-1.5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        <Icon.Private size={11} aria-hidden />
        Orders match privately at midpoint.
      </p>
    </form>
  );
}

/**
 * DirectionOption — labelled radio. Active state is communicated through a
 * left edge marker plus weight, not a tinted pill.
 */
function DirectionOption({
  label,
  sublabel,
  active,
  onClick,
  disabled,
}: {
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-start justify-center gap-0.5 px-3 py-3 text-left transition-colors disabled:pointer-events-none disabled:opacity-50",
        "bg-[var(--card)]",
        active
          ? "text-[var(--foreground)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
      style={
        active
          ? {
              boxShadow: "inset 2px 0 0 var(--foreground)",
            }
          : undefined
      }
    >
      <span className="font-mono text-sm">{label}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {sublabel}
      </span>
    </button>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-[var(--card)] px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
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
