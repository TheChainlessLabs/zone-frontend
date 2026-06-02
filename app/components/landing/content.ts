export const landingHero = {
  eyebrow: "Omega Markets",
  headline: "Darkpool spot FX. Onchain settlement.",
  supporting:
    "Private order flow enters the darkpool. Only proof and settlement exit.",
  primaryCta: "Request Access",
  secondaryCta: "View mechanism",
} as const;

export const scrollStates = [
  {
    id: "private-order",
    step: "01",
    label: "Private Order",
    title: "A sealed order enters the field.",
    body:
      "A private order starts as a precise object carrying size, direction, and intent.",
  },
  {
    id: "midpoint-match",
    step: "02",
    label: "Midpoint Match",
    title: "The darkpool makes intent unreadable.",
    body:
      "Other order objects orbit and enter. Inside the event horizon, order paths and counterparties disappear.",
  },
  {
    id: "batch-proof",
    step: "03",
    label: "Batch Proof",
    title: "Noise exits. One proof survives.",
    body:
      "The output is meaningless radiation plus one clean proof capsule that can be checked without revealing the flow.",
  },
  {
    id: "onchain-settlement",
    step: "04",
    label: "Onchain Settlement",
    title: "Tempo includes and finalizes the proof.",
    body:
      "Tempo keeps producing blocks. The proof is pinned into one block, then finalizes after newer blocks extend the chain.",
  },
] as const;

export const featureBlocks = [
  {
    title: "Midpoint-or-better pricing",
    body:
      "Resting liquidity inside the Omega book means fills target midpoint or better before external routing.",
  },
  {
    title: "No pre-fill visibility",
    body:
      "Orders are not visible before they fill, so counterparties cannot trade against your intent.",
  },
  {
    title: "Private balances and transfers",
    body:
      "Balances and optional transfer details stay private while withdrawal remains available.",
  },
  {
    title: "Verifiable execution",
    body:
      "Every fill produces proof artifacts that can be checked without exposing the private order path.",
  },
] as const;

export const audienceLine =
  "Built for funds, treasuries, onchain traders, payment processors, and FX-exposed crypto businesses.";
