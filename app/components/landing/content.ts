// Landing copy — ported verbatim from the design-kit landing page
// (ui_kits/landing-page/{app.jsx,scene.jsx}). The kit owns voice and copy:
// terse, no emoji, no exclamation; positioning is private stablecoin
// execution across chains and venues — match internally first, then access
// shielded external liquidity, with verifiable fills and compliance.

export const landingHero = {
  eyebrow: "Omega Markets",
  headline: "Private stablecoin execution across chains and venues.",
  supporting:
    "Omega matches stablecoin orders privately, accesses external liquidity when needed, and settles with verifiable proofs.",
  primaryCta: "Request Access",
  scrollHint: "Scroll to follow an intent",
} as const;

// The mechanism scene — five scroll-driven states (scene.jsx SCROLL_STATES).
export const scrollStates = [
  {
    id: "intent",
    step: "01",
    label: "Intent Enters Privately",
    title: "Intent enters privately.",
    body:
      "A fund, treasury, payment company, exchange, or onchain trader submits a stablecoin FX intent. The order enters Omega privately — the market does not see who placed it, how large it is, or where it may route.",
  },
  {
    id: "matching",
    step: "02",
    label: "Private Orderbook Matching",
    title: "Private orderbook matching.",
    body:
      "Omega first matches flow inside its offchain darkpool orderbook. Resting liquidity, counterflow, and block-size interest can execute internally — without exposing orders to public venues, mempools, bots, or market makers.",
  },
  {
    id: "liquidity",
    step: "03",
    label: "Cross-Venue Liquidity Access",
    title: "Cross-venue liquidity access.",
    body:
      "When broader liquidity improves execution, Omega accesses external venues through a shielded execution layer. External participants see only the flow Omega exposes — not the original trader, full order size, or private book state.",
  },
  {
    id: "execution",
    step: "04",
    label: "Verifiable Execution",
    title: "Verifiable execution.",
    body:
      "Every fill produces proof artifacts for execution and settlement. Users can verify that orders were processed correctly without revealing the private matching path.",
  },
  {
    id: "settlement",
    step: "05",
    label: "Onchain Settlement",
    title: "Settlement exits only when needed.",
    body:
      "Omega keeps execution private offchain while anchoring settlement, withdrawals, and verification artifacts onchain. Only what needs to exit, exits.",
  },
] as const;

// Why Omega — six glass feature cards (app.jsx FEATURES). Icons are Lucide
// names; the app renders them with lucide-react instead of inline path data.
export const whyOmega = {
  eyebrow: "Why Omega",
  title: "Private execution for stablecoin FX.",
  supporting:
    "Omega combines a private offchain orderbook with shielded access to cross-chain and cross-venue liquidity.",
} as const;

export const featureBlocks = [
  {
    title: "Stable rates everywhere",
    icon: "Maximize",
    body:
      "Access stablecoin liquidity across chains, venues, market makers, and private flow.",
  },
  {
    title: "Private orderbook first",
    icon: "Share2",
    body:
      "Orders match inside Omega’s darkpool before interacting with external liquidity.",
  },
  {
    title: "Shielded external liquidity",
    icon: "Shield",
    body:
      "External venues never see the original trader, full order size, or private book state.",
  },
  {
    title: "No pre-trade visibility",
    icon: "EyeOff",
    body:
      "Your intent stays hidden before execution, reducing leakage to bots and counterparties.",
  },
  {
    title: "Verifiable fills",
    icon: "BadgeCheck",
    body:
      "Each fill creates proof artifacts without exposing the full private execution path.",
  },
  {
    title: "Compliance by default",
    icon: "ShieldCheck",
    body:
      "TIP-based policies make private execution compatible with regulated stablecoin flows.",
  },
] as const;

// Built for — six glass audience cards (app.jsx AUDIENCES).
export const builtFor = {
  eyebrow: "Built for",
  title: "Private execution for high-value stablecoin flow.",
  supporting:
    "For teams moving size across chains, venues, and counterparties without leaking intent.",
} as const;

export const audiences = [
  {
    name: "Funds",
    icon: "LineChart",
    desc:
      "Move stablecoin size privately across chains and venues without signalling positions to the market.",
  },
  {
    name: "Treasuries",
    icon: "Landmark",
    desc:
      "Rebalance stablecoin balances across ecosystems at predictable rates, with verifiable settlement.",
  },
  {
    name: "Onchain traders",
    icon: "TrendingDown",
    desc:
      "Execute large swaps without exposing intent to bots, counterparties, or public mempools.",
  },
  {
    name: "Payment processors",
    icon: "CreditCard",
    desc:
      "Route customer and merchant stablecoin flows with private execution and compliance-aware settlement.",
  },
  {
    name: "OTC desks",
    icon: "Maximize",
    desc:
      "Source and match block liquidity through private routes instead of fragmented chat-based workflows.",
  },
  {
    name: "Exchanges",
    icon: "Wallet",
    desc:
      "Access private cross-venue stablecoin liquidity through one execution backend.",
  },
] as const;

export const footer = {
  tagline: "Private stablecoin execution · Onchain settlement",
} as const;
