import { ArrowDown, ArrowRight } from "lucide-react";

import { landingHero } from "@/components/landing/content";
import { HeroAbstractField } from "@/components/landing/hero-abstract-field";
import { Button } from "@/components/ui/button";

// Hero (app.jsx Hero) — full-bleed blackhole field with centered copy: mono
// eyebrow, headline, supporting line, a single Request Access button, and a
// scroll hint. The sticky nav is rendered by the page, above this section.
export function LandingHero() {
  return (
    <header
      id="top"
      data-landing-hero
      className="relative flex min-h-screen flex-col"
      style={{
        background:
          "linear-gradient(to bottom, #000 0%, #000 45%, var(--background) 100%)",
      }}
    >
      <HeroAbstractField />

      {/* hero body — centered over the full-bleed graphic */}
      <div className="relative z-[2] flex flex-1 flex-col items-center justify-center px-8 pb-10 text-center">
        <span className="lp-fade s1 font-mono text-[12px] uppercase tracking-[0.22em] text-[var(--foreground)] opacity-85 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
          {landingHero.eyebrow}
        </span>
        <h1 className="lp-fade s2 mt-5 max-w-[920px] text-[clamp(34px,5.2vw,60px)] font-semibold leading-[1.06] tracking-[-0.03em] text-[var(--foreground)] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
          {landingHero.headline}
        </h1>
        <p className="lp-fade s3 mt-6 max-w-[640px] text-[18px] leading-[1.6] text-[color-mix(in_oklab,var(--foreground)_82%,transparent)] [text-shadow:0_1px_16px_rgba(0,0,0,0.6)]">
          {landingHero.supporting}
        </p>
        <div className="lp-fade s4 mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-12 px-[22px] text-[15px]">
            <a href="#request">
              {landingHero.primaryCta}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="lp-fade s4 relative z-[2] flex items-center justify-center gap-2.5 pb-7 text-[var(--muted-foreground)]">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
          {landingHero.scrollHint}
        </span>
        <ArrowDown aria-hidden className="size-3.5" />
      </div>
    </header>
  );
}
