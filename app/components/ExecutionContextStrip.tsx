"use client";

import { useOrderBook } from "@/lib/hooks/useOrderBook";

const FEE_RATE = "0.005%";

/**
 * Quiet protocol-level execution context strip rendered below the
 * OrderForm in Market mode. CoW-Swap-flavoured: a single horizontal
 * row of labelled values that establish trust without competing with
 * the form. Per-order numbers (estimated received in $, fee in $)
 * stay inside the form's own summary block — this strip is for
 * protocol-level facts that are true regardless of the user's amount.
 *
 * Rules: real values only (no fake numbers); strictly secondary to
 * the form (no background, no border, mono numerals); never marquee-
 * styled.
 */
export default function ExecutionContextStrip() {
  const { book, midpoint, isLoading, isError } = useOrderBook();

  const midpointDisplay = formatMidpoint(midpoint, isLoading, isError);
  const spreadDisplay = formatSpread(book, isLoading, isError);

  return (
    <div className="border-t border-border-subtle pt-3 mt-1">
      <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[12px]">
        <Item label="Midpoint" value={midpointDisplay} />
        <Item label="Fee" value={FEE_RATE} />
        <Item label="Spread" value={spreadDisplay} />
        <Item label="Settlement" value="On-chain" muted />
      </dl>
    </div>
  );
}

function Item({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[11px] uppercase tracking-wider text-text-muted">{label}</dt>
      <dd
        className={`font-mono font-tabular ${
          muted ? "text-text-muted" : "text-text-secondary"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatMidpoint(
  midpoint: number | null,
  isLoading: boolean,
  isError: boolean,
): string {
  if (isLoading && midpoint === null) return "—";
  if (isError && midpoint === null) return "—";
  if (midpoint === null) return "—";
  return midpoint.toFixed(4);
}

function formatSpread(
  book: ReturnType<typeof useOrderBook>["book"],
  isLoading: boolean,
  isError: boolean,
): string {
  if (isLoading || isError || !book) return "—";
  const bids = book.bids ?? [];
  const asks = book.asks ?? [];
  if (bids.length === 0 || asks.length === 0) return "—";
  const bestBid = decode(bids[0].price);
  const bestAsk = decode(asks[0].price);
  if (!Number.isFinite(bestBid) || !Number.isFinite(bestAsk)) return "—";
  if (bestAsk <= bestBid) return "—";
  const spreadBps = ((bestAsk - bestBid) / ((bestAsk + bestBid) / 2)) * 10_000;
  return `${spreadBps.toFixed(1)} bps`;
}

function decode(encoded: string): number {
  // Same convention as priceUtils.decodePrice — 18-decimal fixed-point.
  // Local copy to keep this component a single import.
  return Number(BigInt(encoded)) / 1e18;
}
