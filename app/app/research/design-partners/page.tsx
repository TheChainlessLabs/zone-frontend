import { RequestAccessForm } from "@/components/landing/request-access-form";
import { ResearchArticle } from "@/components/research/research-article";

export default function DesignPartnersPage() {
  return (
    <ResearchArticle
      eyebrow="Design partners / Field note 01"
      title="Bring us a corridor worth solving."
      deck="Omega is building a dark pool for stablecoin FX on Tempo. We’re looking for a handful of teams that move stablecoins regularly and know exactly where today’s execution falls short."
      rail={
        <div id="apply" className="panel rounded-[var(--radius-xl)] p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Private alpha / Design partners
          </p>
          <h2 className="mb-5 mt-3 text-balance text-[24px] font-semibold leading-[1.05] tracking-[-0.035em]">
            Bring us a corridor.
          </h2>
          <RequestAccessForm />
        </div>
      }
    >
      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          Start with something real.
        </h2>
        <p className="mt-4">
          We don’t want test transactions or projected volume. Bring us a
          corridor you already use: one pair, familiar trade sizes, a regular
          cadence, and a route you can fall back to.
        </p>
        <p className="mt-4">
          We’re interested in both sides of the market—payment and treasury
          teams with recurring conversions, and makers willing to commit
          inventory and quote privately.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          Why take part?
        </h2>
        <p className="mt-4">
          The point isn’t early access for its own sake. It’s to find out
          whether private, batched execution can improve a real part of your
          operation before either side commits serious engineering time.
        </p>
        <p className="mt-4">
          Partners will have a direct say in the details that matter: how long
          quotes remain valid, when orders can be rejected, how settlement
          should work, and what an integration actually needs.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          We’ll compare it with what already works.
        </h2>
        <p className="mt-4">
          We measure Omega against the route you use today: spread, slippage,
          rejected orders, settlement time, and prefunding.
        </p>
        <p className="mt-4">
          Your existing route stays in place throughout the test. If Omega
          isn’t better—or at least predictable enough to fit alongside it—we
          stop there.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          One pair. One clear test.
        </h2>
        <p className="mt-4">
          First, we map the current flow. Then we run a private demonstration.
          If the numbers hold up, we test one pair for a fixed period with
          success criteria agreed in advance.
        </p>
        <p className="mt-4">Only then do we talk about integration.</p>
      </section>
    </ResearchArticle>
  );
}
