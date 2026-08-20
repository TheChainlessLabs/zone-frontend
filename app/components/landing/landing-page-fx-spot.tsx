"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { OrderScrollStory } from "@/components/landing/order-scroll-story";
import { SignupModal } from "@/components/landing/signup-modal";
import { landingHero, whoIsOmega, whyOmega, signupOptions } from "@/components/landing/content";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function LandingPageFXSpot() {
  const [navSolid, setNavSolid] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [hideScrollHint, setHideScrollHint] = React.useState(false);
  const whoRef = useScrollReveal();
  const whyRef = useScrollReveal();
  const mechanismRef = useScrollReveal();
  const footerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const hasVisited = sessionStorage.getItem("omega_landing_visited");
    if (!hasVisited) {
      setShowSignupModal(true);
      sessionStorage.setItem("omega_landing_visited", "true");
    }
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHideScrollHint(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <main className="relative isolate min-h-[100dvh] bg-black text-[var(--foreground)]">
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
      <div className="lp-content relative z-[1]">
        <LandingNav solid={navSolid} />

        {/* Hero Section */}
        <section className="mx-auto w-full max-w-[1240px] px-4 py-20 sm:px-8 sm:py-28 min-h-screen flex items-center">
          <div className="grid gap-24 lg:grid-cols-[1fr_380px]">
            {/* Left: Hero Copy */}
            <div className="flex flex-col justify-center">
              <h1 className="text-balance text-[clamp(48px,8vw,72px)] font-semibold leading-[0.96] tracking-[-0.055em]">
                {landingHero.headline}
              </h1>
              <p className="mt-6 max-w-[700px] text-pretty text-[16px] leading-[1.65] text-[var(--foreground)] sm:text-[18px]">
                {landingHero.supporting}
              </p>
              <ul className="mt-4 max-w-[560px] space-y-2">
                {landingHero.supportingBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[15px] leading-[1.6] text-[var(--muted-foreground)] sm:text-[16px]">
                    <span className="mt-1.5 inline-block size-1.5 rounded-full bg-[var(--foreground)] flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex w-fit flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <a href="/trade">{landingHero.launchCta}</a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href="/research/design-partners">{landingHero.secondaryCta}</a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href="/research">{landingHero.researchCta}</a>
                </Button>
              </div>
            </div>

            {/* Right: Proof Rail */}
            <div className="max-w-[380px] bg-transparent flex flex-col divide-y divide-[var(--foreground)]/20">
              <div className="flex items-center justify-between px-0 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]">
                  {landingHero.proofLabel}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]">
                  {landingHero.proofBadge}
                </span>
              </div>

              <div className="flex-1 divide-y divide-[var(--foreground)]/20 flex flex-col">
                {landingHero.proofSteps.map((step, index) => (
                  <div key={step.stat} className="px-0 py-4 space-y-2 flex flex-col justify-center flex-1">
                    <div className="flex items-baseline gap-2 justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--foreground)]">
                        {String(index + 1).padStart(2, "0")} · {step.stat}
                      </span>
                      <span className="font-mono text-[16px] font-semibold text-[var(--foreground)]">
                        {step.value}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--foreground)] leading-tight">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Hint */}
        {!hideScrollHint && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center pointer-events-none z-10">
            <div className="flex flex-col items-center gap-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                Scroll to learn more
              </p>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--muted-foreground)]">
                <path d="M8 2V12M8 12L4 8M8 12L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Who is Omega For */}
        <section ref={whoRef} className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-8 sm:py-24 opacity-0 translate-y-4 transition-all duration-700 ease-out">
          <div className="mb-12">
            <h2 className="text-[clamp(32px,5vw,48px)] font-semibold leading-[0.96] tracking-[-0.045em]">
              {whoIsOmega.title}
            </h2>
            <p className="mt-4 text-[18px] leading-[1.6] text-[var(--muted-foreground)]">
              {whoIsOmega.subtitle}
            </p>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)]">
            <div className="grid gap-px sm:grid-cols-2 bg-[var(--border)]">
              {whoIsOmega.users.map((user) => (
                <div
                  key={user.name}
                  className="bg-[var(--card)] p-8"
                >
                  <h3 className="text-[16px] font-semibold leading-[1.2]">
                    {user.name}
                  </h3>
                  <p className="mt-4 text-[14px] leading-[1.6] text-[var(--muted-foreground)]">
                    {user.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Trade on Omega */}
        <section ref={whyRef} className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-8 sm:py-24 opacity-0 translate-y-4 transition-all duration-700 ease-out">
          <div className="mb-12">
            <h2 className="text-[clamp(32px,5vw,48px)] font-semibold leading-[0.96] tracking-[-0.045em]">
              {whyOmega.title}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyOmega.benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <p className="text-[15px] font-medium leading-[1.4]">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mechanism */}
        <section ref={mechanismRef} className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-8 sm:py-24 opacity-0 translate-y-4 transition-all duration-700 ease-out">
          <div className="mb-12">
            <h2 className="text-[clamp(32px,5vw,48px)] font-semibold leading-[0.96] tracking-[-0.045em]">
              How Omega works
            </h2>
          </div>
          <OrderScrollStory />
        </section>


        {/* Footer */}
        <footer ref={footerRef} className="border-t border-[var(--border)] py-8 px-4 text-center sm:px-8">
          <p className="text-[12px] text-[var(--muted-foreground)]">
            © 2025 Omega Markets · Private FX execution · Atomic settlement
          </p>
        </footer>
      </div>
    </main>
  );
}
