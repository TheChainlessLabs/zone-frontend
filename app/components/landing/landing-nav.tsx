"use client";

import { landingHero } from "@/components/landing/content";
import { OmegaMark } from "@/components/OmegaMark";
import { Button } from "@/components/ui/button";

// Sticky landing nav (app.jsx Nav). Transparent over the hero, then blurred
// and bordered once scrolled past the hero top. `solid` is driven by the page.
export function LandingNav({ solid }: { solid: boolean }) {
  return (
    <nav
      data-testid="landing-nav"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 transition-[background,border-color] duration-[var(--duration-medium)] sm:px-5"
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
        className="flex w-full max-w-[1240px] items-center justify-between transition-[padding] duration-[var(--duration-medium)] sm:px-3 lg:px-0"
        style={{ paddingBlock: solid ? 12 : 18 }}
      >
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 text-[var(--foreground)] no-underline"
          aria-label="Omega Markets"
        >
          <OmegaMark size={22} />
          <span className="hidden font-wordmark text-[13px] font-semibold uppercase tracking-[0.12em] min-[480px]:inline sm:text-[15px]">
            Omega Markets
          </span>
        </a>
        {/* Research leads the row and is a glass button, not a text link —
            the nav carries the full action set at every breakpoint, which is
            why the mobile hero has no CTA row of its own. */}
        <div className="flex items-center gap-2.5 sm:gap-7">
          <Button
            asChild
            variant="glass"
            className="h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]"
          >
            <a href="/research">{landingHero.researchCta}</a>
          </Button>
          <Button asChild className="h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]">
            <a href="/trade">{landingHero.navCta}</a>
          </Button>
          <Button asChild className="h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]">
            <a href="/trade">{landingHero.launchCta}</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
