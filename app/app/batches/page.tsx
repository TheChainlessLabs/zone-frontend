import { AppShell } from "@/components/shell/AppShell";

// M3.1 stub. M3.4 lands the batches surface — public per the PRD
// (omega-docs#5), so this route renders without `auth`.
export default function BatchesPage() {
  return (
    <AppShell route="/batches">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            03 — Batches
          </span>
          <h1 className="text-2xl font-medium tracking-tight md:text-4xl">
            Batches
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            M3.4 wireframe lands here. Settled batch index, proof status,
            on-chain links.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
