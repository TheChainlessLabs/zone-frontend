import type { SceneState, SceneStep } from "./types";

// Ordered step ids — must match scrollStates in new-mechanism/content.ts.
const STEPS: SceneStep[] = ["intent", "matching", "execution"];

const STEP_COUNT = STEPS.length;

// Scene geometry constants (SVG viewBox 0 0 500 500).
const CX = 250;
const CY = 250;

interface ScrollProgressInput {
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
}

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function clamp(value: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Linear interpolation clamped to the 0..1 progress range. */
export function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * clamp01(progress);
}

export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Exponential damping toward a target (no overshoot). */
export function damp(current: number, target: number, deltaSeconds: number, sharpness = 12) {
  return interpolate(current, target, 1 - Math.exp(-sharpness * deltaSeconds));
}

/** Map window scroll position to 0..1 progress through a pinned section. */
export function mapScrollToProgress({
  scrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
}: ScrollProgressInput) {
  const travel = Math.max(sectionHeight - viewportHeight, 1);
  return clamp01((scrollY - sectionTop) / travel);
}

/**
 * Derive the full scene state from global scroll progress 0..1.
 * Three-step retiming of the landing scene: the falling order owns phase 1,
 * horizon growth / pull / proof / noise all play out within the merged
 * matching+liquidity phase 2, and tempo blocks finalize in phase 3.
 */
export function getSceneState(progress: number): SceneState {
  const p = clamp01(progress);
  const seg = 1 / STEP_COUNT;
  const index = clamp(Math.floor(p / seg), 0, STEP_COUNT - 1);
  const local = easeInOut(clamp01((p - index * seg) / seg));

  // event-horizon radius grows through phase 2, holds
  const horizon = lerp(36, 96, clamp((p - 0.1) / 0.45, 0, 1));
  // core finalizes (grows) from phase 2 onward
  const coreR = index >= 1 ? lerp(13, 22, clamp((p - 0.35) / 0.25, 0, 1)) : 13;
  // incoming sealed order falls from top into the core during phase 1
  const fallProgress = index === 0 ? local : 1;
  const orderY = lerp(40, CY, easeInOut(fallProgress));
  const orderFalling = index < 1;
  // orbit angle advances with scroll
  const spin = p * Math.PI * 2.4;
  // how far orbiting orders are pulled into the core
  const pull = clamp((p - 0.25) / 0.35, 0, 1);
  // proof capsule emerges in the back half of the merged phase
  const proof = index >= 1 ? clamp((p - 0.5) / 0.2, 0, 1) : 0;
  const proofX = lerp(CX, CX + 150, easeInOut(proof));
  // radiation noise scatter alongside the proof capsule
  const noise = index >= 1 ? clamp((p - 0.5) / 0.25, 0, 1) : 0;
  // tempo blocks slide in during phase 3
  const tempo = index >= 2 ? local : 0;

  return {
    index,
    activeStep: STEPS[index],
    local,
    progress: p,
    horizon,
    coreR,
    orderFalling,
    orderY,
    fallProgress,
    spin,
    pull,
    proof,
    proofX,
    noise,
    tempo,
  };
}
