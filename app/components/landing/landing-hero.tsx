import { ArrowRight } from "lucide-react";

import { landingHero } from "@/components/landing/content";
import { HeroAbstractField } from "@/components/landing/hero-abstract-field";
import { Button } from "@/components/ui/button";

// One-screen identity frame with asymmetric copy and a compact proof rail.
export function LandingHero() {
  return (
    <header
      id="top"
      data-landing-hero
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #050505 0%, #050505 48%, var(--background) 100%)",
      }}
    >
      <HeroAbstractField />

      {/* hero body — asymmetrically pinned over the full-bleed graphic */}
      <div className="relative z-[2] mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-end gap-5 px-4 pb-5 pt-24 sm:gap-8 sm:px-8 sm:pb-10 sm:pt-32 lg:grid-cols-[1.2fr_minmax(340px,0.55fr)] lg:gap-10 lg:pb-16 lg:pt-40 overflow-hidden">
        <div className="max-w-[900px] text-left lg:pb-12 overflow-visible">
          <span className="lp-fade s1 font-mono text-[11px] uppercase tracking-[0.24em] text-[color-mix(in_oklab,var(--foreground)_82%,transparent)] [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {landingHero.eyebrow}
          </span>
          <h1 className="lp-fade s2 mt-4 text-balance text-[clamp(38px,12vw,52px)] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--foreground)] [text-shadow:0_2px_28px_rgba(0,0,0,0.58)] sm:mt-5 sm:text-[clamp(40px,7vw,84px)]">
            {landingHero.headline}
          </h1>
          <p className="lp-fade s3 mt-4 max-w-[560px] text-pretty text-[15px] leading-[1.55] text-[color-mix(in_oklab,var(--foreground)_78%,transparent)] [text-shadow:0_1px_16px_rgba(0,0,0,0.6)] sm:mt-6 sm:text-[18px] sm:leading-[1.65]">
            {landingHero.supporting}
          </p>
          <div className="lp-fade s4 mt-6 flex flex-nowrap items-center gap-2 sm:mt-9 sm:gap-3">
            <Button asChild size="lg" className="h-10 px-3 text-[13px] sm:h-12 sm:px-[22px] sm:text-[15px]">
              <a href="/trade">
                {landingHero.primaryCta}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="glass"
              size="lg"
              className="h-10 px-3 text-[13px] sm:h-12 sm:px-[20px] sm:text-[15px]"
            >
              <a href="/research/design-partners">{landingHero.secondaryCta}</a>
            </Button>
          </div>
        </div>

        <aside className="lp-fade s4 glass rounded-[var(--radius-2xl)] p-4 sm:p-6 lg:mb-14">
          <div className="flex items-center justify-between gap-5 border-b border-[var(--glass-edge)] pb-3 sm:pb-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {landingHero.proofLabel}
            </span>
            <span className="rounded-full border border-[var(--glass-edge)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--foreground)]">
              Live alpha
            </span>
          </div>
          <ol className="mt-4 space-y-2 lg:mt-5 lg:space-y-3">
            {landingHero.proofSteps.map((step, index) => (
              <li key={step.stat} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] font-semibold text-[var(--foreground)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-[var(--foreground)]">
                    {step.description}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 pl-5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] font-medium text-[var(--muted-foreground)]">
                    {step.stat}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[var(--foreground)]">
                    {step.value}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

    </header>
  );
}
