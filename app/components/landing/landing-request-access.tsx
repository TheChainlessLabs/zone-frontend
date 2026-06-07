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
      className="relative z-[1] mx-auto flex min-h-screen max-w-[620px] flex-col justify-center px-8 py-24"
    >
      <div className="glass rounded-[var(--radius-2xl)] p-10">
        <h2 className="text-[30px] font-semibold tracking-[-0.02em]">Request access</h2>
        <p className="mt-3 text-[15px] leading-[1.65] text-[var(--muted-foreground)]">
          Omega is in private access. Tell us where you trade, which chains you use,
          and what stablecoin routes matter most to your business.
        </p>
        <div className="mt-7">
          <RequestAccessForm />
        </div>
      </div>
    </section>
  );
}

// Footer (app.jsx Footer) — mark + wordmark · tagline · © year.
export function LandingFooter() {
  return (
    <footer className="relative z-[1] border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 p-8">
        <span className="inline-flex items-center gap-2.5 text-[var(--foreground)]">
          <OmegaMark size={20} />
          <span className="font-wordmark text-[13px] font-semibold uppercase tracking-[0.14em]">
            Omega Markets
          </span>
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          {footer.tagline}
        </span>
        <span className="text-[12px] text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} Omega Markets
        </span>
      </div>
    </footer>
  );
}
