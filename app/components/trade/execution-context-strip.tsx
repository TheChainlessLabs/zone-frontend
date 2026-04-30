/**
 * ExecutionContextStrip — four-cell summary below the order form.
 *
 * Four cells: Midpoint · Estimated received · Fee · Settlement. Values are
 * mono-tabular; missing values render an em-dash.
 *
 * Layout: 4-up on md+, 2x2 on narrow mobile. Sits below the order form,
 * not inside it — keeps the form card focused on action.
 */

import { cn } from "@/lib/utils";

export interface ExecutionContextStripProps {
  midpoint?: string;
  estimatedReceive?: string;
  fee?: string;
  settlement?: string;
  className?: string;
}

export function ExecutionContextStrip({
  midpoint,
  estimatedReceive,
  fee,
  settlement,
  className,
}: ExecutionContextStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-4",
        className,
      )}
    >
      <Cell label="Midpoint" value={midpoint} />
      <Cell label="Est. received" value={estimatedReceive} />
      <Cell label="Fee" value={fee} />
      <Cell label="Settlement" value={settlement} />
    </div>
  );
}

function Cell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--background)] px-3 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
        {value && value.length > 0 ? value : "—"}
      </span>
    </div>
  );
}
