// Landing copy — ported verbatim from the design-kit landing page
// (ui_kits/landing-page/{app.jsx,scene.jsx}). The kit owns voice and copy:
// terse, no emoji, no exclamation; positioning is private stablecoin
// execution across chains and venues — match internally first, then access
// shielded external liquidity, with verifiable fills and compliance.

export const landingHero = {
  eyebrow: "Omega Markets",
  headline: "Private FX Swaps",
  supporting:
    "Omega Markets is the dark book for stablecoins",
  supportingBullets: [
    "Conversions fill privately, in anonymity",
    "Settlement is atomic - no credit for access, instant processing",
    "Fill receipts against external market midpoint",
  ],
  primaryCta: "Fund your account",
  secondaryCta: "Design partners",
  launchCta: "Launch app",
  researchCta: "Research",
  navCta: "Fund account",
  proofLabel: "Omega Markets Status",
  proofBadge: "LIVE ALPHA",
  proofSteps: [
    { description: "Private orders received", stat: "Txns Processed", value: "###" },
    { description: "Orders matched privately", stat: "Volume Matched", value: "###" },
    { description: "Current execution batch", stat: "Current Batch Number", value: "###" },
  ],
  scrollHint: "Scroll to follow a trade intent",
} as const;

export const whoIsOmega = {
  title: "Who is Omega for",
  subtitle: "All stablecoin users",
  users: [
    {
      name: "Businesses",
      description: "Move stablecoins and FX at scale without broadcasting your portfolio and business.",
    },
    {
      name: "Individuals",
      description: "Open infrastructure for anyone to swap at institutional rates and make transfers privately.",
    },
  ],
} as const;

export const whyOmega = {
  title: "Why swap on Omega",
  benefits: [
    "No opaque dealer pricing",
    "Private portfolio",
    "Predictable fills",
    "Verifiable against market midpoint",
  ],
} as const;

export const signupOptions = {
  user: {
    type: "User",
    label: "Fund Account",
    description: "Set up your account and start trading on Omega.",
    cta: "Fund your account",
  },
  integrator: {
    type: "Integrator",
    label: "Design Partner",
    description: "Integrate Omega's execution layer into your platform or app.",
    cta: "Become a design partner",
  },
} as const;

// The mechanism scene — four scroll-driven states (scene.jsx SCROLL_STATES).
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
] as const;

export const mechanismIntro = {
  eyebrow: "Mechanism",
  title: "The page is a proof path, not a pitch deck.",
  supporting:
    "Omega's landing narrative should show the execution room: private intent, midpoint-first matching, shielded venue access, then verifiable settlement.",
  rails: [
    { label: "Input", value: "Private intent" },
    { label: "Price", value: "Midpoint first" },
    { label: "Route", value: "Shielded fallback" },
    { label: "Output", value: "Proof artifact" },
  ],
} as const;

// Why Omega — benefits list for FX Spot landing

export const featureBlocks = [
  {
    title: "On-chain Reference Rate",
    icon: "TrendingUp",
    body:
      "Price discovery in a dark book protects trader interests and sets the floor on capital efficiency of a cross-currency business.",
  },
  {
    title: "Private, Dark Book",
    icon: "Lock",
    body:
      "Makers can’t be picked off and taker strategies are protected in our private orderbook.",
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
    title: "Verifiable",
    icon: "BadgeCheck",
    body:
      "Don’t trust Omega implicitly — trust the cryptography. Verifiable fills without compromising privacy.",
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
    name: "Merchants",
    icon: "ShoppingCart",
    desc:
      "Make vendor payments in private at institutional rates.",
  },
  {
    name: "Trading Desks",
    icon: "TrendingUp",
    desc:
      "Manage USD and cross-currency stablecoin portfolio (i.e., hedges, leverage positions).",
  },
  {
    name: "Retail",
    icon: "User",
    desc:
      "Swap money abroad in private.",
  },
  {
    name: "Payment Processors",
    icon: "CreditCard",
    desc:
      "Rebalance on-chain portfolios in private with high-performance matching engine and limit orderbook.",
  },
  {
    name: "Web3 Protocols",
    icon: "Code",
    desc:
      "Extend private price discovery to your applications (end-to-end encrypted).",
  },
] as const;

export const userSignup = {
  title: "Request Access",
  emailPlaceholder: "your@email.com",
  buttonText: "Submit",
  privacyText: "Privacy Policy",
  privacyLink: "#privacy",
} as const;

export const developerSignup = {
  title: "Developer Interest",
  emailPlaceholder: "your@email.com",
  telegramPlaceholder: "@yourtelegram",
  telegramLabel: "Telegram",
  checkboxLabel: "Add me to public Telegram group",
  buttonText: "Submit",
  privacyText: "Privacy Policy",
  privacyLink: "#privacy",
} as const;

export const footer = {
  tagline: "Private stablecoin execution · Onchain settlement",
  links: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Documentation", href: "https://docs.omega.markets" },
  ],
} as const;
