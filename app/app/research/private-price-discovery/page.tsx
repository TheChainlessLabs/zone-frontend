import { ArrowUpRight } from "lucide-react";

import {
  MarketInstrument,
  type MarketInstrumentName,
} from "@/components/brand/market-instrument";
import { ResearchArticle } from "@/components/research/research-article";

const priceDiscoveryFlow = [
  {
    name: "maker",
    label: "Maker",
    action: "Quote privately",
    title: "Maker: Quote privately",
  },
  {
    name: "taker",
    label: "Taker",
    action: "Trade within bounds",
    title: "Taker: Trade within bounds",
  },
  {
    name: "omega",
    label: "Omega",
    action: "Dark book",
    title: "Omega dark book",
  },
  {
    name: "tempo",
    label: "Tempo",
    action: "Settle atomically",
    title: "Tempo: Settle atomically",
  },
  {
    name: "proof",
    label: "Proof",
    action: "Public receipt",
    title: "Proof: Public receipt",
  },
] as const satisfies ReadonlyArray<{
  name: MarketInstrumentName;
  label: string;
  action: string;
  title: string;
}>;

function PriceDiscoveryFlow() {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--card)]">
      <figcaption className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Private price discovery
        </span>
        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
          01—05
        </span>
      </figcaption>

      <ol
        aria-label="Private price discovery flow"
        className="grid grid-cols-2"
      >
        {priceDiscoveryFlow.map((step, index) => (
          <li
            key={step.name}
            className={[
              "relative flex min-h-36 flex-col justify-between gap-6 p-5",
              index === 0 ? "border-b border-r border-[var(--border)]" : "",
              index === 1 ? "border-b border-[var(--border)]" : "",
              index === 2
                ? "col-span-2 border-b border-[var(--border)] bg-[var(--foreground)] text-[var(--background)]"
                : "",
              index === 3 ? "border-r border-[var(--border)]" : "",
            ].join(" ")}
          >
            <MarketInstrument
              name={step.name}
              size={index === 2 ? 52 : 42}
              title={step.title}
            />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] opacity-65">
                {step.label}
              </span>
              <span className="mt-1.5 block text-[14px] font-medium leading-tight">
                {step.action}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export default function PriceDiscoveryPage() {
  return (
    <ResearchArticle
      eyebrow="Field note 02"
      title="Private transfers are only half the market."
      deck="The next step is a market that can discover price before it reveals the flow."
      rail={<PriceDiscoveryFlow />}
    >
      <section>
        <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--foreground)]">
          The missing layer.
        </h2>
        <div className="mt-5 space-y-6">
          <p>
            Private transfer systems have made it possible to move value
            without broadcasting every step. But most private transfers still
            begin with a price made somewhere else—on a public venue, against a
            public book, in full view of the market.
          </p>
          <p>
            That leaves the important moment exposed. The order announces
            itself while it is still searching for a counterparty. Size becomes
            signal. Repeated flow becomes a pattern. The market learns what is
            coming before settlement ever begins.
          </p>
          <p>
            For payments flow, that distinction matters. The conversion is not
            an isolated trade; it is part of a route that may repeat every day.
            Protecting the transfer while exposing the price search protects
            only half the journey.
          </p>
          <p>
            Omega moves that moment inside the dark book. Makers can quote
            without publishing their inventory. Takers can enter with a firm
            boundary around what they will accept. The book brings both sides
            together and forms its own price, in private.
          </p>
          <p>
            Nothing needs to perform for the outside market. There is no visible
            queue to trade ahead of and no full order displayed simply to
            discover whether liquidity exists. A trade fills inside its limits
            or returns untouched.
          </p>
          <p>
            Inside that room, makers still compete and takers still choose.
            Privacy changes what the market can observe, not the discipline that
            makes a price meaningful.
          </p>
          <p>
            This is private price discovery: not wrapping privacy around a price
            made elsewhere, but giving price formation a protected room of its
            own.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)] pt-8">
        <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--foreground)]">
          What leaves the dark.
        </h2>
        <p className="mt-5">
          The public world needs the result, not the path. Settlement can be
          verified. The identities, intent, and book that produced it can remain
          concealed.
        </p>
        <p className="mt-6 text-[18px] font-medium leading-[1.55] text-[var(--foreground)]">
          Privacy is not the product. A better market is.
        </p>
      </section>

      <a
        href="/research/design-partners"
        className="group flex items-center justify-between gap-6 border-y border-[var(--border)] py-6 text-[var(--foreground)] no-underline"
      >
        <span className="text-[17px] font-medium leading-snug">
          Have a payments flow worth bringing into the dark?
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
        />
      </a>
    </ResearchArticle>
  );
}
