"use client";

import { landingHero } from "@/components/landing/content";
import { OmegaMark } from "@/components/OmegaMark";
import { Button } from "@/components/ui/button";

// Sticky landing nav (app.jsx Nav). Transparent over the hero, then blurred
// and bordered once scrolled past the hero top. `solid` is driven by the page.
export function LandingNav({ solid, hideButtons = false }: { solid: boolean; hideButtons?: boolean }) {
  return (
    <nav
      data-testid="landing-nav"
      className="fixed inset-x-0 top-0 z-50 flex justify-start px-4 transition-[background,border-color] duration-[var(--duration-medium)] sm:px-5 lg:pl-16"
      style={{
        borderBottom: solid ? "1px solid var(--border)" : "1px solid transparent",
        background: solid
          ? "color-mix(in oklab, var(--background) 80%, transparent)"
          : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        WebkitBackdropFilter: solid ? "blur(12px)" : "none",
      }}
    >
      <div
        className="flex w-full max-w-none items-center justify-between transition-[padding] duration-[var(--duration-medium)] sm:px-3"
        style={{ paddingBlock: solid ? 16 : 26, paddingRight: "1.25rem" }}
      >
        <a
          href="/"
          className="inline-flex items-center gap-3 text-[var(--foreground)] no-underline"
          aria-label="Omega Markets"
        >
          <OmegaMark size={28} />
          <span className="hidden font-wordmark text-[15px] font-semibold uppercase tracking-[0.12em] min-[480px]:inline sm:text-[18px]">
            Omega Markets
          </span>
        </a>
        {!hideButtons && (
          <div className="flex items-center gap-2.5 sm:gap-7">
            <Button
              asChild
              variant="secondary"
              className="h-10 px-3.5 text-[13px] sm:h-11 sm:px-6 sm:text-[16px]"
            >
              <a href="/research">{landingHero.researchCta}</a>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-10 px-3.5 text-[13px] sm:h-11 sm:px-6 sm:text-[16px]"
            >
              <a href="/research/design-partners">{landingHero.secondaryCta}</a>
            </Button>
            <Button asChild className="h-10 px-3.5 text-[13px] sm:h-11 sm:px-6 sm:text-[16px]">
              <a href="/trade">{landingHero.launchCta}</a>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
