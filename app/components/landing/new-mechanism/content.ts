// Three-step mechanism copy — "How Omega works". Labels are the short
// property tags (hidden intent / internal execution / atomic, verifiable);
// titles and bodies follow the approved three-card copy.

export const scrollStates = [
  {
    id: "intent",
    step: "01",
    label: "Private Trade Submitted",
    title: "Trade intent enters Omega Markets privately.",
    body:
      "A fund, treasury, payment platform, or onchain trader submits a stablecoin FX trade intent. The market never sees who placed it, how large it is, or where it may route.",
  },
  {
    id: "matching",
    step: "02",
    label: "Internal Execution",
    title: "The dark book matches.",
    body:
      "Resting liquidity, counterflow, and block-size interest execute inside Omega's private order book — never exposed to public venues, mempools, or bots.",
  },
  {
    id: "execution",
    step: "03",
    label: "Atomic, Verifiable",
    title: "Proof, then settlement.",
    body:
      "Every fill produces proof of correct execution — verifiable without revealing the matching path. Settlement is atomic: both legs or neither, no credit in the middle. Critically, the receipt prints the fill against reference mid — effectively setting the on-chain market price for FX.",
  },
] as const;
