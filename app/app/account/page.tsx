import { AppShell } from "@/components/shell/AppShell";

// M3.1 stub. M3.7 lands the account surface (profile, signed sessions,
// preferences, sign-out).
export default function AccountPage() {
  return (
    <AppShell route="/account" auth>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            04 — Account
          </span>
          <h1 className="text-2xl font-medium tracking-tight md:text-4xl">
            Account
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            M3.7 wireframe lands here. Profile, preferences, sessions.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
