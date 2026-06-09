"use client";

import * as React from "react";

/**
 * useSlidingIndicator — drives a segmented control's active indicator by
 * tweening `left` from JavaScript (requestAnimationFrame), NOT a CSS
 * transition.
 *
 * Why JS and not CSS: these segmented pills (Navbar tabs, order-mode toggle)
 * sit inside `backdrop-filter` ancestors (the glass track itself, and on the
 * trade page an enclosing glass panel). Under a `backdrop-filter` ancestor
 * Chrome freezes CSS transitions on paint properties like `left` (the value
 * never advances past its start), and animating `transform` instead hangs the
 * renderer. Updating `left` per frame from the main thread forces a normal
 * repaint and is immune to both bugs.
 *
 * The hook owns only the imperative motion. The caller wires `trackRef` to the
 * track and `pillRef` to the indicator span, marks the active item with the
 * `activeSelector`, and decides when to `snap()` (no animation — initial
 * placement, reflow) vs `slideFrom(left)` (tween from a start position).
 */
export function useSlidingIndicator(activeSelector: string) {
  const trackRef = React.useRef<HTMLElement | null>(null);
  const pillRef = React.useRef<HTMLSpanElement | null>(null);
  const rafRef = React.useRef(0);

  const activeBox = React.useCallback((): { left: number; width: number } | null => {
    const el = trackRef.current?.querySelector<HTMLElement>(activeSelector);
    return el ? { left: el.offsetLeft, width: el.offsetWidth } : null;
  }, [activeSelector]);

  // Place the indicator under the active item with no motion.
  const snap = React.useCallback(() => {
    const pill = pillRef.current;
    const box = activeBox();
    if (!pill || !box) return;
    cancelAnimationFrame(rafRef.current);
    pill.style.width = `${box.width}px`;
    pill.style.left = `${box.left}px`;
    pill.style.opacity = "1";
  }, [activeBox]);

  // Tween the indicator's `left` from `fromLeft` to the active item's position.
  // Width is set instantly (segments are equal width, so it never changes) so
  // the pill keeps a constant shape and only slides.
  const slideFrom = React.useCallback(
    (fromLeft: number) => {
      const pill = pillRef.current;
      const box = activeBox();
      if (!pill || !box) return;
      cancelAnimationFrame(rafRef.current);
      pill.style.width = `${box.width}px`;
      pill.style.opacity = "1";
      const to = box.left;
      // No animation possible/needed → snap. rAF is paused while the tab is
      // hidden, so animating then would leave the pill stranded mid-slide.
      if (
        fromLeft === to ||
        (typeof document !== "undefined" && document.hidden)
      ) {
        pill.style.left = `${to}px`;
        return;
      }
      const start = performance.now();
      const duration = 260;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        pill.style.left = `${fromLeft + (to - fromLeft) * ease(t)}px`;
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [activeBox],
  );

  // Current rendered left of the pill (used as the start of the next slide).
  const currentLeft = React.useCallback((): number => {
    const v = parseFloat(pillRef.current?.style.left ?? "");
    return Number.isFinite(v) ? v : (activeBox()?.left ?? 0);
  }, [activeBox]);

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { trackRef, pillRef, snap, slideFrom, activeBox, currentLeft };
}
