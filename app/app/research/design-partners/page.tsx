import { RequestAccessForm } from "@/components/landing/request-access-form";
import { ResearchArticle } from "@/components/research/research-article";

export default function DesignPartnersPage() {
  return (
    <ResearchArticle
      eyebrow="Design partners / Field note 01"
      title="Bring us a corridor worth solving."
      deck="Omega is building a dark pool for stablecoin FX on Tempo. We are looking for a small number of teams with recurring conversion flow to test it against the execution paths they use today."
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
          Real flow, not a sandbox.
        </h2>
        <p className="mt-4">
          The useful conversations begin with one pair, a known cadence,
          measurable execution costs, and a fallback that already works.
        </p>
        <p className="mt-4">
          Payment and treasury teams bring the flow. Makers bring committed
          inventory and the willingness to quote inside a private book.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          What we measure
        </h2>
        <p className="mt-4">
          We compare Omega with the existing path: all-in spread, slippage,
          rejection behavior, settlement time, and prefunding requirements.
        </p>
        <p className="mt-4">
          If Omega does not improve a measured outcome—or reject predictably
          enough to fit the workflow—we stop.
        </p>
      </section>

      <section>
        <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[var(--foreground)]">
          One pair. A defined test.
        </h2>
        <p className="mt-4">
          Discovery first. Then a private demonstration. If the fit is real, we
          run a controlled one-pair pilot with explicit success criteria and a
          stop condition.
        </p>
        <p className="mt-4">Integration follows evidence.</p>
      </section>
    </ResearchArticle>
  );
}
