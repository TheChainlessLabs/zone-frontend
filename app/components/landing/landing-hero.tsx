import { ArrowRight } from "lucide-react";

import { landingHero } from "@/components/landing/content";
import { HeroAbstractField } from "@/components/landing/hero-abstract-field";
import { Button } from "@/components/ui/button";

// A tile on the status panel — used for both the live testnet figures and the
// proof stats below the mechanism steps.
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[color-mix(in_oklab,var(--background)_72%,transparent)] p-2.5 sm:p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.02em] sm:mt-2 sm:text-[18px]">
        {value}
      </p>
    </div>
  );
}

// One-screen identity frame: copy pinned to the top of the viewport with the
// status panel alongside it at lg, stacked beneath it below.
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

      {/* hero body — copy column and status panel, both hung from the top of
          the frame. At lg the container drops its inner padding so the copy
          lines up with the nav's own 1240 edge. */}
      <div className="relative z-[2] mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 items-start gap-8 px-4 pb-10 pt-[72px] sm:gap-10 sm:px-8 sm:pb-12 sm:pt-[88px] lg:grid-cols-[minmax(0,1fr)_519px] lg:gap-10 lg:px-0 lg:pb-16 lg:pt-[98px]">
        <div className="max-w-[553px] text-left">
          <span className="lp-fade s1 font-mono text-[11px] uppercase tracking-[0.24em] text-[color-mix(in_oklab,var(--foreground)_82%,transparent)] [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {landingHero.eyebrow}
          </span>
          <h1 className="lp-fade s2 mt-4 text-balance text-[clamp(38px,12vw,52px)] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--foreground)] [text-shadow:0_2px_28px_rgba(0,0,0,0.58)] sm:mt-5 sm:text-[clamp(40px,7vw,84px)]">
            {landingHero.headline}
          </h1>
          <p className="lp-fade s3 mt-4 text-pretty text-[15px] leading-[1.55] text-[color-mix(in_oklab,var(--foreground)_78%,transparent)] [text-shadow:0_1px_16px_rgba(0,0,0,0.6)] sm:mt-6 sm:text-[18px] sm:leading-[1.65]">
            {landingHero.supporting}
          </p>
          <div className="lp-fade s4 mt-6 flex flex-wrap items-center gap-2 sm:mt-9 sm:gap-3">
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
            <Button asChild size="lg" className="h-10 px-3 text-[13px] sm:h-12 sm:px-[22px] sm:text-[15px]">
              <a href="/trade">{landingHero.launchCta}</a>
            </Button>
          </div>
        </div>

        <aside className="lp-fade s4 glass rounded-[var(--radius-2xl)] p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--glass-edge)] pb-3 sm:pb-4">
            <span className="font-mono text-[13px] font-medium text-[var(--foreground)] sm:text-[14px]">
              {landingHero.proofLabel}
            </span>
            <span className="shrink-0 rounded-full border border-[var(--glass-edge)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--foreground)]">
              {landingHero.proofBadge}
            </span>
          </div>

          {/* live testnet figures */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
            {landingHero.liveStats.map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>

          <ol className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 lg:block lg:space-y-3">
            {landingHero.proofSteps.map((step, index) => (
              <li key={step} className="flex flex-col items-start gap-2 lg:grid lg:grid-cols-[34px_1fr] lg:items-center lg:gap-3">
                <span className="flex size-7 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[var(--glass-fill)] font-mono text-[10px] text-[var(--foreground)] shadow-[inset_0_1px_0_0_var(--glass-highlight)] lg:size-[34px] lg:text-[11px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-medium leading-tight text-[var(--foreground)] sm:text-[13px] lg:text-[14px]">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
            {landingHero.proofStats.map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </aside>
      </div>
    </header>
  );
}
