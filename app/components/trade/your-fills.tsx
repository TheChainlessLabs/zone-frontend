"use client";

/**
 * YourFills — the design-kit fills table for /trade.
 *
 * Ported from the kit's `TradeAside.jsx` YourFills: a sans section heading +
 * subtext, then a mono tabular table (Side · Pair · Amount · Price · Status ·
 * Matched). A newly-arrived top fill briefly washes success (the kit's fresh
 * row) so a just-matched fill is legible.
 *
 * User-specific only. Per omega-docs/03-brand/naming.md, Omega is a dark pool
 * — no global trade tape, ever. The app keeps its first-class
 * empty / loading / error branches and wires the table to real fills.
 */

import * as React from "react";

import { Status } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import type { FillFixture } from "@/lib/view-types";

export interface YourFillsProps {
  fills: FillFixture[];
  loading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  /** Narrow (market-mode) layout: drops the Pair / Price / Matched columns. */
  compact?: boolean;
  className?: string;
}

export function YourFills({
  fills,
  loading = false,
  errorMessage,
  emptyMessage = "No fills yet. Your matches will appear here.",
  compact = false,
  className,
}: YourFillsProps) {
  const subtext =
    fills.length > 0
      ? `${fills.length} ${fills.length === 1 ? "match" : "matches"} · last 24h`
      : "Your matches · last 24h";

  return (
    <section
      aria-labelledby="your-fills-heading"
      className={cn(
        "glass flex flex-col gap-3 rounded-[var(--radius-xl)] p-5",
        className,
      )}
    >
      <header className="flex flex-col gap-0.5">
        <h2
          id="your-fills-heading"
          className="m-0 font-sans text-lg font-semibold text-[var(--foreground)]"
        >
          Your fills
        </h2>
        <span className="font-sans text-[13px] text-[var(--muted-foreground)]">
          {subtext}
        </span>
      </header>

      {loading ? (
        <SkeletonRows />
      ) : errorMessage ? (
        <ErrorRow message={errorMessage} />
      ) : fills.length === 0 ? (
        <EmptyRow message={emptyMessage} />
      ) : (
        <FillsTable fills={fills} compact={compact} />
      )}
    </section>
  );
}

function FillsTable({ fills, compact }: { fills: FillFixture[]; compact?: boolean }) {
  // Detect a freshly-prepended top fill so it can wash success on arrival,
  // matching the kit's fresh-row treatment. Tracks the previous top id.
  const prevTopId = React.useRef<string | null>(fills[0]?.id ?? null);
  const [freshId, setFreshId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const topId = fills[0]?.id ?? null;
    if (topId && topId !== prevTopId.current) {
      setFreshId(topId);
      const t = setTimeout(() => setFreshId(null), 600);
      prevTopId.current = topId;
      return () => clearTimeout(t);
    }
    prevTopId.current = topId;
  }, [fills]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            <th className="py-2 pr-4 text-left font-medium">Side</th>
            {!compact && (
              <th className="py-2 pr-4 text-left font-medium">Pair</th>
            )}
            <th className="py-2 pr-4 text-right font-medium">Amount</th>
            {!compact && (
              <th className="py-2 pr-4 text-right font-medium">Price</th>
            )}
            <th className="py-2 pr-4 text-left font-medium">Status</th>
            {!compact && (
              <th className="py-2 text-right font-medium">Matched</th>
            )}
          </tr>
        </thead>
        <tbody>
          {fills.map((f) => (
            <tr
              key={f.id}
              className={cn(
                "border-t border-[var(--border)] text-[13px] transition-[background-color] duration-75 hover:bg-[var(--muted)]/30",
                f.id === freshId && "omega-fill-row-fresh",
              )}
            >
              <td className="py-3.5 pr-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.14em]"
                  style={{
                    color:
                      f.side === "buy"
                        ? "var(--success)"
                        : "var(--destructive)",
                  }}
                >
                  {f.side === "buy" ? "Buy" : "Sell"}
                </span>
              </td>
              {!compact && (
                <td className="py-3.5 pr-4 font-mono tabular-nums">{f.pair}</td>
              )}
              <td className="py-3.5 pr-4 text-right font-mono tabular-nums">
                {f.amount}
              </td>
              {!compact && (
                <td className="py-3.5 pr-4 text-right font-mono tabular-nums">
                  {f.price}
                </td>
              )}
              <td className="py-3.5 pr-4">
                <Status state={f.status} />
              </td>
              {!compact && (
                <td className="py-3.5 text-right font-mono tabular-nums text-[var(--muted-foreground)]">
                  {formatTime(f.matchedAt)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-2 py-2" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className="block h-8 animate-pulse rounded-[var(--radius-md)] bg-[var(--muted)] motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-[13px] leading-relaxed text-[var(--muted-foreground)]">
      {message}
    </p>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="py-6 text-center text-[13px] leading-relaxed text-[var(--destructive)]"
    >
      {message}
    </p>
  );
}

function formatTime(iso: string): string {
  // Zero-dep, deterministic across SSR/CSR — use the ISO time portion.
  const t = iso.split("T")[1] ?? "";
  return t.slice(0, 8);
}
