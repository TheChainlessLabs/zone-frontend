// Scene types for the midpoint-singularity mechanism scene.
// Mirrors the kit's scene.jsx: a single scroll progress drives a pinned SVG
// black hole through four lifecycle states.

export type SceneStep =
  | "intent"
  | "matching"
  | "liquidity"
  | "execution";

export interface SceneState {
  /** Active step index 0..3 and id. */
  index: number;
  activeStep: SceneStep;
  /** Eased sub-progress within the active step, 0..1. */
  local: number;
  /** Global scroll progress 0..1, passed through for fine-grained motion. */
  progress: number;
  /** Event-horizon ring radius (SVG units). */
  horizon: number;
  /** Singularity core radius (SVG units). */
  coreR: number;
  /** Incoming sealed order: still falling (true) vs already inside the core. */
  orderFalling: boolean;
  /** Vertical position of the falling sealed order (SVG y). */
  orderY: number;
  /** Rotation phase of the falling order, 0..1 (×90deg). */
  fallProgress: number;
  /** Orbit spin angle (radians). */
  spin: number;
  /** How far orbiting orders are pulled toward the core, 0..1. */
  pull: number;
  /** Proof capsule emergence, 0..1 (phase 3 → 4). */
  proof: number;
  /** Proof capsule x position (SVG units). */
  proofX: number;
  /** Radiation-noise scatter, 0..1 (phase 3). */
  noise: number;
  /** Tempo finalization blocks slide-in, 0..1 (phase 4). */
  tempo: number;
}
