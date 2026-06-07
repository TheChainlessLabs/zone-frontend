import type { SceneState, SceneStep } from "@/components/landing/scene/types";

// Ordered step ids — must match scrollStates / scene.jsx SCROLL_STATES.
const STEPS: SceneStep[] = [
  "intent",
  "matching",
  "liquidity",
  "execution",
  "settlement",
];

const STEP_COUNT = STEPS.length;

// Scene geometry constants (SVG viewBox 0 0 500 500), mirrored from scene.jsx.
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
 * Port of scene.jsx `sceneState()` + the derived values inside `MidpointScene`.
 */
export function getSceneState(progress: number): SceneState {
  const p = clamp01(progress);
  const seg = 1 / STEP_COUNT;
  const index = clamp(Math.floor(p / seg), 0, STEP_COUNT - 1);
  const local = easeInOut(clamp01((p - index * seg) / seg));

  // event-horizon radius grows through phase 2, holds
  const horizon = lerp(36, 96, clamp((p - 0.12) / 0.5, 0, 1));
  // core finalizes (grows) from phase 2 onward
  const coreR = index >= 1 ? lerp(13, 22, clamp((p - 0.25) / 0.3, 0, 1)) : 13;
  // incoming sealed order falls from top into the core during phase 1
  const fallProgress = index === 0 ? local : 1;
  const orderY = lerp(40, CY, easeInOut(fallProgress));
  const orderFalling = index < 1;
  // orbit angle advances with scroll
  const spin = p * Math.PI * 2.4;
  // how far orbiting orders are pulled into the core
  const pull = clamp((p - 0.18) / 0.4, 0, 1);
  // proof capsule emerges in phase 3
  const proof = index >= 2 ? clamp((p - 0.5) / 0.25, 0, 1) : 0;
  const proofX = lerp(CX, CX + 150, easeInOut(proof));
  // radiation noise scatter in phase 3
  const noise = index >= 2 ? clamp((p - 0.5) / 0.3, 0, 1) : 0;
  // tempo blocks slide in during phase 4
  const tempo = index >= 3 ? local : 0;

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
