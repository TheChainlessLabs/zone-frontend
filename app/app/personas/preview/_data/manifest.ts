/**
 * Manifest of all 20 personas in the design review batch. Light metadata
 * only (name, tagline, runtime, attitude, primary value, target surface);
 * the full critique / inspirations / manifesto / redesign source come
 * from disk via server-component file reads in `page.tsx`.
 */

export interface PersonaMeta {
  id: string;
  number: string;
  name: string;
  city: string;
  tagline: string;
  runtime: "claude-code" | "codex";
  attitude: 1 | 2 | 3 | 4 | 5;
  primaryValue: string;
  /** Filename in `runs/<id>/redesign/`. */
  redesignFile: string;
  /** Which production surface their redesign targets. */
  target:
    | "OrderForm"
    | "/trade"
    | "/portfolio"
    | "/batches"
    | "/batches/[id]"
    | "/account";
}

export const PERSONAS: PersonaMeta[] = [
  {
    id: "01",
    number: "01",
    name: "Daniel Cho",
    city: "Seoul",
    tagline: "Execution clarity over aesthetic indulgence",
    runtime: "claude-code",
    attitude: 2,
    primaryValue: "Execution certainty",
    redesignFile: "order-form-daniel.tsx",
    target: "OrderForm",
  },
  {
    id: "02",
    number: "02",
    name: "Mei Lin",
    city: "Shanghai",
    tagline: "Calm density, not Western emptiness",
    runtime: "claude-code",
    attitude: 4,
    primaryValue: "Mobile-first ergonomics",
    redesignFile: "trade-mobile-mei.tsx",
    target: "/trade",
  },
  {
    id: "03",
    number: "03",
    name: "Rafael Mendes",
    city: "São Paulo",
    tagline: "Speed is the design",
    runtime: "codex",
    attitude: 3,
    primaryValue: "Perceived latency",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "04",
    number: "04",
    name: "Amira Haddad",
    city: "Dubai",
    tagline: "Private capital needs private tone",
    runtime: "claude-code",
    attitude: 2,
    primaryValue: "Weight of seriousness",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "05",
    number: "05",
    name: "Luca Bianchi",
    city: "Milan",
    tagline: "Make verification editorial",
    runtime: "claude-code",
    attitude: 4,
    primaryValue: "Narrative trust",
    redesignFile: "batches-page.tsx",
    target: "/batches",
  },
  {
    id: "06",
    number: "06",
    name: "Yuki Tanaka",
    city: "Tokyo",
    tagline: "Motion should whisper",
    runtime: "codex",
    attitude: 3,
    primaryValue: "Quiet liveliness",
    redesignFile: "batch-detail-view.tsx",
    target: "/batches/[id]",
  },
  {
    id: "07",
    number: "07",
    name: "Kevin Park",
    city: "San Francisco",
    tagline: "Delete the decoration",
    runtime: "codex",
    attitude: 5,
    primaryValue: "Operational legibility",
    redesignFile: "batches-page.tsx",
    target: "/batches",
  },
  {
    id: "08",
    number: "08",
    name: "Aisha Khan",
    city: "London",
    tagline: "If it excludes, it fails",
    runtime: "claude-code",
    attitude: 3,
    primaryValue: "Accessible confidence",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "09",
    number: "09",
    name: "Arjun Mehta",
    city: "Mumbai",
    tagline: "More signal per pixel",
    runtime: "codex",
    attitude: 4,
    primaryValue: "Data density",
    redesignFile: "portfolio-page.tsx",
    target: "/portfolio",
  },
  {
    id: "10",
    number: "10",
    name: "Sophie Dubois",
    city: "Paris",
    tagline: "The brand must have posture",
    runtime: "claude-code",
    attitude: 2,
    primaryValue: "Brand coherence",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "11",
    number: "11",
    name: "Marcus Reed",
    city: "New York City",
    tagline: "Trust is a workflow",
    runtime: "claude-code",
    attitude: 3,
    primaryValue: "Operational trust",
    redesignFile: "account-marcus.tsx",
    target: "/account",
  },
  {
    id: "12",
    number: "12",
    name: "Priya Nair",
    city: "Singapore",
    tagline: "Perp traders need muscle memory",
    runtime: "codex",
    attitude: 3,
    primaryValue: "Trader muscle memory",
    redesignFile: "trade-page.tsx",
    target: "/trade",
  },
  {
    id: "13",
    number: "13",
    name: "Caleb Williams",
    city: "Austin",
    tagline: "Make it feel alpha",
    runtime: "claude-code",
    attitude: 3,
    primaryValue: "Crypto-native confidence",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "14",
    number: "14",
    name: "Hana Mori",
    city: "Kyoto",
    tagline: "Silence is a feature",
    runtime: "claude-code",
    attitude: 1,
    primaryValue: "Atmospheric restraint",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "15",
    number: "15",
    name: "Elena Petrova",
    city: "Berlin",
    tagline: "Systems beat screens",
    runtime: "codex",
    attitude: 2,
    primaryValue: "System coherence",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "16",
    number: "16",
    name: "Omar El-Sayed",
    city: "Cairo",
    tagline: "Game UI teaches state",
    runtime: "codex",
    attitude: 5,
    primaryValue: "State readability",
    redesignFile: "batch-detail-hud.tsx",
    target: "/batches/[id]",
  },
  {
    id: "17",
    number: "17",
    name: "Grace Miller",
    city: "Chicago",
    tagline: "Respect the trader's clock",
    runtime: "claude-code",
    attitude: 3,
    primaryValue: "Plain-language safety",
    redesignFile: "order-form.tsx",
    target: "OrderForm",
  },
  {
    id: "18",
    number: "18",
    name: "Nathan Brooks",
    city: "Toronto",
    tagline: "Portfolio is the product",
    runtime: "codex",
    attitude: 4,
    primaryValue: "Reconciliation confidence",
    redesignFile: "portfolio-ledger-dashboard.tsx",
    target: "/portfolio",
  },
  {
    id: "19",
    number: "19",
    name: "Talia Nguyen",
    city: "Ho Chi Minh City",
    tagline: "Phone first, always",
    runtime: "claude-code",
    attitude: 5,
    primaryValue: "Mobile completion",
    redesignFile: "trade-page.tsx",
    target: "/trade",
  },
  {
    id: "20",
    number: "20",
    name: "Brian Osei",
    city: "Accra",
    tagline: "Infrastructure must travel well",
    runtime: "codex",
    attitude: 5,
    primaryValue: "Resilient usability",
    redesignFile: "trade-page.tsx",
    target: "/trade",
  },
];

export function personaById(id: string | null | undefined): PersonaMeta {
  if (!id) return PERSONAS[0];
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
