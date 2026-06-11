"use client";

/**
 * YourOpenOrders — resting-order companion to {@link YourFills} on /trade.
 *
 * Same card surface and mono tabular table as YourFills, but lists the user's
 * resting limit orders (Side · Pair · Amount · Price · Status · Placed) instead
 * of matched fills. Sits directly above YourFills in limit mode. User-specific
 * only — Omega is a dark pool, so there is no global order book tape here.
 */

import * as React from "react";

import { Status } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import type { OrderFixture } from "@/lib/view-types";

export interface YourOpenOrdersProps {
  orders: OrderFixture[];
  loading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  /** Narrow (market-mode) layout: drops the Pair / Price / Placed columns. */
  compact?: boolean;
  className?: string;
}

export function YourOpenOrders({
  orders,
  loading = false,
  errorMessage,
  emptyMessage = "No open orders. Your resting limit orders will appear here.",
  compact = false,
  className,
}: YourOpenOrdersProps) {
  const subtext =
    orders.length > 0
      ? `${orders.length} ${orders.length === 1 ? "order" : "orders"} resting`
      : "Your resting orders";

  return (
    <section
      aria-labelledby="your-open-orders-heading"
      className={cn(
        "glass flex flex-col gap-3 rounded-[var(--radius-xl)] p-5",
        className,
      )}
    >
      <header className="flex flex-col gap-0.5">
        <h2
          id="your-open-orders-heading"
          className="m-0 font-sans text-lg font-semibold text-[var(--foreground)]"
        >
          Open orders
        </h2>
        <span className="font-sans text-[13px] text-[var(--muted-foreground)]">
          {subtext}
        </span>
      </header>

      {loading ? (
        <SkeletonRows />
      ) : errorMessage ? (
        <ErrorRow message={errorMessage} />
      ) : orders.length === 0 ? (
        <EmptyRow message={emptyMessage} />
      ) : (
        <OrdersTable orders={orders} compact={compact} />
      )}
    </section>
  );
}

function OrdersTable({
  orders,
  compact,
}: {
  orders: OrderFixture[];
  compact?: boolean;
}) {
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
            {!compact && <th className="py-2 text-right font-medium">Placed</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-t border-[var(--border)] text-[13px] transition-[background-color] duration-75 hover:bg-[var(--muted)]/30"
            >
              <td className="py-3.5 pr-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.14em]"
                  style={{
                    color:
                      o.side === "buy"
                        ? "var(--success)"
                        : "var(--destructive)",
                  }}
                >
                  {o.side === "buy" ? "Buy" : "Sell"}
                </span>
              </td>
              {!compact && (
                <td className="py-3.5 pr-4 font-mono tabular-nums">{o.pair}</td>
              )}
              <td className="py-3.5 pr-4 text-right font-mono tabular-nums">
                {o.amount}
              </td>
              {!compact && (
                <td className="py-3.5 pr-4 text-right font-mono tabular-nums">
                  {o.price}
                </td>
              )}
              <td className="py-3.5 pr-4">
                <Status state={o.status} />
              </td>
              {!compact && (
                <td className="py-3.5 text-right font-mono tabular-nums text-[var(--muted-foreground)]">
                  {formatTime(o.submittedAt)}
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
