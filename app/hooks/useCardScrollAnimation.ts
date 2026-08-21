"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Cards live in the same physics as the asteroids: scrolling down, a card
 * rises in from the bottom edge, rests mid-viewport, then is pulled into the
 * singularity at the page center — translating toward it while shrinking and
 * fading until absorbed. Scroll-linked (position-driven), so reversing the
 * scroll plays the absorption backwards. Each card owns only its own element;
 * desktop-only; static on mobile and under prefers-reduced-motion.
 */
export function useCardScrollAnimation(cardIndex: number, totalCards: number) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const content = card.querySelector<HTMLElement>("[data-card-slide]");
    if (!content) return;

    const desktop = window.matchMedia("(min-width: 1775px)");
    const pinned = window.matchMedia("(min-width: 1024px) and (max-width: 1774.98px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let scheduled = false;

    const update = () => {
      scheduled = false;
      if (reduced.matches) return;

      // Measure the untransformed slot; only the inner content animates.
      const rect = card.getBoundingClientRect();

      // Pinned-hero band: the hero is sticky at the top, so cards simply
      // fade and settle out as they slide up underneath it — scroll changes
      // which card holds the top of the card area.
      if (pinned.matches) {
        // Fixed-stage crossfade: the card never travels. It renders pinned in
        // the stage below the sticky hero; its flow slot (70vh) only drives
        // the dissolve. Adjacent slots are a full slot apart, so at most one
        // card can ever be visible.
        const vh = window.innerHeight;
        const hero = document.querySelector(".lp-pinned-hero");
        const heroBottom = hero ? hero.getBoundingClientRect().bottom : vh * 0.5;
        // Stage sits just below the viewport middle so the singularity's
        // center stays visible above the card.
        const stageTop = Math.max(heroBottom + 12, vh * 0.54);
        const stageH = Math.max(120, vh - stageTop - 16);

        const dn = (rect.top + rect.height / 2 - vh * 0.55) / rect.height;
        const o = Math.min(1, Math.max(0, 1.6 - Math.abs(dn) * 3.2));

        const cardW = Math.min(900, rect.width);
        const contentH = content.offsetHeight || 1;
        const fit = Math.max(0.85, Math.min(1, stageH / contentH));

        gsap.set(content, {
          position: "fixed",
          top: stageTop + Math.max(0, (stageH - contentH * fit) / 2),
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

      if (!desktop.matches) return;

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // The singularity sits at the center of the fixed scene (below the nav).
      const holeX = vw / 2;
      const holeY = 96 + (vh - 96) / 2;

      const collapseStart = vh * 0.45; // above this, the pull takes over
      const enterStart = vh * 0.52; // below this, the card is still arriving

      let x = 0;
      let y = 0;
      let scale = 1;
      let opacity = 1;

      if (cy < collapseStart) {
        // Absorption: shrink early so the card is small before its path
        // nears the hero copy, keep it mostly opaque while it visibly darts
        // toward the singularity, then extinguish right at the horizon.
        const c = Math.min(1, (collapseStart - cy) / (collapseStart - vh * 0.04));
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
        y = t * 90;
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
      if (reduced.matches || (!desktop.matches && !pinned.matches)) {
        reset();
      } else {
        requestUpdate();
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktop.addEventListener("change", onModeChange);
    pinned.addEventListener("change", onModeChange);
    reduced.addEventListener("change", onModeChange);
    onModeChange();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktop.removeEventListener("change", onModeChange);
      pinned.removeEventListener("change", onModeChange);
      reduced.removeEventListener("change", onModeChange);
      cancelAnimationFrame(raf);
      reset();
    };
  }, [cardIndex, totalCards]);

  return cardRef;
}
