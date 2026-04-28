import { AppShell } from "@/components/shell/AppShell";

// M3.1 stub. The real trade surface (orderbook, order form, recent matches)
// lands in M3.2 — this page exists only to verify the production shell
// renders end-to-end with auth gating.
export default function TradePage() {
  return (
    <AppShell route="/trade" auth>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            01 — Trade
          </span>
          <h1 className="text-2xl font-medium tracking-tight md:text-4xl">
            Trade
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            M3.2 wireframe lands here. Order form, book, matches.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
