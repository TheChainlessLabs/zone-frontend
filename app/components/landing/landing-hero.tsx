import { landingHero } from "@/components/landing/content";
import { HeroAbstractField } from "@/components/landing/hero-abstract-field";
import { Button } from "@/components/ui/button";

// A tile on the status bar, carrying one live testnet figure. The 2026-08-19
// pass-2 design dropped the two toned proof-stat tiles, so every tile on the
// surface now reads the same and the `tone` axis has gone with them.
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

// One-screen identity frame: copy hung from the top of the viewport with the
// status bar pinned to the bottom of it. At lg the status bar is a wide
// two-column strip; below lg it stacks into the same rail it always was.
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

      {/* hero body — copy at the top, status bar at the bottom. At lg the
          container drops its inner padding so the copy lines up with the
          nav's own 1240 edge. */}
      <div className="relative z-[2] mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 pb-10 pt-[72px] sm:px-8 sm:pb-12 sm:pt-[88px] lg:px-0 lg:pb-16 lg:pt-[98px]">
        <div className="text-left">
          <span className="lp-fade s1 font-mono text-[11px] uppercase tracking-[0.24em] text-[color-mix(in_oklab,var(--foreground)_82%,transparent)] [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {landingHero.eyebrow}
          </span>
          <h1 className="lp-fade s2 mt-4 text-balance text-[clamp(38px,12vw,52px)] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--foreground)] [text-shadow:0_2px_28px_rgba(0,0,0,0.58)] sm:mt-5 sm:text-[clamp(40px,7vw,95px)]">
            {landingHero.headline}
          </h1>
          <p className="lp-fade s3 mt-4 text-pretty text-[18px] leading-[1.65] text-[color-mix(in_oklab,var(--foreground)_78%,transparent)] [text-shadow:0_1px_16px_rgba(0,0,0,0.6)] sm:mt-6 lg:max-w-[559px] lg:text-[22px]">
            {landingHero.supporting}
          </p>

          {/* Desktop-only CTA block. Below lg the design carries the same
              three actions in the nav instead, which is fixed and therefore
              always reachable — so the hero does not repeat them. */}
          <div className="lp-fade s4 mt-6 hidden sm:mt-9 lg:mt-10 lg:grid lg:grid-cols-[200px_150px] lg:gap-x-[44px] lg:gap-y-8">
            <Button asChild size="lg" className="h-12 w-full px-[22px] text-[15px]">
              <a href="/trade">{landingHero.primaryCta}</a>
            </Button>
            <Button asChild size="lg" className="h-12 w-full px-[22px] text-[15px]">
              <a href="/trade">{landingHero.launchCta}</a>
            </Button>
            <Button
              asChild
              variant="glass"
              size="lg"
              className="h-12 w-full px-[22px] text-[15px]"
            >
              <a href="/research/design-partners">{landingHero.secondaryCta}</a>
            </Button>
          </div>
        </div>

        {/* Status bar. At lg it is an 832-wide strip centred on the floor of
            the hero: a 194px identity column on the left, and on the right the
            mechanism steps over the live testnet figures. The lower-left cell
            is deliberately empty — the 2026-08-19 pass-2 design removed the
            proof-stat tiles that used to sit there. Below lg the three blocks
            stack in DOM order, which is the mobile Proof Rail 10:38. */}
        <aside className="lp-fade s4 glass mt-10 rounded-[var(--radius-2xl)] p-4 sm:mt-12 sm:p-6 lg:mx-auto lg:mt-auto lg:grid lg:w-full lg:max-w-[832px] lg:grid-cols-[194px_minmax(0,1fr)] lg:gap-x-2 lg:gap-y-[31px]">
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start lg:gap-6">
              <span className="font-mono text-[13px] font-medium text-[var(--foreground)] sm:text-[14px]">
                {landingHero.proofLabel}
              </span>
              {/* --warning is a carve-out in app/app/styles/tokens.css; Figma
                  draws this pill from accents/orange, which is not an Omega
                  variable. */}
              <span className="shrink-0 rounded-full border border-[var(--warning)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--warning)]">
                {landingHero.proofBadge}
              </span>
            </div>
            <div
              aria-hidden
              className="mt-4 h-px w-full bg-[var(--glass-edge)] lg:hidden"
            />
          </div>

          <ol className="mt-4 grid grid-cols-3 gap-3 sm:mt-5 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:flex lg:items-center lg:gap-6">
            {landingHero.proofSteps.map((step, index) => (
              <li
                key={step}
                className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3"
              >
                <span className="flex size-7 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[var(--muted-foreground)] font-mono text-[10px] text-[var(--primary-foreground)] shadow-[inset_0_1px_0_0_var(--glass-highlight)] lg:size-[34px] lg:text-[11px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-medium leading-tight text-[var(--foreground)] sm:text-[13px] lg:whitespace-nowrap lg:text-[14px]">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          {/* live testnet figures — three since 2026-08-19, so they take the
              same 3-up rhythm as the steps above them at every breakpoint. */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3 lg:col-start-2 lg:row-start-2 lg:mt-0 lg:gap-[34px]">
            {landingHero.liveStats.map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </aside>
      </div>
    </header>
  );
}
