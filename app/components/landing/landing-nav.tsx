"use client";

import { OmegaMark } from "@/components/OmegaMark";
import { Button } from "@/components/ui/button";

// Sticky landing nav (app.jsx Nav). Transparent over the hero, then blurred
// and bordered once scrolled past the hero top. `solid` is driven by the page.
export function LandingNav({ solid }: { solid: boolean }) {
  return (
    <nav
      data-testid="landing-nav"
      className="fixed inset-x-0 top-0 z-50 flex justify-center transition-[background,border-color] duration-[var(--duration-medium)]"
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
        className="flex w-full max-w-[1200px] items-center justify-between px-8 transition-[padding] duration-[var(--duration-medium)]"
        style={{ paddingBlock: solid ? 14 : 24 }}
      >
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 text-[var(--foreground)] no-underline"
          aria-label="Omega Markets"
        >
          <OmegaMark size={22} />
          <span className="font-wordmark text-[15px] font-semibold uppercase tracking-[0.12em]">
            Omega Markets
          </span>
        </a>
        <div className="flex items-center gap-7">
          <a
            href="/trade"
            className="text-[14px] text-[var(--muted-foreground)] no-underline transition-colors duration-[var(--duration-small)] hover:text-[var(--foreground)]"
          >
            Launch app
          </a>
          <Button asChild className="h-10 text-[14px]">
            <a href="#request">Request Access</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
