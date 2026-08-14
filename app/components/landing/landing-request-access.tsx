import { OmegaMark } from "@/components/OmegaMark";
import { footer } from "@/components/landing/content";
import { RequestAccessForm } from "@/components/landing/request-access-form";

// Request access (app.jsx RequestAccess) — a centered glass card holding the
// wired form (kept from the app: name/email/org/use-case/message, POSTs to
// /api/request-access, with success + error states).
export function LandingRequestAccess() {
  return (
    <section
      id="request"
      className="relative z-[1] mx-auto grid min-h-[100dvh] max-w-[1120px] grid-cols-1 items-center gap-10 px-4 py-24 sm:px-8 lg:grid-cols-[0.78fr_1fr] lg:py-32"
    >
      <div className="pb-2 lg:pb-24">
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          Private access
        </span>
        <h2 className="mt-4 max-w-[420px] text-balance text-[clamp(34px,5vw,56px)] font-semibold leading-[0.98] tracking-[-0.045em]">
          Request access
        </h2>
        <p className="mt-5 max-w-[430px] text-pretty text-[16px] leading-[1.7] text-[var(--muted-foreground)]">
          Omega is in private access. Tell us where you trade, which chains you use,
          and what stablecoin routes matter most to your business.
        </p>
        <div className="mt-8 grid max-w-[430px] grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)]">
          {["Darkpool matching", "TEE attestations", "Stablecoin FX", "Onchain settlement"].map(
            (item) => (
              <span
                key={item}
                className="bg-[var(--card)] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]"
              >
                {item}
              </span>
            ),
          )}
        </div>
        <p className="mt-5 max-w-[380px] border-l border-[var(--border)] pl-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[var(--muted-foreground)]">
          We review fit by venue coverage, stablecoin routes, size, and compliance
          requirements.
        </p>
      </div>
      <div className="glass rounded-[var(--radius-2xl)] p-5 shadow-[0_28px_90px_-60px_var(--foreground)] sm:p-8 lg:p-10">
        <RequestAccessForm />
      </div>
    </section>
  );
}

// Footer (app.jsx Footer) — mark + wordmark · tagline · © year.
export function LandingFooter() {
  return (
    <footer className="relative z-[1] border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 px-4 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <span className="inline-flex items-center gap-2.5 text-[var(--foreground)]">
          <OmegaMark size={20} />
          <span className="font-wordmark text-[13px] font-semibold uppercase tracking-[0.14em]">
            Omega Markets
          </span>
        </span>
        <div className="flex flex-col gap-2 text-left md:text-right">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            {footer.tagline}
          </span>
          <span className="text-[12px] text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} Omega Markets
          </span>
        </div>
      </div>
    </footer>
  );
}
