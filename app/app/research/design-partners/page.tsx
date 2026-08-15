import { RequestAccessForm } from "@/components/landing/request-access-form";
import { ResearchArticle } from "@/components/research/research-article";

export default function DesignPartnersPage() {
  return (
    <ResearchArticle
      eyebrow="Design partners / Field note 01"
      title="Help shape private stablecoin FX execution."
      deck="We are working with teams that move stablecoins for real payments, treasury, and market-making needs."
      rail={
        <div id="apply" className="glass rounded-[var(--radius-xl)] p-5 sm:p-6">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Private access
          </p>
          <RequestAccessForm />
        </div>
      }
    >
      <p>
        Omega&apos;s design partners will pressure-test the market structure with
        real corridor constraints, execution requirements, and liquidity needs.
      </p>
    </ResearchArticle>
  );
}
