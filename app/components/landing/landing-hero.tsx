import { ArrowDown, ArrowRight } from "lucide-react";

import { landingHero } from "@/components/landing/content";
import { HeroAbstractField } from "@/components/landing/hero-abstract-field";
import { Button } from "@/components/ui/button";

// Hero (app.jsx Hero) — full-bleed blackhole field with asymmetric copy:
// editorial left rail, proof card, and scroll hint. The sticky nav is rendered
// by the page, above this section.
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
      <div className="relative z-[2] mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 items-end gap-10 px-4 pb-12 pt-32 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.58fr)] lg:pb-16 lg:pt-40">
        <div className="max-w-[720px] pb-4 text-left lg:pb-12">
          <span className="lp-fade s1 font-mono text-[11px] uppercase tracking-[0.24em] text-[color-mix(in_oklab,var(--foreground)_82%,transparent)] [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {landingHero.eyebrow}
          </span>
          <h1 className="lp-fade s2 mt-5 text-balance text-[clamp(40px,7vw,84px)] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--foreground)] [text-shadow:0_2px_28px_rgba(0,0,0,0.58)]">
            {landingHero.headline}
          </h1>
          <p className="lp-fade s3 mt-6 max-w-[560px] text-pretty text-[17px] leading-[1.65] text-[color-mix(in_oklab,var(--foreground)_78%,transparent)] [text-shadow:0_1px_16px_rgba(0,0,0,0.6)] sm:text-[18px]">
            {landingHero.supporting}
          </p>
          <div className="lp-fade s4 mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 px-[22px] text-[15px]">
              <a href="#request">
                {landingHero.primaryCta}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="glass"
              size="lg"
              className="h-12 px-[20px] text-[15px]"
            >
              <a href="/trade">{landingHero.secondaryCta}</a>
            </Button>
          </div>
        </div>

        <aside className="lp-fade s4 glass mb-2 rounded-[var(--radius-2xl)] p-5 sm:p-6 lg:mb-14">
          <div className="flex items-center justify-between gap-5 border-b border-[var(--glass-edge)] pb-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {landingHero.proofLabel}
            </span>
            <span className="rounded-full border border-[var(--glass-edge)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--foreground)]">
              Live alpha
            </span>
          </div>
          <ol className="mt-5 space-y-3">
            {landingHero.proofSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[34px_1fr] items-center gap-3">
                <span className="flex size-[34px] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[var(--glass-fill)] font-mono text-[11px] text-[var(--foreground)] shadow-[inset_0_1px_0_0_var(--glass-highlight)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[14px] font-medium text-[var(--foreground)]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {landingHero.proofStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[color-mix(in_oklab,var(--background)_72%,transparent)] p-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  {stat.label}
                </p>
                <p className="mt-2 text-[18px] font-semibold tracking-[-0.02em]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="lp-fade s4 relative z-[2] mx-auto flex w-full max-w-[1240px] items-center justify-start gap-2.5 px-4 pb-7 text-[var(--muted-foreground)] sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
          {landingHero.scrollHint}
        </span>
        <ArrowDown aria-hidden className="size-3.5" />
      </div>
    </header>
  );
}
