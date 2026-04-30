"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * useHashHighlight — when the current URL has a hash fragment, scroll the
 * matching element into view and play a brief "ring fade" highlight so a
 * shared deep link visibly lands on its target.
 *
 * Choreography (M5.5 — #228):
 *   t=0     hook fires (mount or pathname change)
 *   t=100   element receives `.hash-highlight-active` and is scrolled into
 *           view; the 1px+3px box-shadow ring fades in over 500ms
 *   t=900   class flips to `.hash-highlight-fade`; ring fades out over 500ms
 *           (300ms hold between fade-in completion and fade-out start)
 *   t=1400  fade class is stripped; the element is back to its base styles
 *
 * Reduced-motion: the box-shadow `transition-duration` is collapsed to an
 * effective 0ms by the global `prefers-reduced-motion` override in
 * `app/globals.css`, so the class still toggles but visually it reads as a
 * brief outline flash rather than a smooth ring.
 *
 * Intentionally dependency-only on `pathname` so client-side navigations to
 * a route that already includes a hash re-trigger the highlight; the
 * browser does not emit `hashchange` for those.
 */
export function useHashHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;

    const t1 = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("hash-highlight-active");
    }, 100);

    const t2 = window.setTimeout(() => {
      el.classList.remove("hash-highlight-active");
      el.classList.add("hash-highlight-fade");
    }, 100 + 300 + 500);

    const t3 = window.setTimeout(() => {
      el.classList.remove("hash-highlight-fade");
    }, 100 + 300 + 500 + 500);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      el.classList.remove("hash-highlight-active");
      el.classList.remove("hash-highlight-fade");
    };
  }, [pathname]);
}
