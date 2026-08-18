import type { MarketInstrumentName } from "@/components/brand/market-instrument";

export const researchPosts = [
  {
    eyebrow: "Design partners",
    title: "Connect your corridor - design partner signup.",
    deck:
      "A 1:1 design partnership to improve corridor capital efficiency and the business case for a verifiable dark book.",
    href: "/research/design-partners",
    instrument: "taker",
  },
  {
    eyebrow: "Mechanism",
    title: "Private price discovery for payments flow.",
    deck:
      "Why and how a dark book can let makers and takers cross flow and settle atomically without revealing the order flow that creates the price.",
    href: "/research/private-price-discovery",
    instrument: "omega",
  },
] as const satisfies ReadonlyArray<{
  eyebrow: string;
  title: string;
  deck: string;
  href: string;
  instrument: MarketInstrumentName;
}>;
