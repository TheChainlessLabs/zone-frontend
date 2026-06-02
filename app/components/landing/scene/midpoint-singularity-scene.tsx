"use client";

import * as React from "react";

import { scrollStates } from "@/components/landing/content";
import { ReducedMotionStory } from "@/components/landing/scene/reduced-motion-story";
import { getSceneState, mapScrollToProgress } from "@/components/landing/scene/scroll-progress";
import type { SceneStep, TempoBlock } from "@/components/landing/scene/types";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

function useStoryProgress(enabled: boolean) {
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;

    let frame = 0;

    const update = () => {
      const scene = sceneRef.current;
      if (!scene) return;

      const story = scene.closest("[data-scroll-story]") as HTMLElement | null;
      const target = story ?? scene;
      const rect = target.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionHeight = target.offsetHeight || rect.height;
      const nextProgress = mapScrollToProgress({
        scrollY: window.scrollY,
        sectionTop,
        sectionHeight,
        viewportHeight: window.innerHeight,
      });

      setProgress((current) => (Math.abs(current - nextProgress) < 0.002 ? current : nextProgress));
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
  }, [enabled]);

  return { progress, sceneRef };
}

function percent(value: number) {
  return `${value}%`;
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function matchingOrderStyle(index: number, opacity: number) {
  const routes = [
    { x: 24, y: 24, tx: 45, ty: 38, delay: 0, rotate: -10 },
    { x: 77, y: 27, tx: 57, ty: 38, delay: 0.1, rotate: 8 },
    { x: 28, y: 70, tx: 47, ty: 51, delay: 0.2, rotate: 12 },
    { x: 78, y: 68, tx: 55, ty: 51, delay: 0.3, rotate: -8 },
    { x: 50, y: 18, tx: 50, ty: 38, delay: 0.38, rotate: 0 },
  ];
  const route = routes[index] ?? routes[0];
  const eased = clamp01(opacity * 1.12 - route.delay);

  return {
    left: percent(route.x + (route.tx - route.x) * eased),
    top: percent(route.y + (route.ty - route.y) * eased),
    opacity: clamp01(opacity * 1.24 - route.delay * 0.8),
    boxShadow:
      "0 0 28px color-mix(in oklab, var(--primary) 14%, transparent)",
    transform: `translate(-50%, -50%) scale(${0.82 + eased * 0.24}) rotate(${route.rotate}deg)`,
  } satisfies React.CSSProperties;
}

function radiationParticleStyle(index: number, opacity: number, progress: number) {
  const seed = index + 1;
  const phase = (progress * (0.48 + (seed % 5) * 0.07) + seed * 0.137) % 1;
  const angle = seed * 2.399 + progress * 2.2;
  const stream = index % 3;
  const radius = 8 + phase * (stream === 0 ? 36 : stream === 1 ? 46 : 58);
  const exitBias = stream === 0 ? phase * 34 : phase * 54;
  const x = 50 + Math.cos(angle) * radius * 0.34 + exitBias;
  const y = 42 + Math.sin(angle) * radius * 0.24 + (stream - 1) * 4 + phase * 10;
  const size = 1.5 + (seed % 4) * 0.7;
  const particleOpacity = Math.min(1, opacity * (0.2 + phase * 0.8));

  return {
    left: percent(x),
    top: percent(y),
    opacity: particleOpacity,
    transform: `translate(-50%, -50%) scale(${0.55 + phase * 1.15})`,
    boxShadow:
      "0 0 18px color-mix(in oklab, var(--foreground) 34%, transparent)",
    width: `${size}px`,
    height: `${size}px`,
  } satisfies React.CSSProperties;
}

function tempoBlockClass(block: TempoBlock) {
  if (block.status === "finalized-proof") {
    return "border-[var(--success)] bg-[var(--success)] text-[var(--success-foreground)]";
  }
  if (block.status === "carrying-proof") {
    return "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]";
  }
  return "border-[var(--border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)]";
}

function statusBadgeFor(state: SceneStep, finalized: boolean) {
  if (finalized) return "Finalized on Tempo";
  if (state === "batch-proof") return "Proof verified";
  if (state === "midpoint-match") return "Matching privately";
  if (state === "onchain-settlement") return "Pinning to Tempo";
  return "Private order";
}

export function MidpointSingularityScene() {
  const reducedMotion = useReducedMotion();
  const { progress, sceneRef } = useStoryProgress(!reducedMotion);
  const sceneState = getSceneState(progress);
  const activeState = scrollStates.find((state) => state.id === sceneState.activeStep) ?? scrollStates[0];
  const tempoBlocksById = new Map(sceneState.tempoBlocks.map((block) => [block.id, block]));

  if (reducedMotion) return <ReducedMotionStory />;

  return (
    <div
      ref={sceneRef}
      data-testid="order-lifecycle-scene"
      className="relative min-h-[420px] overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-[inset_0_1px_0_var(--surface-edge)] md:min-h-[560px] lg:h-full"
      aria-label="Omega private order lifecycle animation"
    >
      <div
        className="absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_50%_48%,#000_10%,transparent_78%)]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, color-mix(in oklab, var(--foreground) 5.5%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in oklab, var(--foreground) 5.5%, transparent) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--foreground) 8%, transparent), transparent 25%), linear-gradient(180deg, transparent 58%, color-mix(in oklab, var(--background) 86%, transparent))",
        }}
      />

      <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)] md:left-6 md:right-6 md:top-6">
        <span>USDC/EURC</span>
        <span>Midpoint 0.9213</span>
      </div>

      <div className="absolute inset-x-5 top-[16%] h-[58%] md:inset-x-8">
        <div
          className="absolute left-1/2 top-[42%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--muted-foreground)] transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] md:size-56"
          style={{
            opacity: sceneState.darkpoolOpacity,
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, black 72%, var(--background)) 0 38%, var(--background) 48%, color-mix(in oklab, var(--foreground) 18%, transparent) 62%, color-mix(in oklab, var(--foreground) 7%, transparent) 74%, transparent 80%)",
            boxShadow:
              "inset 0 0 58px color-mix(in oklab, var(--foreground) 10%, transparent), 0 0 92px color-mix(in oklab, var(--foreground) 14%, transparent), 0 0 0 1px color-mix(in oklab, var(--foreground) 12%, transparent)",
            transform: `translate(-50%, -50%) scale(${sceneState.darkpoolScale})`,
          }}
        />
        <div
          className="absolute left-1/2 top-[42%] size-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--muted-foreground)] transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] md:size-80"
          style={{
            opacity: sceneState.darkpoolOpacity * 0.82,
            transform: `translate(-50%, -50%) scale(${sceneState.darkpoolScale}) rotate(${progress * 80}deg)`,
          }}
        />
        <div
          className="absolute left-1/2 top-[42%] h-16 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--foreground)] opacity-0 transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)] md:h-20 md:w-76"
          style={{
            opacity: sceneState.darkpoolOpacity * 0.22,
            transform: `translate(-50%, -50%) rotate(${-12 + progress * 24}deg) scale(${sceneState.darkpoolScale})`,
          }}
        />
        <div
          className="absolute left-1/2 top-[42%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)] md:size-80"
          style={{
            opacity: sceneState.darkpoolOpacity * 0.42,
            background:
              "conic-gradient(from 210deg, transparent, color-mix(in oklab, var(--foreground) 28%, transparent), transparent 32%, color-mix(in oklab, var(--success) 14%, transparent), transparent 62%)",
            transform: `translate(-50%, -50%) scale(${sceneState.darkpoolScale}) rotate(${-progress * 55}deg)`,
          }}
        />
        <div
          className="absolute left-[60%] top-[43%] h-12 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)] md:w-64"
          style={{
            opacity: sceneState.radiationOpacity * 0.46,
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 18%, transparent), color-mix(in oklab, var(--foreground) 4%, transparent), transparent)",
            transform: `translate(-50%, -50%) rotate(${4 + progress * 8}deg)`,
          }}
        />
        <div
          className="absolute left-[63%] top-[42%] h-px w-52 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)] md:w-72"
          style={{
            opacity: sceneState.radiationOpacity * 0.72,
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 44%, transparent), transparent)",
            transform: `translate(-50%, -50%) rotate(${2 + progress * 6}deg)`,
          }}
        />
        {Array.from({ length: 26 }, (_, index) => (
          <span
            key={index}
            aria-hidden
            className="absolute rounded-full bg-[var(--foreground)] transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)]"
            style={radiationParticleStyle(index, sceneState.radiationOpacity, progress)}
          />
        ))}
        <div
          className="absolute left-[69%] top-[42%] h-20 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--foreground)] transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)]"
          style={{
            opacity: sceneState.apertureOpacity * 0.4,
            transform: `translate(-50%, -50%) rotate(${82 + progress * 12}deg) scale(${0.84 + sceneState.apertureOpacity * 0.22})`,
            boxShadow:
              "0 0 32px color-mix(in oklab, var(--foreground) 16%, transparent), inset 0 0 24px color-mix(in oklab, var(--foreground) 10%, transparent)",
          }}
        />
        <div
          className="absolute left-1/2 top-[42%] -translate-x-1/2 translate-y-20 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          style={{ opacity: sceneState.darkpoolOpacity }}
        >
          DARKPOOL
        </div>
        <div
          className="absolute left-[66%] top-[54%] -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
          style={{ opacity: sceneState.radiationOpacity * 0.74 }}
        >
          NOISE FIELD
        </div>

        <div
          className="absolute h-10 w-16 rounded-full border border-[var(--primary)] bg-[var(--primary)] text-center font-mono text-[9px] uppercase leading-10 tracking-[0.12em] text-[var(--primary-foreground)] transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] md:h-12 md:w-20 md:leading-[3rem]"
          style={{
            left: percent(sceneState.orderPosition.xPercent),
            top: percent(sceneState.orderPosition.yPercent),
            opacity: sceneState.orderOpacity,
            boxShadow:
              "0 0 0 4px color-mix(in oklab, var(--primary) 6%, transparent), 0 20px 60px color-mix(in oklab, var(--primary) 13%, transparent)",
            transform: `translate(-50%, -50%) scale(${sceneState.orderScale})`,
          }}
        >
          Order
        </div>
        <div
          className="absolute -translate-x-1/2 translate-y-9 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
          style={{
            left: percent(sceneState.orderPosition.xPercent),
            top: percent(sceneState.orderPosition.yPercent),
            opacity: sceneState.orderOpacity,
          }}
        >
          PRIVATE ORDER
        </div>

        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="absolute h-4 w-8 rounded-[3px] border border-[var(--primary)] bg-[var(--primary)] transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] md:h-5 md:w-10"
            style={matchingOrderStyle(index, sceneState.matchingOpacity)}
          >
            <span className="absolute left-1.5 right-1.5 top-1 h-px bg-[var(--primary-foreground)] opacity-35" />
            <span className="absolute bottom-1 left-1.5 h-px w-3 bg-[var(--primary-foreground)] opacity-30" />
          </div>
        ))}

        <div
          className="absolute h-12 w-36 rounded-full border border-[var(--primary)] bg-[var(--primary)] px-4 text-center font-mono text-[10px] uppercase leading-[3rem] tracking-[0.14em] text-[var(--primary-foreground)] transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] md:w-44"
          style={{
            left: percent(sceneState.proofPosition.xPercent),
            top: percent(sceneState.proofPosition.yPercent),
            opacity: sceneState.proofOpacity,
            boxShadow:
              "0 0 0 6px color-mix(in oklab, var(--primary) 5%, transparent), 0 24px 70px color-mix(in oklab, var(--primary) 16%, transparent)",
            transform: `translate(-50%, -50%) scale(${sceneState.proofScale})`,
          }}
        >
          BATCH PROOF
        </div>
      </div>

      <div
        className="absolute inset-x-5 bottom-[21%] transition-opacity duration-[var(--duration-small)] ease-[var(--ease-out)] md:inset-x-8"
        style={{ opacity: sceneState.chainOpacity }}
      >
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          <span>TEMPO</span>
          <span>{sceneState.settlementFinality >= 1 ? "Finalized" : "Producing blocks"}</span>
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          {Array.from({ length: 7 }, (_, index) => {
            const id = index + 1;
            const fallbackBlock: TempoBlock = {
              id,
              status: "pending",
              containsSettlement: false,
            };
            const block = tempoBlocksById.get(id) ?? fallbackBlock;
            const isVisible = tempoBlocksById.has(id);
            const nextIsVisible = tempoBlocksById.has(id + 1);

            return (
              <div key={block.id} className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  aria-hidden={!isVisible}
                  className={`relative h-12 min-w-12 flex-1 rounded-md border font-mono text-[9px] uppercase tracking-[0.12em] transition duration-[var(--duration-small)] ease-[var(--ease-out)] ${tempoBlockClass(block)}`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: `scale(${isVisible ? 1 : 0.86})`,
                  }}
                >
                  <span className="absolute left-2 top-2">#{block.id}</span>
                  {block.containsSettlement ? (
                    <span className="absolute bottom-2 left-2 right-2 truncate">
                      {block.status === "finalized-proof" ? "Final" : "Proof"}
                    </span>
                  ) : null}
                </div>
                {block.id < 7 ? (
                  <span
                    className="h-px w-4 shrink-0 bg-[var(--border)] transition-opacity duration-[var(--duration-small)]"
                    style={{ opacity: isVisible && nextIsVisible ? 1 : 0 }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-4 right-4 grid gap-4 md:bottom-6 md:left-6 md:right-6">
        <div className="flex items-center gap-2">
          {scrollStates.map((state) => (
            <span
              key={state.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-[var(--duration-small)] ease-[var(--ease-out)] ${
                state.id === activeState.id ? "bg-[var(--primary)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              {activeState.step} {activeState.label}
            </p>
          </div>
          <div
            className={`w-fit shrink-0 border px-2 py-1 font-mono text-[10px] uppercase shadow-[inset_0_1px_0_var(--glass-highlight)] ${
              sceneState.settlementFinality >= 1
                ? "border-[var(--success)] bg-[var(--success)] text-[var(--success-foreground)]"
                : "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
            }`}
          >
            {statusBadgeFor(activeState.id, sceneState.settlementFinality >= 1)}
          </div>
        </div>
      </div>
    </div>
  );
}
