"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { landingHero } from "@/components/landing/content";

export function LandingPageFXSpot() {
  const [navSolid, setNavSolid] = React.useState(false);

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

  return (
    <div className="bg-black text-white">
      <LandingNav solid={navSolid} />

      <div className="flex pt-[72px]">
        {/* Left side - fixed */}
        <div className="fixed left-0 top-[72px] w-[45%] h-[calc(100vh-72px)] border-r border-[var(--border)] flex items-center overflow-y-auto">
          <div className="w-full pl-8 lg:pl-12 pr-4 lg:pr-6 py-8 flex flex-col justify-center">
            <div className="space-y-4 w-full">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-[-0.02em]">
                  {landingHero.headline}
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--muted-foreground)]">
                  {landingHero.supporting}
                </p>
              </div>

              <ul className="space-y-3">
                {landingHero.supportingBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
                    <span className="mt-1.5 inline-block size-1 rounded-full bg-[var(--foreground)] flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                <Button asChild className="w-full sm:w-auto h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]">
                  <a href="/trade">{landingHero.launchCta}</a>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]">
                  <a href="/research/design-partners">{landingHero.secondaryCta}</a>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]">
                  <a href="/research">{landingHero.researchCta}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - scrollable cards */}
        <div className="ml-auto w-[55%]">
          {/* Card 1 */}
          <div className="h-[calc(100vh-72px)] border-b border-[var(--border)] flex items-center justify-center p-4">
            <div className="w-full h-full bg-black rounded-xl border border-[var(--border)] p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Private Execution</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Intent stays hidden from external market makers and bots</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">01</div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="h-[calc(100vh-72px)] border-b border-[var(--border)] flex items-center justify-center p-4">
            <div className="w-full h-full bg-black rounded-xl border border-[var(--border)] p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Institutional Rates</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Midpoint pricing without information leakage or slippage</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">02</div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="h-[calc(100vh-72px)] border-b border-[var(--border)] flex items-center justify-center p-4">
            <div className="w-full h-full bg-black rounded-xl border border-[var(--border)] p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Verifiable Settlement</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Cryptographic proof of correct settlement without compromising privacy</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">03</div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="h-[calc(100vh-72px)] border-b border-[var(--border)] flex items-center justify-center p-4">
            <div className="w-full h-full bg-black rounded-xl border border-[var(--border)] p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Zero-Knowledge Infrastructure</h2>
                <p className="text-sm text-[var(--muted-foreground)]">TEE-attested on-chain settlement with no pre-trade visibility</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">04</div>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="h-[calc(100vh-72px)] flex items-center justify-center p-4">
            <div className="w-full h-full bg-black rounded-xl border border-[var(--border)] p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Ready to Trade?</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Join design partners and developers building on Omega</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
