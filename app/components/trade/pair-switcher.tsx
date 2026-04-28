"use client";

/**
 * PairSwitcher — multi-pair selector for /trade.
 *
 * Trigger shows the currently selected pair (BASE/QUOTE token tickers) +
 * its midpoint and a chevron. On open, lists the 5 launch pairs from
 * `LAUNCH_PAIRS`, each row showing midpoint + a placeholder 24h change.
 *
 * Pair convention (omega-docs/03-brand/naming.md): BASE/QUOTE stablecoin
 * tokens only — never fiat tickers.
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
import { LAUNCH_PAIRS, type LaunchPair } from "@/lib/fixtures/pairs";
import type { MarketPair } from "@/lib/fixtures/types";

/** Stable demo 24h-change values keyed by pair so the wireframe doesn't flap. */
const DEMO_CHANGES: Record<MarketPair, string> = {
  "USDC/EURC": "+0.04%",
  "USDC/USDT": "−0.01%",
  "USDT/EURC": "+0.06%",
  "ETH/USDC": "+1.82%",
  "BTC/USDC": "−0.34%",
};

export interface PairSwitcherProps {
  value: MarketPair;
  onChange: (pair: MarketPair) => void;
  /** Live midpoint for the selected pair, formatted. Empty = em-dash. */
  midpoint?: string;
  className?: string;
}

export function PairSwitcher({
  value,
  onChange,
  midpoint,
  className,
}: PairSwitcherProps) {
  const selected = LAUNCH_PAIRS.find((p) => p.pair === value) ?? LAUNCH_PAIRS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 w-full justify-between gap-3 px-4 text-left",
            className,
          )}
          aria-label={`Pair: ${value}`}
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium tracking-tight">
              {selected.pair}
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
              {midpoint && midpoint.length > 0 ? midpoint : "—"}
            </span>
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
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[280px] p-1"
      >
        {LAUNCH_PAIRS.map((pair) => (
          <PairRow
            key={pair.pair}
            pair={pair}
            active={pair.pair === value}
            onSelect={() => onChange(pair.pair)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PairRow({
  pair,
  active,
  onSelect,
}: {
  pair: LaunchPair;
  active: boolean;
  onSelect: () => void;
}) {
  const change = DEMO_CHANGES[pair.pair];
  const isUp = change.startsWith("+");
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={cn(
        "flex items-center justify-between gap-4 rounded-[var(--radius-md)] px-3 py-2",
        active && "bg-[var(--muted)]",
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-mono text-sm font-medium">{pair.pair}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          {pair.base} · {pair.quote}
        </span>
      </span>
      <span className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-sm tabular-nums">
          {pair.demoMidpoint}
        </span>
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            isUp ? "text-[var(--success)]" : "text-[var(--destructive)]",
          )}
        >
          {change}
        </span>
      </span>
    </DropdownMenuItem>
  );
}
