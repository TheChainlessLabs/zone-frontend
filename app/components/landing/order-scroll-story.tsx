"use client";

import * as React from "react";

import { scrollStates } from "@/components/landing/content";
import { MidpointScene } from "@/components/landing/scene/midpoint-singularity-scene";
import { ReducedMotionStory } from "@/components/landing/scene/reduced-motion-story";
import { getSceneState, mapScrollToProgress } from "@/components/landing/scene/scroll-progress";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

// The pinned, ~416vh scroll-driven "midpoint singularity" mechanism.
// Faithful port of scene.jsx OrderScrollStory: a tall section with an inner
// sticky stage — black-hole SVG on the left, a 4-segment progress rail plus
// eyebrow/title/body on the right that advance through the four states.

interface OrderScrollStoryProps {
  scrollY?: number;
  windowHeight?: number;
  mechanismFadeThreshold?: number;
}

export function OrderScrollStory({ scrollY = 0, windowHeight = 0, mechanismFadeThreshold = 0 }: OrderScrollStoryProps) {
  const reducedMotion = useReducedMotion();
  const wrapRef = React.useRef<HTMLElement>(null);
  const [progress, setProgress] = React.useState(0);

  // Keep mechanism fully visible - let step 4 show for entire scroll duration
  // No slide transform needed - mechanism stays in place

  React.useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;

    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const next = mapScrollToProgress({
        scrollY: window.scrollY,
        sectionTop,
        sectionHeight: el.offsetHeight,
        viewportHeight: window.innerHeight,
      });
      setProgress((current) => (Math.abs(current - next) < 0.002 ? current : next));
    };

    const requestUpdate = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section id="mechanism" data-scroll-story>
        <ReducedMotionStory />
      </section>
    );
  }

  const state = getSceneState(progress);
  const active = scrollStates[state.index];

  const threshold = mechanismFadeThreshold > 0 ? mechanismFadeThreshold : (windowHeight > 0 ? Math.round((windowHeight + 432 * windowHeight) * 0.95) : 3725);
  const mechanismOpacity = scrollY < threshold ? 1 : 0;

  return (
    <section
      ref={wrapRef}
      id="mechanism"
      data-scroll-story
      aria-label="How an order settles"
      className="relative z-[1] h-[600vh] bg-black transition-opacity duration-700"
      style={{
        opacity: mechanismOpacity,
        pointerEvents: mechanismOpacity < 0.1 ? "none" : "auto",
      }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-8 lg:grid-cols-2">
          {/* scene */}
          <div className="flex justify-center">
            <MidpointScene state={state} />
          </div>

          {/* copy — fixed positions; only the text fades/changes */}
          <div className="transition-opacity duration-700" style={{ opacity: mechanismOpacity }}>
            <div className="mb-7 flex gap-2">
              {scrollStates.map((s, i) => (
                <div
                  key={s.id}
                  className="h-0.5 flex-1 rounded-sm transition-colors duration-[var(--duration-medium)]"
                  style={{ background: i <= state.index ? "var(--success)" : "var(--border)" }}
                />
              ))}
            </div>
            <span
              key={active.id + "-e"}
              data-scroll-panel={active.id}
              className="lp-fade block h-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--success)]"
            >
              {active.step} · {active.label}
            </span>
            <h3
              key={active.id + "-t"}
              className="lp-fade m-0 mt-4 flex h-[84px] max-w-[460px] items-start text-[34px] font-semibold leading-[1.15] tracking-[-0.02em]"
            >
              {active.title}
            </h3>
            <p
              key={active.id + "-b"}
              className="lp-fade m-0 mt-2 h-[140px] max-w-[460px] text-[16px] leading-[1.6] text-[var(--muted-foreground)]"
            >
              {active.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
