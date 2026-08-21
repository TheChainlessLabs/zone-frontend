"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { landingHero } from "@/components/landing/content";
import { useCardScrollAnimation } from "@/hooks/useCardScrollAnimation";
import { BlackholeScene3D } from "@/components/landing/blackhole-scene-3d";

const CARDS = [
  {
    title: "Private Execution",
    description: "Intent stays hidden from external market makers and bots",
    badge: "01",
  },
  {
    title: "Institutional Rates",
    description: "Midpoint pricing without information leakage or slippage",
    badge: "02",
  },
  {
    title: "Verifiable Settlement",
    description: "Cryptographic proof of correct settlement without compromising privacy",
    badge: "03",
  },
  {
    title: "Zero-Knowledge Infrastructure",
    description: "TEE-attested on-chain settlement with no pre-trade visibility",
    badge: "04",
  },
  {
    title: "Ready to Trade?",
    description: "Join design partners and developers building on Omega",
    badge: null,
  },
] as const;

function CardItem({
  card,
  index,
  totalCards,
  duplicate = false,
}: {
  card: (typeof CARDS)[number];
  index: number;
  totalCards: number;
  duplicate?: boolean;
}) {
  const cardRef = useCardScrollAnimation(index, totalCards);

  return (
    <div
      ref={cardRef}
      data-card-wrap
      className={`${duplicate ? "hidden lg:flex" : "flex"} w-full items-center justify-center lg:h-[60vh]`}
    >
      <div
        data-card-slide
        className="glass w-full space-y-6 rounded-[20px] p-8 lg:p-10"
      >
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[var(--foreground)] lg:text-4xl">
            {card.title}
          </h2>
          <p className="text-base leading-relaxed text-[var(--muted-foreground)] lg:text-lg">
            {card.description}
          </p>
        </div>
        {card.badge ? (
          <div className="flex size-11 items-center justify-center rounded-[10px] border border-[var(--glass-edge)] font-mono text-sm text-[var(--muted-foreground)]">
            {card.badge}
          </div>
        ) : (
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
    const desktop = window.matchMedia("(min-width: 1024px)");

    const onScroll = () => {
      if (!desktop.matches) return;
      const rail = railRef.current;
      if (!rail) return;

      const wraps = rail.querySelectorAll<HTMLElement>("[data-card-wrap]");
      if (wraps.length < CARDS.length * 2) return;

      const period = wraps[CARDS.length].offsetTop - wraps[0].offsetTop;
      if (period <= 0) return;

      const railTop = rail.getBoundingClientRect().top + window.scrollY;
      const jumpAt = railTop + wraps[0].offsetTop + period;
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
        className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.62)_48%,rgba(0,0,0,0.28)_72%,transparent_100%)] lg:bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_38%,transparent_62%)]"
      />

      <LandingNav solid={navSolid} />

      <div className="relative z-10 flex flex-col pt-[96px] lg:flex-row">
        {/* Hero — fixed on desktop while the cards scroll past on the right */}
        <div className="w-full lg:fixed lg:left-0 lg:top-[96px] lg:h-[calc(100vh-96px)] lg:w-[62%] lg:overflow-y-auto lg:overflow-x-hidden">
          <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:min-h-full lg:pb-[22vh] lg:pl-20 lg:pr-10 lg:pt-8 xl:pl-28">
            <div className="w-full max-w-4xl space-y-8">
              <div className="space-y-6">
                <h1 className="whitespace-nowrap text-[clamp(2rem,10vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] lg:text-[clamp(3.5rem,6vw,6.5rem)]">
                  {landingHero.headline}
                </h1>
                <p className="whitespace-nowrap text-[clamp(0.65rem,3.4vw,2.25rem)] leading-snug text-[var(--muted-foreground)] lg:text-[clamp(1.25rem,1.85vw,2.5rem)]">
                  {landingHero.supporting}
                </p>
              </div>

              <ul className="space-y-4">
                {landingHero.supportingBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-3 whitespace-nowrap text-[clamp(0.6rem,2.7vw,1.4rem)] leading-relaxed text-[var(--muted-foreground)] lg:text-[clamp(0.95rem,1.6vw,1.75rem)]"
                  >
                    <span className="inline-block size-1.5 shrink-0 rounded-full bg-[var(--foreground)]" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button asChild className="h-12 w-full px-6 text-base sm:w-auto">
                  <a href="/trade">{landingHero.launchCta}</a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="h-12 w-full px-6 text-base max-lg:bg-black/45 sm:w-auto"
                >
                  <a href="/research/design-partners">{landingHero.secondaryCta}</a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="h-12 w-full px-6 text-base max-lg:bg-black/45 sm:w-auto"
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
          className="w-full space-y-8 px-6 pb-24 pt-20 sm:px-10 lg:ml-auto lg:w-[38%] lg:space-y-0 lg:px-12 lg:pb-[20vh] lg:pt-[14vh]"
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
              duplicate
            />
          ))}
        </div>
      </div>
    </div>
  );
}
