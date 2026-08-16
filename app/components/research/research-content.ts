import type { MarketInstrumentName } from "@/components/brand/market-instrument";

export const researchPosts = [
  {
    eyebrow: "Design partners",
    title: "Bring us a corridor worth solving.",
    deck:
      "A private design-partner program for payment and treasury teams, makers, and desks with recurring stablecoin conversion flow.",
    href: "/research/design-partners",
    instrument: "taker",
  },
  {
    eyebrow: "Mechanism",
    title: "Private price discovery for payments flow.",
    deck:
      "Why a dark book can let makers and takers commingle, net, and settle without revealing the order flow that creates the price.",
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
