// Mei Lin redesign — full rebuild of /trade for mobile. Chart-first, pair-strip top, bottom-docked ticket that rises to a half-sheet on focus, available-balance promoted to a chip, CTA carries the order summary at submit, gates become inline sheets over a still-rendered page.
"use client";

/**
 * /trade — mobile-first rebuild (Mei Lin lens).
 *
 * Layout (390px viewport):
 *   1. Top header — wordmark + wallet pill (impossible zone is fine for low-frequency).
 *   2. Sticky pair strip — 5 horizontal chips, each `PAIR  midpoint  +/-Δ%`. One tap to switch.
 *   3. Mode strip — Market / Limit segmented control, sticky under the pair strip.
 *   4. Chart card — fills the available height. Always visible.
 *   5. Bottom ticket dock — collapsed: 2-line strip pinned above the tab bar with side toggle,
 *      amount field, available chip, and submit chip. Tap any field to expand to a half-sheet
 *      that rises to ~62% viewport height; the chart stays visible above.
 *   6. Inline gate sheets — Pass / Connect / Wrong-network render as page-locking bottom sheets
 *      over the still-rendered (dimmed) trade surface. The user sees what they are unlocking.
 *
 * One-hand contract:
 *   - Switch pair: top strip — stretch zone (acceptable; horizontal scroll keeps fingers in motion).
 *   - Set amount: bottom dock — easy zone.
 *   - Set side: bottom dock — easy zone.
 *   - Submit: bottom dock — easy zone.
 *   - 75% of trade actions land in the bottom third of the viewport.
 *
 * Out of scope here: desktop layout (falls out as a wider grid of the same units),
 * order confirmation modal (reused unchanged from production), backend wiring.
 */

import * as React from "react";

// NOTE: imports reference production paths. This file lives in runs/02/redesign/
// for review purposes — the production tree under `app/` is unchanged.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { LAUNCH_PAIRS, type LaunchPair } from "@/lib/fixtures/pairs";
import type { MarketPair, Side } from "@/lib/fixtures/types";

type OrderMode = "market" | "limit";
type GateState = "ok" | "disconnected" | "wrong-network" | "no-pass";

interface OrderTicketState {
  mode: OrderMode;
  side: Side;
  amount: string;
  price: string;
}

const PAIR_CHANGES: Record<MarketPair, string> = {
  "USDC/EURC": "+0.04%",
  "USDC/USDT": "−0.01%",
  "USDT/EURC": "+0.06%",
  "ETH/USDC": "+1.82%",
  "BTC/USDC": "−0.34%",
};

const MOCK_AVAILABLE = "10000.00";

export default function TradeMobile({
  initialPair = "USDC/EURC" as MarketPair,
  initialMidpoint = "0.9213",
  gate = "ok" as GateState,
}: {
  initialPair?: MarketPair;
  initialMidpoint?: string;
  gate?: GateState;
}) {
  const [pair, setPair] = React.useState<MarketPair>(initialPair);
  const [ticket, setTicket] = React.useState<OrderTicketState>({
    mode: "market",
    side: "buy",
    amount: "",
    price: initialMidpoint,
  });
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const launchPair: LaunchPair =
    LAUNCH_PAIRS.find((p) => p.pair === pair) ?? LAUNCH_PAIRS[0];

  const numericAmount = parseFloat(ticket.amount || "0");
  const numericPrice = parseFloat(
    (ticket.mode === "limit" ? ticket.price : initialMidpoint) || "0",
  );
  const estReceive =
    numericAmount > 0 && numericPrice > 0
      ? (numericAmount * numericPrice).toFixed(2)
      : "";
  const submitDisabled =
    numericAmount <= 0 ||
    (ticket.mode === "limit" && numericPrice <= 0) ||
    gate !== "ok";

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* 1. Header — wordmark + wallet pill */}
      <Header />

      {/* 2. Sticky pair strip */}
      <PairChipStrip
        pairs={LAUNCH_PAIRS}
        active={pair}
        onSelect={setPair}
      />

      {/* 3. Mode strip */}
      <ModeStrip
        mode={ticket.mode}
        onChange={(m) => setTicket((t) => ({ ...t, mode: m }))}
      />

      {/* 4. Chart card — fills remaining space above bottom dock */}
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-[calc(124px+env(safe-area-inset-bottom))]">
        <ChartCard pair={launchPair} midpoint={initialMidpoint} />
        <ContextStrip
          midpoint={initialMidpoint}
          fee="0.005%"
          settlement="Ethereum L1"
          estReceive={
            estReceive ? `${estReceive} ${launchPair.quote}` : undefined
          }
        />
      </main>

      {/* 5. Bottom ticket dock */}
      <BottomTicketDock
        pair={launchPair}
        ticket={ticket}
        midpoint={initialMidpoint}
        estReceive={estReceive}
        submitDisabled={submitDisabled}
        onTicketChange={setTicket}
        onExpand={() => setSheetOpen(true)}
        onSubmit={() => {
          // Hand off to OrderConfirmationModal in real wiring.
          if (!submitDisabled) setSheetOpen(false);
        }}
      />

      {/* Half-sheet — full ticket */}
      <HalfSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`${ticket.side === "buy" ? "Buy" : "Sell"} ${launchPair.base} / ${launchPair.quote}`}
      >
        <FullTicket
          pair={launchPair}
          ticket={ticket}
          midpoint={initialMidpoint}
          estReceive={estReceive}
          submitDisabled={submitDisabled}
          onChange={setTicket}
          onSubmit={() => setSheetOpen(false)}
        />
      </HalfSheet>

      {/* 6. Inline gate sheets — render over the dimmed page so the user sees what they are unlocking */}
      <GateSheet gate={gate} pair={launchPair} />

      {/* Bottom tab bar — production component slot */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0" aria-hidden />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/95 px-4 backdrop-blur-md">
      <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
        <span
          aria-hidden
          className="inline-block h-3.5 w-3.5 rounded-full bg-[var(--foreground)]"
        />
        OMEGA
      </span>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-full border border-[var(--border)] px-3 font-mono text-[11px] tabular-nums"
        aria-label="Wallet menu"
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)]"
        />
        0xa513…C853
        <Icon.Caret.Down size={12} aria-hidden />
      </button>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Pair chip strip                                                    */
/* ------------------------------------------------------------------ */

function PairChipStrip({
  pairs,
  active,
  onSelect,
}: {
  pairs: readonly LaunchPair[];
  active: MarketPair;
  onSelect: (p: MarketPair) => void;
}) {
  return (
    <nav
      aria-label="Markets"
      className="sticky top-0 z-10 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md"
    >
      <div className="flex items-stretch gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pairs.map((p) => {
          const isActive = p.pair === active;
          const change = PAIR_CHANGES[p.pair] ?? "";
          const isUp = change.startsWith("+");
          return (
            <button
              key={p.pair}
              type="button"
              onClick={() => onSelect(p.pair)}
              aria-pressed={isActive}
              className={cn(
                "flex h-12 min-w-[140px] shrink-0 flex-col items-start justify-center gap-0.5 rounded-[var(--radius-md)] border px-3 transition-colors",
                isActive
                  ? "border-[var(--foreground)] bg-[var(--muted)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)]",
              )}
            >
              <span className="font-mono text-[12px] font-medium tracking-tight text-[var(--foreground)]">
                {p.pair}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[12px] tabular-nums">
                  {p.demoMidpoint}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    isUp ? "text-[var(--success)]" : "text-[var(--destructive)]",
                  )}
                >
                  {change}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Mode strip                                                         */
/* ------------------------------------------------------------------ */

function ModeStrip({
  mode,
  onChange,
}: {
  mode: OrderMode;
  onChange: (m: OrderMode) => void;
}) {
  return (
    <div className="shrink-0 border-b border-[var(--border)] px-4 py-2">
      <div
        role="tablist"
        aria-label="Order mode"
        className="grid h-9 w-full grid-cols-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]"
      >
        {(["market", "limit"] as OrderMode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => onChange(m)}
            className={cn(
              "font-mono text-[12px] uppercase tracking-[0.14em] transition-colors",
              mode === m
                ? "bg-[var(--muted)] text-[var(--foreground)]"
                : "bg-transparent text-[var(--muted-foreground)]",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chart card                                                         */
/* ------------------------------------------------------------------ */

function ChartCard({ pair, midpoint }: { pair: LaunchPair; midpoint: string }) {
  return (
    <section
      aria-label="Price chart"
      className="flex min-h-[260px] flex-col gap-2 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {pair.pair} · midpoint reference
        </span>
        <span className="font-mono text-base tabular-nums">{midpoint}</span>
      </div>
      <div
        aria-hidden
        className="relative flex-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--muted)_40%,transparent)]"
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          chart wiring lands in M6
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Context strip — keeps the four numbers visible above the dock       */
/* ------------------------------------------------------------------ */

function ContextStrip({
  midpoint,
  fee,
  settlement,
  estReceive,
}: {
  midpoint: string;
  fee: string;
  settlement: string;
  estReceive?: string;
}) {
  const cells: Array<[string, string]> = [
    ["Midpoint", midpoint || "—"],
    ["Est. receive", estReceive || "—"],
    ["Fee", fee],
    ["Settlement", settlement],
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 bg-[var(--background)] px-3 py-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            {label}
          </span>
          <span className="font-mono text-[12px] tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom ticket dock — collapsed two-line ticket pinned above tab bar */
/* ------------------------------------------------------------------ */

function BottomTicketDock({
  pair,
  ticket,
  midpoint,
  estReceive,
  submitDisabled,
  onTicketChange,
  onExpand,
  onSubmit,
}: {
  pair: LaunchPair;
  ticket: OrderTicketState;
  midpoint: string;
  estReceive: string;
  submitDisabled: boolean;
  onTicketChange: (t: OrderTicketState) => void;
  onExpand: () => void;
  onSubmit: () => void;
}) {
  const isBuy = ticket.side === "buy";
  const tone = isBuy ? "var(--success)" : "var(--destructive)";

  // Order summary that lands in the CTA at submit moment.
  const summary = ticket.amount
    ? `${isBuy ? "Buy" : "Sell"} ${ticket.amount} ${pair.base}${
        ticket.mode === "limit"
          ? ` @ ${ticket.price}`
          : ` · mid ${midpoint}`
      }`
    : `${isBuy ? "Buy" : "Sell"} ${pair.base}`;

  return (
    <div
      className="absolute inset-x-0 bottom-[60px] z-20 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Line 1 — side toggle + available chip + amount input */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <SideTogglePair
          side={ticket.side}
          onChange={(s) => onTicketChange({ ...ticket, side: s })}
        />
        <button
          type="button"
          onClick={() =>
            onTicketChange({ ...ticket, amount: MOCK_AVAILABLE })
          }
          className="flex h-9 shrink-0 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 px-2 font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]"
          aria-label={`Use available balance ${MOCK_AVAILABLE} ${pair.base}`}
        >
          <span className="uppercase tracking-[0.14em]">Avail</span>
          <span className="text-[var(--foreground)]">
            {MOCK_AVAILABLE}
          </span>
        </button>
        <Input
          type="text"
          inputMode="decimal"
          value={ticket.amount}
          onChange={(e) =>
            onTicketChange({ ...ticket, amount: e.target.value })
          }
          onFocus={onExpand}
          placeholder="0.00"
          aria-label="Amount"
          className="h-9 flex-1 font-mono text-sm tabular-nums"
        />
      </div>

      {/* Line 2 — submit CTA carrying the order summary */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Button
          type="button"
          onClick={onExpand}
          variant="outline"
          size="sm"
          className="h-11 shrink-0 px-3 font-mono text-[11px] uppercase tracking-[0.14em]"
          aria-label="Expand ticket"
        >
          <Icon.Caret.Down size={12} aria-hidden className="rotate-180" />
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className="h-11 flex-1 truncate text-[12px] font-medium"
          style={{
            backgroundColor: tone,
            color: isBuy
              ? "var(--success-foreground)"
              : "var(--destructive-foreground)",
          }}
        >
          {summary}
        </Button>
      </div>
    </div>
  );
}

function SideTogglePair({
  side,
  onChange,
}: {
  side: Side;
  onChange: (s: Side) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Side"
      className="grid h-9 shrink-0 grid-cols-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]"
    >
      {(["buy", "sell"] as Side[]).map((s) => {
        const active = side === s;
        const tone = s === "buy" ? "var(--success)" : "var(--destructive)";
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s)}
            className={cn(
              "px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
              active ? "text-white" : "text-[var(--muted-foreground)]",
            )}
            style={
              active
                ? {
                    backgroundColor: `color-mix(in oklab, ${tone} 80%, transparent)`,
                  }
                : undefined
            }
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Half-sheet — full ticket                                           */
/* ------------------------------------------------------------------ */

function HalfSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-30">
      {/* Page-locking scrim */}
      <button
        type="button"
        aria-label="Close ticket"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
      />
      {/* Sheet */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[62dvh] flex-col rounded-t-[var(--radius-xl)] border-t border-[var(--border)] bg-[var(--card)] shadow-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            className="-m-2 p-2 text-[var(--muted-foreground)]"
          >
            <Icon.Close size={16} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Full ticket — rendered inside the half-sheet                        */
/* ------------------------------------------------------------------ */

function FullTicket({
  pair,
  ticket,
  midpoint,
  estReceive,
  submitDisabled,
  onChange,
  onSubmit,
}: {
  pair: LaunchPair;
  ticket: OrderTicketState;
  midpoint: string;
  estReceive: string;
  submitDisabled: boolean;
  onChange: (t: OrderTicketState) => void;
  onSubmit: () => void;
}) {
  const isBuy = ticket.side === "buy";
  const tone = isBuy ? "var(--success)" : "var(--destructive)";
  const summary = ticket.amount
    ? `${isBuy ? "Buy" : "Sell"} ${ticket.amount} ${pair.base}${
        ticket.mode === "limit"
          ? ` @ ${ticket.price}`
          : ` · mid ${midpoint}`
      } · fee 0.005%`
    : `${isBuy ? "Buy" : "Sell"} ${pair.base}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitDisabled) onSubmit();
      }}
      className="flex flex-col gap-4"
      aria-label="Order entry"
    >
      {/* Limit price (limit mode only) */}
      {ticket.mode === "limit" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="ft-price"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
            >
              Limit price
            </label>
            <button
              type="button"
              onClick={() => onChange({ ...ticket, price: midpoint })}
              className="h-7 rounded-full border border-[var(--border)] px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--foreground)]"
            >
              Use midpoint
            </button>
          </div>
          <Input
            id="ft-price"
            type="text"
            inputMode="decimal"
            value={ticket.price}
            onChange={(e) => onChange({ ...ticket, price: e.target.value })}
            placeholder={midpoint}
            className="h-12 font-mono text-base tabular-nums"
          />
        </div>
      ) : null}

      {/* Amount with available chip above */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="ft-amount"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
          >
            Amount
          </label>
          <button
            type="button"
            onClick={() => onChange({ ...ticket, amount: MOCK_AVAILABLE })}
            className="h-7 rounded-full border border-[var(--border)] px-3 font-mono text-[11px] tabular-nums text-[var(--foreground)]"
            aria-label={`Use available ${MOCK_AVAILABLE} ${pair.base}`}
          >
            Avail {MOCK_AVAILABLE} {pair.base}
          </button>
        </div>
        <Input
          id="ft-amount"
          type="text"
          inputMode="decimal"
          value={ticket.amount}
          onChange={(e) => onChange({ ...ticket, amount: e.target.value })}
          placeholder="0.00"
          className="h-14 font-mono text-2xl tabular-nums"
        />
      </div>

      {/* Percentage shortcuts as filled chips with active state */}
      <div className="grid grid-cols-4 gap-2">
        {[0.25, 0.5, 0.75, 1].map((factor) => {
          const next = (parseFloat(MOCK_AVAILABLE) * factor).toFixed(2);
          const active = ticket.amount === next;
          const label = factor === 1 ? "MAX" : `${factor * 100}`;
          return (
            <button
              key={factor}
              type="button"
              onClick={() => onChange({ ...ticket, amount: next })}
              className={cn(
                "h-9 rounded-[var(--radius-md)] border font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                active
                  ? "border-[var(--foreground)] bg-[var(--muted)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)]",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* You receive */}
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          You receive
        </span>
        <span className="font-mono text-base tabular-nums">
          {estReceive ? `${estReceive} ${pair.quote}` : "—"}
        </span>
      </div>

      {/* Submit — carries the full order summary */}
      <Button
        type="submit"
        disabled={submitDisabled}
        className="h-14 w-full text-sm font-medium"
        style={{
          backgroundColor: tone,
          color: isBuy
            ? "var(--success-foreground)"
            : "var(--destructive-foreground)",
        }}
      >
        {summary}
      </Button>

      <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        <Icon.Private size={10} aria-hidden />
        Match privately at midpoint.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Inline gate sheets                                                  */
/* ------------------------------------------------------------------ */

function GateSheet({ gate, pair }: { gate: GateState; pair: LaunchPair }) {
  if (gate === "ok") return null;

  const config: Record<
    Exclude<GateState, "ok">,
    { title: string; copy: string; cta: string }
  > = {
    "no-pass": {
      title: "Pass required",
      copy: `Trading ${pair.pair} is gated to Phase-4 NFT pass holders. The connected wallet does not hold a pass.`,
      cta: "Learn about the pass",
    },
    disconnected: {
      title: "Connect wallet to trade",
      copy: "Omega is read-only until your wallet signs in. No data leaves the page until you authorise.",
      cta: "Connect wallet",
    },
    "wrong-network": {
      title: "Switch network",
      copy: "Omega settles on Ethereum mainnet. Your wallet is on a different chain.",
      cta: "Switch to Ethereum",
    },
  };
  const { title, copy, cta } = config[gate];

  return (
    <div className="absolute inset-0 z-40">
      {/* Page-locking scrim — page renders dimmed behind so the user sees what they unlock. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-t-[var(--radius-xl)] border-t border-[var(--border)] bg-[var(--card)] px-4 py-5 shadow-xl"
        style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
      >
        <div
          aria-hidden
          className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]"
        />
        <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Phase 4 — closed access
        </h2>
        <p className="text-base font-medium text-[var(--foreground)]">
          {title}
        </p>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          {copy}
        </p>
        <Button type="button" className="h-12 w-full text-sm font-medium">
          {cta}
        </Button>
      </section>
    </div>
  );
}
