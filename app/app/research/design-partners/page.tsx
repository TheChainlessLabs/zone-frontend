import { RequestAccessForm } from "@/components/landing/request-access-form";
import { ResearchArticle } from "@/components/research/research-article";

export default function DesignPartnersPage() {
  return (
    <ResearchArticle
      eyebrow="Design partners / Note 01"
      title="Connect your corridor."
      deck="Omega is building a dark pool for stablecoin FX on Tempo. We’re looking for a handful of teams that move stablecoins regularly and know exactly where today’s execution falls short."
      rail={
        <div id="apply" className="panel rounded-[var(--radius-xl)] p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Private alpha / Design partners
          </p>
          <h2 className="mb-5 mt-3 text-balance text-[24px] font-semibold leading-[1.05] tracking-[-0.035em]">
            Connect with the Omega team.
          </h2>
          <RequestAccessForm />
        </div>
      }
    >
      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          Start with the business case.
        </h2>
        <p className="mt-4">
          Sanity check your current flow against the Omega Markets model - where
          can improvements be made in cost, speed and capital efficiency
          (float).
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
          operation.
        </p>
        <p className="mt-4">
          Partners will have a direct say in the details that matter: how long
          quotes remain valid, when orders can be rejected, how settlement
          should work, and what an integration actually requires.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          We’ll test our shared thesis.
        </h2>
        <p className="mt-4">
          We measure Omega against the route you use today: spread, slippage,
          rejected orders, settlement time, and prefunding.
        </p>
        <p className="mt-4">
          Production-grade testing can consist of end-to-end testing with
          low-value fiat accounts and any of the pairs that Omega supports -
          which is an open design question.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          Summary - One pair. One clear test.
        </h2>
        <p className="mt-4">
          First, we map the current flow. Then we run a private demonstration.
          If the numbers hold up, we test one pair for a fixed period with
          success criteria agreed in advance.
        </p>
        <p className="mt-4">
          Integrations and corridor go-live follow this important sequence of
          testing.
        </p>
      </section>
    </ResearchArticle>
  );
}
