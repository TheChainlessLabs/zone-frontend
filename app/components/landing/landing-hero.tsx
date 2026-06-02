import { ArrowDown, ArrowRight } from "lucide-react";
import { OmegaMark } from "@/components/OmegaMark";
import { landingHero } from "@/components/landing/content";
import { HeroAbstractField } from "@/components/landing/hero-abstract-field";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section
      id="top"
      data-landing-hero
      className="relative min-h-[168dvh] bg-[var(--background)] text-[var(--foreground)]"
    >
      <div className="sticky top-0 min-h-dvh overflow-hidden px-4 py-6 md:px-8 md:py-8">
        <HeroAbstractField />

        <nav className="relative z-[1] mx-auto flex max-w-7xl items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-[var(--foreground)] transition-colors duration-[var(--duration-small)] ease-[var(--ease-out)] hover:text-[var(--foreground)]"
            aria-label="Omega Markets"
          >
            <OmegaMark size={18} />
            <span>OMEGA</span>
          </a>
          <a
            href="#request-access"
            className="transition-colors duration-[var(--duration-small)] ease-[var(--ease-out)] hover:text-[var(--foreground)]"
          >
            Request Access
          </a>
        </nav>

        <div className="relative z-[1] mx-auto flex min-h-[calc(100dvh-96px)] max-w-7xl items-center justify-center py-16 text-center">
          <div className="mx-auto max-w-5xl opacity-[var(--hero-copy-opacity,1)] will-change-[opacity]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color-mix(in_oklab,var(--foreground)_72%,var(--muted-foreground))] [text-shadow:0_2px_12px_rgba(0,0,0,0.92),0_0_28px_rgba(0,0,0,0.82)]">
              Private order flow. Public proof.
            </p>
            <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-semibold leading-[0.96] tracking-normal text-[var(--foreground)] [text-shadow:0_8px_32px_rgba(0,0,0,0.66),0_0_56px_rgba(0,0,0,0.5)] md:text-7xl lg:text-8xl">
              {landingHero.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[color-mix(in_oklab,var(--foreground)_84%,var(--muted-foreground))] [text-shadow:0_2px_12px_rgba(0,0,0,0.92),0_0_28px_rgba(0,0,0,0.82)] md:text-lg">
              {landingHero.supporting}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <a href="#request-access">
                  {landingHero.primaryCta}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#mechanism">
                  {landingHero.secondaryCta}
                  <ArrowDown aria-hidden className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
