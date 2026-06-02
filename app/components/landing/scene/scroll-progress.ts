import type { ScenePoint, SceneState, SceneStep, TempoBlock } from "@/components/landing/scene/types";

const STEPS: SceneStep[] = [
  "private-order",
  "midpoint-match",
  "batch-proof",
  "onchain-settlement",
];

const TEMPO_CHAIN_START = 0.64;
const TEMPO_BLOCK_COUNT = 7;
const SETTLEMENT_BLOCK_INDEX = 3;

interface ScrollProgressInput {
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
}

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * clamp01(progress);
}

export function damp(current: number, target: number, deltaSeconds: number, sharpness = 12) {
  return interpolate(current, target, 1 - Math.exp(-sharpness * deltaSeconds));
}

export function mapScrollToProgress({
  scrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
}: ScrollProgressInput) {
  const travel = Math.max(sectionHeight - viewportHeight, 1);
  return clamp01((scrollY - sectionTop) / travel);
}

function range(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

function easeOut(progress: number) {
  const clamped = clamp01(progress);
  return 1 - (1 - clamped) ** 3;
}

function easeInOut(progress: number) {
  const clamped = clamp01(progress);
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
}

function point(from: ScenePoint, to: ScenePoint, progress: number): ScenePoint {
  return {
    xPercent: interpolate(from.xPercent, to.xPercent, progress),
    yPercent: interpolate(from.yPercent, to.yPercent, progress),
  };
}

function activeStepFor(progress: number): SceneStep {
  if (progress >= 0.7) return STEPS[3];
  if (progress >= 0.46) return STEPS[2];
  if (progress >= 0.2) return STEPS[1];
  return STEPS[0];
}

function localProgressFor(progress: number, activeStep: SceneStep) {
  if (activeStep === "private-order") return range(progress, 0, 0.2);
  if (activeStep === "midpoint-match") return range(progress, 0.2, 0.46);
  if (activeStep === "batch-proof") return range(progress, 0.46, 0.7);
  return range(progress, 0.7, 1);
}

function visibleTempoBlocks(progress: number): TempoBlock[] {
  const chainProgress = range(progress, TEMPO_CHAIN_START, 1);
  if (chainProgress <= 0) return [];

  const visibleCount = Math.max(
    1,
    Math.min(TEMPO_BLOCK_COUNT, Math.floor(chainProgress * TEMPO_BLOCK_COUNT + 0.000001) + 1),
  );
  const finalized = visibleCount >= SETTLEMENT_BLOCK_INDEX + 3;

  return Array.from({ length: visibleCount }, (_, index) => {
    const containsSettlement = index === SETTLEMENT_BLOCK_INDEX && visibleCount > SETTLEMENT_BLOCK_INDEX;
    return {
      id: index + 1,
      containsSettlement,
      status: containsSettlement
        ? finalized
          ? "finalized-proof"
          : "carrying-proof"
        : "pending",
    };
  });
}

function proofPositionFor(progress: number): ScenePoint {
  const formation = point(
    { xPercent: 50, yPercent: 42 },
    { xPercent: 72, yPercent: 42 },
    easeInOut(range(progress, 0.46, 0.6)),
  );

  return point(
    formation,
    { xPercent: 51, yPercent: 70 },
    easeInOut(range(progress, 0.62, 0.78)),
  );
}

export function getSceneState(progress: number): SceneState {
  const clamped = clamp01(progress);
  const activeStep = activeStepFor(clamped);
  const darkpoolProgress = easeOut(range(clamped, 0.08, 0.24));
  const darkpoolExit = range(clamped, 0.58, 0.78);
  const submissionProgress = easeInOut(range(clamped, 0.16, 0.36));
  const proofProgress = easeOut(range(clamped, 0.44, 0.58));
  const chainProgress = easeOut(range(clamped, TEMPO_CHAIN_START, 0.76));
  const finalityProgress = range(clamped, 0.88, 0.94);
  const matchingFade = 1 - range(clamped, 0.42, 0.58);
  const proofFade = 1 - range(clamped, 0.82, 0.92);
  const radiationEnter = easeOut(range(clamped, 0.36, 0.52));
  const radiationExit = 1 - range(clamped, 0.7, 0.86);
  const apertureEnter = easeOut(range(clamped, 0.44, 0.6));
  const apertureExit = 1 - range(clamped, 0.78, 0.9);

  return {
    activeStep,
    localProgress: localProgressFor(clamped, activeStep),
    orderPosition: point(
      { xPercent: 18, yPercent: 48 },
      { xPercent: 50, yPercent: 42 },
      submissionProgress,
    ),
    orderOpacity: interpolate(1, 0, range(clamped, 0.34, 0.46)),
    orderScale: interpolate(1, 0.36, range(clamped, 0.3, 0.46)),
    darkpoolOpacity: interpolate(0, 1, darkpoolProgress) * interpolate(1, 0.28, darkpoolExit),
    darkpoolScale: interpolate(0.62, 1, darkpoolProgress),
    matchingOpacity: interpolate(0, 1, easeOut(range(clamped, 0.2, 0.4))) * matchingFade,
    radiationOpacity: radiationEnter * radiationExit,
    apertureOpacity: apertureEnter * apertureExit,
    proofOpacity: interpolate(0, 1, proofProgress) * proofFade,
    proofPosition: proofPositionFor(clamped),
    proofScale: interpolate(0.72, 1, proofProgress),
    chainOpacity: interpolate(0, 1, chainProgress),
    tempoBlocks: visibleTempoBlocks(clamped),
    settlementFinality: finalityProgress,
  };
}
