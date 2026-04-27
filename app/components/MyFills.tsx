"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { useMarket } from "@/lib/hooks/useMarket";
import { useUserOrders } from "@/lib/hooks/useUserOrders";

const MAX_ROWS = 8;

/**
 * Compact user-specific order history rendered in Limit mode below the
 * supporting chart. Strictly scoped to the current account — never
 * shows global market trades. Quiet mono table; clear status; no
 * marquee styling.
 */
export default function MyFills() {
  const { accountId } = useWallet();
  const { marketId } = useMarket();
  const { orders, isLoading, isError } = useUserOrders(accountId, marketId);

  const rows = orders.slice(0, MAX_ROWS);

  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="my-fills-heading"
      data-testid="my-fills"
    >
      <header className="flex items-baseline justify-between">
        <h3
          id="my-fills-heading"
          className="text-[11px] uppercase tracking-wider text-text-muted"
        >
          My Orders
        </h3>
        <Link
          href="/account"
          className="text-[11px] text-text-muted hover:text-text-secondary transition-fast"
        >
          View all
        </Link>
      </header>

      {isLoading && rows.length === 0 ? (
        <p className="text-[12px] text-text-muted py-3">Loading…</p>
      ) : isError && rows.length === 0 ? (
        <p className="text-[12px] text-text-muted py-3">
          Couldn&apos;t load your orders.
        </p>
      ) : !accountId ? (
        <p className="text-[12px] text-text-muted py-3">
          Connect a wallet to see your orders.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-[12px] text-text-muted py-3">No orders yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {rows.map((o) => (
            <li
              key={o.id}
              className="grid grid-cols-[60px_50px_1fr_1fr_60px] items-center py-2 text-[12px] font-mono font-tabular gap-2"
            >
              <span className="text-text-muted">{o.time}</span>
              <span
                className={`uppercase tracking-wider text-[11px] ${
                  o.side === "buy" ? "text-success" : "text-error"
                }`}
              >
                {o.side}
              </span>
              <span className="text-text-secondary text-right">
                {o.amount.toLocaleString()}
              </span>
              <span className="text-text-primary text-right">
                {o.price.toFixed(4)}
              </span>
              <span className="text-right text-[11px] uppercase tracking-wider text-text-muted">
                {o.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
