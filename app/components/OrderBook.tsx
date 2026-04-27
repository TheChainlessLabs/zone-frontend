"use client";

import { useMemo } from "react";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { decodePrice, decodeQuantity } from "@/lib/priceUtils";
import type { OrderEntry } from "@/lib/apiTypes";
import { Skeleton } from "@/components/Skeleton";

const LEVELS = 8;
const BASE_DECIMALS = 6;

type Row = { price: number; size: number; cumulative: number };

function aggregate(entries: OrderEntry[]): Row[] {
  const byPrice = new Map<number, number>();
  for (const e of entries) {
    const p = decodePrice(e.price);
    const q = decodeQuantity(e.remaining_quantity, BASE_DECIMALS);
    byPrice.set(p, (byPrice.get(p) ?? 0) + q);
  }
  const sorted = Array.from(byPrice.entries()).sort((a, b) => a[0] - b[0]);
  let cum = 0;
  return sorted.map(([price, size]) => {
    cum += size;
    return { price, size, cumulative: cum };
  });
}

function formatSize(size: number): string {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(2)}M`;
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)}k`;
  return size.toFixed(2);
}

function formatPrice(price: number): string {
  return price.toFixed(4);
}

export default function OrderBook() {
  const { book, midpoint, isLoading, isError } = useOrderBook();

  const ladder = useMemo(() => {
    if (!book) return null;
    // Asks ascending by price; take cheapest LEVELS, then reverse so the
    // highest ask sits at the top of the visual ladder (further from
    // midpoint = higher up).
    const asksAsc = aggregate(book.asks).slice(0, LEVELS);
    const asks = [...asksAsc].reverse();
    // Bids ascending by price; take the highest LEVELS (last in ascending),
    // then reverse so the highest bid sits just below midpoint.
    const bidsAll = aggregate(book.bids);
    const bidsAsc = bidsAll.slice(Math.max(0, bidsAll.length - LEVELS));
    const bids = [...bidsAsc].reverse();
    const maxCum = Math.max(
      asksAsc[asksAsc.length - 1]?.cumulative ?? 0,
      bidsAsc[0]?.cumulative ?? 0,
      1,
    );
    return { asks, bids, maxCum };
  }, [book]);

  return (
    <section
      className="flex flex-col bg-bg-surface border border-border rounded-md overflow-hidden"
      data-testid="order-book"
    >
      <header className="flex items-center justify-between px-3 h-[28px] border-b border-border-subtle">
        <span className="text-label-uppercase text-text-muted">Order Book</span>
        <span className="text-[10px] uppercase tracking-wider text-text-muted">
          Price · Size
        </span>
      </header>

      {isLoading && !ladder ? (
        <Body>
          {Array.from({ length: LEVELS * 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[18px] mx-2 my-[1px]" />
          ))}
        </Body>
      ) : isError && !ladder ? (
        <Body>
          <p className="px-3 py-6 text-center text-body-sm text-text-secondary">
            Order book unavailable.
          </p>
        </Body>
      ) : ladder && ladder.asks.length === 0 && ladder.bids.length === 0 ? (
        <Body>
          <p className="px-3 py-6 text-center text-body-sm text-text-muted">
            No resting orders.
          </p>
        </Body>
      ) : ladder ? (
        <Body>
          <Side
            rows={ladder.asks}
            tone="ask"
            maxCum={ladder.maxCum}
            emptyLabel="No asks"
          />
          <MidpointBand midpoint={midpoint} />
          <Side
            rows={ladder.bids}
            tone="bid"
            maxCum={ladder.maxCum}
            emptyLabel="No bids"
          />
        </Body>
      ) : null}
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col py-1">{children}</div>;
}

function Side({
  rows,
  tone,
  maxCum,
  emptyLabel,
}: {
  rows: Row[];
  tone: "ask" | "bid";
  maxCum: number;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="px-3 py-2 text-[11px] text-text-muted">{emptyLabel}</p>
    );
  }
  return (
    <div className="flex flex-col">
      {rows.map((row, i) => {
        const widthPct = Math.min(100, (row.cumulative / maxCum) * 100);
        const priceClass =
          tone === "ask" ? "text-error" : "text-success";
        const fillClass =
          tone === "ask" ? "bg-error-subtle" : "bg-success-subtle";
        return (
          <div
            key={`${tone}-${i}`}
            className="relative flex items-center justify-between px-3 h-[18px] text-[11px] font-mono font-tabular"
          >
            <span
              className={`absolute inset-y-0 right-0 ${fillClass}`}
              style={{ width: `${widthPct}%` }}
              aria-hidden
            />
            <span className={`relative ${priceClass}`}>
              {formatPrice(row.price)}
            </span>
            <span className="relative text-text-secondary">
              {formatSize(row.size)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MidpointBand({ midpoint }: { midpoint: number | null }) {
  return (
    <div className="flex items-center justify-between px-3 h-[22px] my-1 border-y border-border-subtle bg-bg-elevated">
      <span className="text-[10px] uppercase tracking-wider text-text-muted">
        Mid
      </span>
      <span className="font-mono font-tabular text-[12px] text-accent">
        {midpoint === null ? "—" : formatPrice(midpoint)}
      </span>
    </div>
  );
}
