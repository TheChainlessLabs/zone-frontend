"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Landing rail layout tunables — the single place to adjust the responsive
 * behavior of the card rail.
 *
 * Bands (widths are viewport px):
 *   >= desktopMin ......... two-column layout. No pinned hero, no stage; the
 *                           hero is fixed left and cards scroll the right
 *                           rail with the singularity-absorption animation.
 *   phoneMax..desktopMin .. pinned stage. The hero sticks to the top and one
 *                           card at a time crossfades on a fixed stage
 *                           anchored at `stage.anchor` of the viewport, so
 *                           the black hole stays visible in the gap.
 *   < phoneMax ............ pinned stage, hugging. Same mechanic, but the
 *                           card sits `stage.hugGap` under the hero because
 *                           a phone viewport has no height to spare.
 *
 * KEEP IN SYNC with the utility classes in landing-page-fx-spot.tsx
 * (min-[1400px]: / max-[1399px]: variants, pt/top-[96px], the 70vh stage
 * slots and 85vh desktop slots) and the media queries in landing.css.
 */
export const LANDING_LAYOUT = {
  desktopMin: 1400,
  phoneMax: 640,
  navHeight: 96,
  stage: {
    hugGap: 8, // hero-to-card seam below phoneMax
    anchor: 0.66, // card top as a fraction of viewport height, phoneMax and up
    bottomInset: 16, // breathing room under the card before the fold
    minHeight: 120,
    cardMaxWidth: 760,
    fitFloor: 0.85, // hardest shrink allowed — legibility beats a perfect fit
    slotCenterTarget: 0.55, // where a slot's center reads as "on stage"
    plateauFull: 1.6, // opacity ramp: o = clamp(plateauFull - |dn| * plateauSlope)
    plateauSlope: 3.2,
  },
  desktop: {
    collapseStart: 0.45, // slot center above this vh fraction: absorption
    enterStart: 0.52, // slot center below this: arriving from the bottom
    collapseEnd: 0.04,
    arrivalRise: 90, // px of lift while a card arrives
  },
} as const;

const L = LANDING_LAYOUT;

/**
 * Drives one card of the landing rail. Desktop: absorption into the
 * singularity, scroll-linked and reversible. Below desktopMin: fixed-stage
 * crossfade under the pinned hero (see LANDING_LAYOUT). Static under
 * prefers-reduced-motion.
 */
export function useCardScrollAnimation(cardIndex: number, totalCards: number) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const content = card.querySelector<HTMLElement>("[data-card-slide]");
    if (!content) return;

    // One boundary shared with the CSS: min-[1400px] utilities are width
    // >= 1400 and max-[1400px] utilities are width < 1400 (Tailwind v4 range
    // semantics), so "pinned" is simply "not desktop".
    const desktop = window.matchMedia(`(min-width: ${L.desktopMin}px)`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let scheduled = false;
    let lastMode = "";

    const update = () => {
      scheduled = false;

      // Clear every inline prop when the layout mode changes (e.g. resizing
      // from the fixed-stage band into the two-column desktop), so a mode
      // never inherits another mode's positioning or visibility.
      const mode = reduced.matches
        ? "off"
        : desktop.matches
          ? "desktop"
          : "pinned";
      if (mode !== lastMode) {
        reset();
        lastMode = mode;
      }
      if (mode === "off") return;

      // Measure the untransformed slot; only the inner content animates.
      const rect = card.getBoundingClientRect();
      const isMech = card.hasAttribute("data-mechanism");
      const vhNow = window.innerHeight;

      // Scrub progress for the mechanism card: its long slot maps 0..1 onto
      // the scene, driven by scroll in either direction.
      const emitMech = (dn: number) => {
        if (!isMech) return;
        const p = Math.min(1, Math.max(0, 0.5 - dn));
        content.dispatchEvent(
          new CustomEvent("mechprogress", { detail: p })
        );
      };

      // Desktop mechanism card: pinned in the rail while its slot passes,
      // scrubbing the scene instead of traveling into the singularity.
      if (mode === "desktop" && isMech) {
        const dn =
          (rect.top + rect.height / 2 - vhNow * L.stage.slotCenterTarget) /
          rect.height;
        emitMech(dn);
        const o = Math.min(
          1,
          Math.max(0, L.stage.plateauFull - Math.abs(dn) * L.stage.plateauSlope)
        );
        const cardW = Math.min(L.stage.cardMaxWidth, rect.width);
        const contentH = content.offsetHeight || 1;
        const avail = vhNow - L.navHeight - 48;
        const fit = Math.max(L.stage.fitFloor, Math.min(1, avail / contentH));
        gsap.set(content, {
          position: "fixed",
          top: L.navHeight + 24 + Math.max(0, (avail - contentH * fit) / 2),
          left: rect.left + (rect.width - cardW),
          width: cardW,
          x: 0,
          y: 0,
          scale: fit,
          transformOrigin: "top center",
          autoAlpha: o,
          pointerEvents: o > 0.5 ? "auto" : "none",
          overwrite: "auto",
        });
        return;
      }

      if (mode === "pinned") {
        // Fixed-stage crossfade: the card never travels. It renders pinned in
        // the stage below the sticky hero; its flow slot only drives the
        // dissolve. Adjacent slots are a full slot apart, so at most one card
        // can ever be visible.
        const vh = window.innerHeight;
        const hero = document.querySelector(".lp-pinned-hero");
        const heroBottom = hero ? hero.getBoundingClientRect().bottom : vh * 0.5;
        const hugTop = heroBottom + L.stage.hugGap;
        const stageTop =
          window.innerWidth >= L.phoneMax
            ? Math.max(hugTop, vh * L.stage.anchor)
            : hugTop;
        const stageH = Math.max(
          L.stage.minHeight,
          vh - stageTop - L.stage.bottomInset
        );

        const dn =
          (rect.top + rect.height / 2 - vh * L.stage.slotCenterTarget) /
          rect.height;
        emitMech(dn);
        const o = Math.min(
          1,
          Math.max(0, L.stage.plateauFull - Math.abs(dn) * L.stage.plateauSlope)
        );

        const cardW = Math.min(L.stage.cardMaxWidth, rect.width);
        const contentH = content.offsetHeight || 1;
        const fit = Math.max(L.stage.fitFloor, Math.min(1, stageH / contentH));

        // A card taller than the stage lifts toward the hero (trading hole
        // visibility for content) instead of hanging past the fold.
        const liftedTop = Math.max(
          hugTop,
          Math.min(stageTop, vh - L.stage.bottomInset - contentH * fit)
        );

        gsap.set(content, {
          position: "fixed",
          top: liftedTop,
          left: rect.left + (rect.width - cardW) / 2,
          width: cardW,
          x: 0,
          y: 0,
          scale: fit * (0.97 + 0.03 * o),
          transformOrigin: "top center",
          autoAlpha: o,
          pointerEvents: o > 0.5 ? "auto" : "none",
          overwrite: "auto",
        });
        return;
      }

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // The singularity sits at the center of the fixed scene (below the nav).
      const holeX = vw / 2;
      const holeY = L.navHeight + (vh - L.navHeight) / 2;

      const collapseStart = vh * L.desktop.collapseStart;
      const enterStart = vh * L.desktop.enterStart;

      let x = 0;
      let y = 0;
      let scale = 1;
      let opacity = 1;

      if (cy < collapseStart) {
        // Absorption: shrink early so the card is small before its path
        // nears the hero copy, keep it mostly opaque while it visibly darts
        // toward the singularity, then extinguish right at the horizon.
        const c = Math.min(
          1,
          (collapseStart - cy) / (collapseStart - vh * L.desktop.collapseEnd)
        );
        const s = c * c * (3 - 2 * c);
        const pull = Math.pow(s, 0.9);
        x = (holeX - cx) * pull;
        y = (holeY - cy) * pull;
        scale = 1 - 0.9 * Math.pow(c, 0.7);
        // Quadratic hold: opacity stays high through most of the collapse and
        // only drains away near the horizon.
        opacity = 1 - c * c;
      } else if (cy > enterStart) {
        // Arrival from the bottom edge.
        const t = Math.min(1, (cy - enterStart) / (vh * 0.5));
        y = t * L.desktop.arrivalRise;
        scale = 1 - 0.04 * t;
        opacity = 1 - t;
      }

      gsap.set(content, { x, y, scale, opacity, overwrite: "auto" });
    };

    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    const reset = () => {
      gsap.set(content, {
        clearProps:
          "opacity,visibility,transform,position,top,left,width,pointerEvents",
      });
    };

    const onModeChange = () => {
      if (reduced.matches) {
        reset();
      } else {
        requestUpdate();
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    // Re-fit the stage card when its content grows or shrinks (e.g. an
    // item expanding to reveal its subtext).
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(requestUpdate)
        : null;
    ro?.observe(content);
    desktop.addEventListener("change", onModeChange);
    reduced.addEventListener("change", onModeChange);
    onModeChange();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      ro?.disconnect();
      desktop.removeEventListener("change", onModeChange);
      reduced.removeEventListener("change", onModeChange);
      cancelAnimationFrame(raf);
      reset();
    };
  }, [cardIndex, totalCards]);

  return cardRef;
}
