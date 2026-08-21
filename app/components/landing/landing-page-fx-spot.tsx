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
    badge: "✓",
  },
];

function CardItem({ card, index, totalCards }: { card: typeof CARDS[0]; index?: number; totalCards?: number }) {
  const cardRef = useCardScrollAnimation(index ?? 0, totalCards ?? CARDS.length);

  return (
    <div ref={cardRef} className="flex-shrink-0 w-full lg:h-[60vh] h-auto flex items-center justify-center min-h-fit">
      <div className="w-full rounded-xl border-4 border-red-600 p-8 space-y-6 flex flex-col justify-center bg-black">
        <div className="space-y-3">
          <h2 className="text-4xl font-semibold text-[var(--foreground)]">{card.title}</h2>
          <p className="text-lg text-[var(--muted-foreground)]">{card.description}</p>
        </div>
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-lg bg-transparent border-2 border-red-600 flex items-center justify-center text-[var(--foreground)] text-lg font-semibold">
            {card.badge}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPageFXSpot() {
  const [navSolid, setNavSolid] = React.useState(false);
  const cardsContainerRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const handleCarouselScroll = () => {
      // Get card height (viewport minus navbar)
      const cardHeight = 60 * window.innerHeight / 100; // 60vh in pixels
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.scrollHeight;

      // Calculate when user has scrolled through all cards
      // Reset carousel when scrolled near the end
      const pageScrollTop = window.scrollY;
      const containerPageTop = container.offsetTop;
      const scrollProgress = pageScrollTop - containerPageTop + window.innerHeight;

      if (scrollProgress > containerHeight - cardHeight) {
        container.scrollTop = 0;
      }
    };

    window.addEventListener("scroll", handleCarouselScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleCarouselScroll);
  }, []);

  return (
    <div className="bg-black text-white relative select-none">
      {/* 3D Black hole scene background */}
      <BlackholeScene3D />

      <LandingNav solid={navSolid} />

      <div className="flex flex-col lg:flex-row pt-[72px] relative z-10">
        {/* Left side - responsive */}
        <div className="w-full lg:w-[50%] lg:h-[calc(100vh-72px)] lg:fixed lg:left-0 lg:top-[72px] lg:overflow-y-auto lg:pr-8" style={{ marginLeft: 'clamp(2rem, 4vw, 10rem)', marginTop: 'clamp(0rem, 2vw, 1rem)' }}>
          <div className="w-full pl-4 sm:pl-8 lg:pl-12 lg:pl-16 pr-4 sm:pr-8 lg:pr-6 lg:pr-8 py-8 flex flex-col justify-center">
            <div className="space-y-6 w-full max-w-full">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold leading-tight tracking-[-0.02em] break-words hyphens-auto max-w-full">
                  {landingHero.headline}
                </h1>
                <p className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl leading-relaxed text-[var(--muted-foreground)]">
                  {landingHero.supporting}
                </p>
              </div>

              <ul className="space-y-4">
                {landingHero.supportingBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl leading-relaxed text-[var(--muted-foreground)]">
                    <span className="mt-1.5 inline-block size-1.5 rounded-full bg-[var(--foreground)] flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4">
                <Button asChild className="w-full sm:w-auto h-12 px-6 text-base sm:text-lg">
                  <a href="/trade">{landingHero.launchCta}</a>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto h-12 px-6 text-base sm:text-lg">
                  <a href="/research/design-partners">{landingHero.secondaryCta}</a>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto h-12 px-6 text-base sm:text-lg">
                  <a href="/research">{landingHero.researchCta}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - infinite carousel cards extending down */}
        <div
          ref={cardsContainerRef}
          className="w-full lg:w-[40%] lg:ml-auto pt-40 sm:pt-56 lg:px-12"
          style={{ marginTop: 'calc(-35vh)' }}
        >
          {CARDS.map((card, index) => (
            <CardItem key={index} card={card} index={index} totalCards={CARDS.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
