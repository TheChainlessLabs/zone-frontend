"use client";

/**
 * PairSwitcher — the design-kit market selector for /trade.
 *
 * Ported from the kit's `PairSwitcher.jsx`. The trigger shows the selected
 * pair, a hairline divider, and the live midpoint rolling via NumberTicker.
 * The dropdown lists each available pair with a monochrome BASE/QUOTE token
 * chip pair, the midpoint, a tinted 24h change pill, and an active check.
 *
 * The app keeps its real product content: the live pair is ALPHAUSD/PATH.USD
 * (the kit's USDC/EURC roster is demo data) and the menu stays on Radix
 * DropdownMenu for keyboard + screen-reader semantics. Monochrome — no
 * invented per-token colour. Pair convention (omega-docs/03-brand/naming.md):
 * BASE/QUOTE token tickers only, never fiat.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { LAUNCH_PAIRS, type LaunchPair } from "@/lib/pairs";

import { NumberTicker } from "./motion";

export interface PairSwitcherProps {
  value: string;
  onChange: (pair: string) => void;
  /** Live midpoint for the selected pair, formatted. Empty = em-dash. */
  midpoint?: string;
  pairs?: LaunchPair[];
  className?: string;
}

/** Monochrome ticker chip — small bordered mono pill. On-brand, unambiguous. */
function TokenChip({ symbol, strong }: { symbol: string; strong?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center whitespace-nowrap rounded-[var(--radius-sm)] border px-1.5 font-mono text-[10px] tracking-[0.06em]",
        strong
          ? "border-[var(--border)] bg-[color-mix(in_oklab,var(--muted)_60%,var(--card))] text-[var(--foreground)]"
          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)]",
      )}
    >
      {symbol}
    </span>
  );
}

export function PairSwitcher({
  value,
  onChange,
  midpoint,
  pairs = LAUNCH_PAIRS,
  className,
}: PairSwitcherProps) {
  const selected =
    pairs.find((p) => p.pair === value) ?? pairs[0] ?? LAUNCH_PAIRS[0];
  const liveMid = midpoint && midpoint.length > 0 ? midpoint : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="glass"
          className={cn(
            "h-12 w-full justify-between gap-3 px-4 text-left",
            className,
          )}
          aria-label={`Pair: ${value}`}
        >
          <span className="flex items-baseline gap-2.5">
            <span className="font-mono text-sm font-medium leading-none tracking-tight">
              {selected.pair}
            </span>
            <span
              aria-hidden
              className="h-4 w-px self-center bg-[var(--border)]"
            />
            {liveMid ? (
              <NumberTicker
                value={liveMid}
                dim
                className="font-mono text-xs leading-none"
              />
            ) : (
              <span className="font-mono text-xs leading-none text-[var(--muted-foreground)]">
                —
              </span>
            )}
          </span>
          <Icon.Caret.Down
            size={16}
            aria-hidden
            className="text-[var(--muted-foreground)]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[300px] p-1.5"
      >
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Markets
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            {pairs.length} {pairs.length === 1 ? "pair" : "pairs"}
          </span>
        </div>
        <div className="mx-0.5 mb-1.5 h-px bg-[var(--border)]" />
        <div className="flex flex-col gap-0.5">
          {pairs.map((pair) => (
            <PairRow
              key={pair.pair}
              pair={pair}
              active={pair.pair === value}
              midpoint={pair.pair === value ? liveMid : ""}
              onSelect={() => onChange(pair.pair)}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PairRow({
  pair,
  active,
  midpoint,
  onSelect,
}: {
  pair: LaunchPair;
  active: boolean;
  /** Live midpoint for the active pair; empty for inactive rows → em-dash. */
  midpoint?: string;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={cn(
        "flex items-center justify-between gap-4 rounded-[var(--radius-md)] px-2.5 py-2",
        active && "bg-[var(--muted)]",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex w-4 shrink-0 justify-center">
          {active ? (
            <Icon.Confirm
              size={14}
              aria-hidden
              className="text-[var(--success)]"
            />
          ) : (
            <span className="h-[5px] w-[5px] rounded-full bg-[var(--border)]" />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-sm font-medium">{pair.pair}</span>
          <span className="inline-flex items-center gap-1.5">
            <TokenChip symbol={pair.base} strong />
            <span className="text-[10px] text-[var(--muted-foreground)]">/</span>
            <TokenChip symbol={pair.quote} />
          </span>
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-mono text-sm tabular-nums text-[var(--muted-foreground)]">
          {midpoint && midpoint.length > 0 ? midpoint : "—"}
        </span>
      </span>
    </DropdownMenuItem>
  );
}
