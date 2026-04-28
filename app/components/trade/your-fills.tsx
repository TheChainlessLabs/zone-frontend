/**
 * YourFills — user's own fills for the active pair.
 *
 * User-specific only. Per omega-docs/03-brand/naming.md, Omega is a dark
 * pool — no global trade tape, ever. Empty / loading / error / settled
 * states are first-class branches.
 */

import { Status } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import type { FillFixture } from "@/lib/fixtures/types";

export interface YourFillsProps {
  fills: FillFixture[];
  loading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  className?: string;
}

export function YourFills({
  fills,
  loading = false,
  errorMessage,
  emptyMessage = "No fills yet. Your matches will appear here.",
  className,
}: YourFillsProps) {
  return (
    <section
      aria-labelledby="your-fills-heading"
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5",
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2
          id="your-fills-heading"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
        >
          Your fills
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Last 24h
        </span>
      </header>

      {loading ? (
        <SkeletonRows />
      ) : errorMessage ? (
        <ErrorRow message={errorMessage} />
      ) : fills.length === 0 ? (
        <EmptyRow message={emptyMessage} />
      ) : (
        <FillsTable fills={fills} />
      )}
    </section>
  );
}

function FillsTable({ fills }: { fills: FillFixture[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            <th className="py-2 pr-4 text-left font-medium">Side</th>
            <th className="py-2 pr-4 text-left font-medium">Pair</th>
            <th className="py-2 pr-4 text-right font-medium">Amount</th>
            <th className="py-2 pr-4 text-right font-medium">Price</th>
            <th className="py-2 pr-4 text-left font-medium">Status</th>
            <th className="py-2 text-right font-medium">Matched</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {fills.map((f) => (
            <tr key={f.id} className="text-xs">
              <td className="py-2.5 pr-4">
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
              <td className="py-2.5 pr-4 font-mono">{f.pair}</td>
              <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                {f.amount}
              </td>
              <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                {f.price}
              </td>
              <td className="py-2.5 pr-4">
                <Status state={f.status} />
              </td>
              <td className="py-2.5 text-right font-mono text-[var(--muted-foreground)] tabular-nums">
                {formatTime(f.matchedAt)}
              </td>
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
    <p className="py-6 text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
      {message}
    </p>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="py-6 text-center text-xs leading-relaxed text-[var(--destructive)]"
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
