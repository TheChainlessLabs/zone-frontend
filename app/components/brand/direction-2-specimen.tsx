"use client";

const VOICE_SAMPLES = [
  ["Primary CTA", "Submit ticket"],
  ["Error", "Network fee moved. Review and sign again."],
  ["Empty", "No open positions. Place an order to enter the book."],
  ["Footer", "Private matching. Public settlement record."],
  ["Button", "Export receipt"],
] as const;

export function Direction2Specimen() {
  return (
    <div
      data-testid="fixture-direction-2-voice"
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            data-brand-label
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          >
            Voice register
          </p>
          <h3 data-brand-display className="mt-2 text-xl font-medium text-[var(--foreground)]">
            Boardroom-ready, still exact
          </h3>
        </div>
        <span
          data-brand-label
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
        >
          Alloy Signal
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {VOICE_SAMPLES.map(([label, copy]) => (
          <div key={label} className="rounded-[12px] border border-[var(--border)] bg-[var(--muted)]/35 px-3 py-3">
            <p
              data-brand-label
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
            >
              {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
