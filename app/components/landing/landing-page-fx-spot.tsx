"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { landingHero } from "@/components/landing/content";
import { useCardScrollAnimation } from "@/hooks/useCardScrollAnimation";
import { BlackholeScene3D } from "@/components/landing/blackhole-scene-3d";

const CARDS = [
  {
    title: "Why swap on Omega",
    subtitle: "Execution without exposure.",
    badge: "01",
    items: [
      {
        name: "No opaque pricing",
        body: "The price forms inside the book, with no middleman cost.",
      },
      {
        name: "Positions stay private, spreads tighten",
        body: "No visible book, no mempool; trade details never shared publicly. Makers/takers quotes align with actual trade intent.",
      },
      {
        name: "Fill or Kill quotes",
        body: "The rate signed by the user can only be improved on. Both legs clear together, instantly — no credit required to operate the market.",
      },
      {
        name: "Verifiable fills",
        body: "Every fill comes with proof of fair execution. The Omega code is the arbiter of price, nothing else.",
      },
    ],
  },
  {
    title: "Who is Omega for",
    subtitle: "All stablecoin users",
    badge: "02",
    items: [
      {
        name: "Businesses",
        body: "Move stablecoin FX at scale without broadcasting size, timing, or position.",
      },
      {
        name: "Individuals",
        body: "Swap privately at the same rate as institutions — same book, no tiers.",
      },
    ],
  },
  {
    title: "How Omega works",
    subtitle: null,
    badge: "03",
    items: [
      {
        name: "Trade intent enters Omega Markets privately",
        body: "A fund, treasury, payment platform, or onchain trader submits a stablecoin FX intent. The market never sees who placed it, how large it is, or where it may route.",
      },
      {
        name: "The dark book matches",
        body: "Resting liquidity, counterflow, and block-size interest execute inside Omega's private order book — never exposed to public venues, mempools, or bots.",
      },
      {
        name: "Proof, then settlement",
        body: "Every fill produces proof of correct execution — verifiable without revealing the matching path. Settlement is atomic: both legs or neither, no credit in the middle. Critically, the receipt prints the fill against reference mid — effectively setting the on-chain market price for FX.",
      },
    ],
  },
  {
    title: "Ready to Trade?",
    subtitle: "Join design partners and developers building on Omega",
    badge: null,
    items: [],
  },
] as const;

function CardItem({
  card,
  index,
  totalCards,
}: {
  card: (typeof CARDS)[number];
  index: number;
  totalCards: number;
}) {
  const cardRef = useCardScrollAnimation(index, totalCards);

  return (
    <div
      ref={cardRef}
      data-card-wrap
      className="flex w-full items-center justify-center lg:max-[1399px]:h-[70vh] min-[1400px]:h-[85vh] min-[1400px]:justify-end"
    >
      <div
        data-card-slide
        className="glass w-full max-w-[900px] min-[1400px]:min-w-[550px] space-y-6 rounded-[20px] p-8 min-[1400px]:p-10"
      >
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[var(--foreground)] min-[1400px]:text-4xl">
            {card.title}
          </h2>
          {card.subtitle ? (
            <p className="text-base leading-relaxed text-[var(--muted-foreground)] min-[1400px]:text-lg">
              {card.subtitle}
            </p>
          ) : null}
        </div>
        {card.items.length > 0 ? (
          <ul className="space-y-5">
            {card.items.map((item, itemIndex) => (
              <li key={item.name} className="flex gap-4">
                <span className="mt-[3px] shrink-0 font-mono text-xs text-[var(--muted-foreground)]">
                  {String(itemIndex + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <p className="text-[15px] font-medium leading-snug text-[var(--foreground)] min-[1400px]:text-base">
                    {item.name}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)] min-[1400px]:text-[15px]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {card.badge ? null : (
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild className="h-11 px-6">
              <a href="/trade">{landingHero.launchCta}</a>
            </Button>
            <Button asChild variant="secondary" className="h-11 px-6">
              <a href="/research/design-partners">{landingHero.secondaryCta}</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LandingPageFXSpot() {
  const [navSolid, setNavSolid] = React.useState(false);
  const railRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Continuous carousel (desktop): the card list renders twice; once the
  // scroll position where the second set lines up exactly with the first
  // set's start is passed, snap back by one period. The hero pane and scene
  // are fixed, so the swap is invisible and the rail cycles endlessly.
  React.useEffect(() => {
    const onScroll = () => {
      const rail = railRef.current;
      if (!rail) return;

      const wraps = rail.querySelectorAll<HTMLElement>("[data-card-wrap]");
      if (wraps.length < CARDS.length * 2) return;

      // Absolute document positions (offsetTop would resolve against a
      // positioned ancestor and double-count the sticky hero's height).
      const first = wraps[0].getBoundingClientRect();
      const second = wraps[CARDS.length].getBoundingClientRect();
      const period = second.top - first.top;
      if (period <= 0) return;

      const jumpAt = first.top + window.scrollY + period;
      if (window.scrollY >= jumpAt) {
        window.scrollTo(0, window.scrollY - period);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-content relative select-none bg-black text-white">
      {/* 3D black hole scene background */}
      <BlackholeScene3D />

      {/* Legibility scrim — anchors the hero copy over the bright accretion
          disk: horizontal on desktop (copy sits left), vertical on mobile
          (copy sits on top). */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.62)_48%,rgba(0,0,0,0.28)_72%,transparent_100%)] min-[1400px]:bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_38%,transparent_62%)]"
      />

      <LandingNav solid={navSolid} />

      <div className="relative z-10 flex flex-col pt-[96px] min-[1400px]:flex-row">
        {/* Hero — fixed on desktop while the cards scroll past on the right */}
        <div className="w-full lg:max-[1399px]:sticky lg:max-[1399px]:top-[96px] lg:max-[1399px]:z-30 lp-pinned-hero min-[1400px]:fixed min-[1400px]:left-0 min-[1400px]:top-[96px] min-[1400px]:h-[calc(100vh-96px)] min-[1400px]:w-[62%] min-[1400px]:overflow-y-auto min-[1400px]:overflow-x-hidden">
          <div className="flex w-full flex-col items-center justify-center px-6 py-12 sm:max-[1399px]:px-10 min-[1400px]:min-h-full min-[1400px]:items-end min-[1400px]:pb-[30vh] min-[1400px]:pl-4 min-[1400px]:pr-[min(24vw,calc(62vw-703px))] min-[1400px]:pt-8">
            {/* Right-anchored block: above 1440px its right edge rides at
                38vw; below, the block freezes at its 1440 size (see the type
                floors) and the anchor holds at 547px from the left so the
                middle gap absorbs the loss instead of the content shrinking.
                Text inside stays left-aligned. */}
            <div className="w-fit max-w-4xl space-y-8 min-[1400px]:max-w-none">
              <div className="space-y-6">
                <h1 className="whitespace-nowrap text-[clamp(2rem,10vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] min-[1400px]:text-[clamp(5.75rem,5vw,7rem)]">
                  {landingHero.headline}
                </h1>
                <p className="whitespace-nowrap text-[clamp(0.65rem,3.4vw,2.25rem)] leading-snug text-[var(--muted-foreground)] min-[1400px]:text-[clamp(1.8rem,1.6vw,2.5rem)]">
                  {landingHero.supporting}
                </p>
              </div>

              <ul className="space-y-4">
                {landingHero.supportingBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-3 whitespace-nowrap text-[clamp(0.6rem,2.7vw,1.4rem)] leading-relaxed text-[var(--muted-foreground)] min-[1400px]:text-[clamp(1.45rem,1.3vw,1.75rem)]"
                  >
                    <span className="inline-block size-1.5 shrink-0 rounded-full bg-[var(--foreground)]" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap">
                <Button asChild className="h-13 w-full px-7 text-[18px] sm:w-auto">
                  <a href="/trade">{landingHero.launchCta}</a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="h-13 w-full px-7 text-[18px] max-[1399px]:bg-black/45 sm:w-auto"
                >
                  <a href="/research/design-partners">{landingHero.secondaryCta}</a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="h-13 w-full px-7 text-[18px] max-[1399px]:bg-black/45 sm:w-auto"
                >
                  <a href="/research">{landingHero.researchCta}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards — scroll rail on the right */}
        <div
          ref={railRef}
          className="w-full space-y-24 px-6 pb-[60vh] pt-10 sm:max-[1399px]:px-10 lg:max-[1399px]:pt-0 lg:max-[1399px]:-mt-[37vh] min-[1400px]:ml-auto min-[1400px]:w-[calc(100%-719px)] min-[1400px]:space-y-0 min-[1400px]:pl-6 min-[1400px]:pr-16 min-[1400px]:pb-[20vh] min-[1400px]:pt-0 min-[1400px]:-mt-[6vh]"
        >
          {CARDS.map((card, index) => (
            <CardItem key={card.title} card={card} index={index} totalCards={CARDS.length} />
          ))}
          {/* second set feeds the desktop loop */}
          {CARDS.map((card, index) => (
            <CardItem
              key={`loop-${card.title}`}
              card={card}
              index={index}
              totalCards={CARDS.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
