export type SceneStep =
  | "private-order"
  | "midpoint-match"
  | "batch-proof"
  | "onchain-settlement";

export type TempoBlockStatus = "pending" | "carrying-proof" | "finalized-proof";

export interface ScenePoint {
  xPercent: number;
  yPercent: number;
}

export interface TempoBlock {
  id: number;
  status: TempoBlockStatus;
  containsSettlement: boolean;
}

export interface SceneState {
  activeStep: SceneStep;
  localProgress: number;
  orderPosition: ScenePoint;
  orderOpacity: number;
  orderScale: number;
  darkpoolOpacity: number;
  darkpoolScale: number;
  matchingOpacity: number;
  radiationOpacity: number;
  apertureOpacity: number;
  proofOpacity: number;
  proofPosition: ScenePoint;
  proofScale: number;
  chainOpacity: number;
  tempoBlocks: TempoBlock[];
  settlementFinality: number;
}
