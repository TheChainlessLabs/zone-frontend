import { AppShell } from "@/components/shell/AppShell";

// M3.1 stub. M3.3 lands the portfolio surface (balances, positions,
// open orders, history).
export default function PortfolioPage() {
  return (
    <AppShell route="/portfolio" auth>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            02 — Portfolio
          </span>
          <h1 className="text-2xl font-medium tracking-tight md:text-4xl">
            Portfolio
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            M3.3 wireframe lands here. Balances, positions, history.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
