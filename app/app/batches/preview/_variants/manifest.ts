/**
 * Manifest — registers every batches preview variant pair (list + detail)
 * plus its picker metadata in one place. Each `inspiration`, `hierarchy`,
 * and `viz` field maps directly into the PR body's variants table.
 *
 * Privacy contract: every variant on this surface renders aggregate-only
 * batch metadata. No counterparty data, no per-user order IDs, no traces
 * from one user's order to another. The shared helpers in `_shared.tsx`
 * enforce this at the data layer; the variants enforce it visually.
 */

import type { ComponentType } from "react";

import type {
  DetailVariantProps,
  ListVariantProps,
} from "./_shared";

import V01List from "./variant-01-etherscan-restrained/list";
import V01Detail from "./variant-01-etherscan-restrained/detail";
import V02List from "./variant-02-linear-feed/list";
import V02Detail from "./variant-02-linear-feed/detail";
import V03List from "./variant-03-l2beat-dashboard/list";
import V03Detail from "./variant-03-l2beat-dashboard/detail";
import V04List from "./variant-04-vercel-activity/list";
import V04Detail from "./variant-04-vercel-activity/detail";
import V05List from "./variant-05-stripe-balance/list";
import V05Detail from "./variant-05-stripe-balance/detail";
import V06List from "./variant-06-penumbra-quiet/list";
import V06Detail from "./variant-06-penumbra-quiet/detail";
import V07List from "./variant-07-aztec-proof-hero/list";
import V07Detail from "./variant-07-aztec-proof-hero/detail";
import V08List from "./variant-08-bloomberg-restrained/list";
import V08Detail from "./variant-08-bloomberg-restrained/detail";
import V09List from "./variant-09-calm-narrative/list";
import V09Detail from "./variant-09-calm-narrative/detail";
import V10List from "./variant-10-omega-darkpool/list";
import V10Detail from "./variant-10-omega-darkpool/detail";

export type VariantSlot = "dense" | "calm" | "timeline" | "hero-card";

export interface VariantMeta {
  id: string;
  number: string;
  name: string;
  slot: VariantSlot;
  inspiration: string;
  /** 6–10 word hierarchy summary — list page. */
  listHierarchy: string;
  /** 6–10 word hierarchy summary — detail page. */
  detailHierarchy: string;
  /** 4–6 word visualization summary. */
  viz: string;
  List: ComponentType<ListVariantProps>;
  Detail: ComponentType<DetailVariantProps>;
}

export const VARIANTS: VariantMeta[] = [
  {
    id: "01",
    number: "01",
    name: "Etherscan-restrained",
    slot: "dense",
    inspiration: "Etherscan",
    listHierarchy: "KPI strip atop dense hash-and-status table",
    detailHierarchy: "Tabbed Overview / Pairs / Proof",
    viz: "State pips + KPI grid",
    List: V01List,
    Detail: V01Detail,
  },
  {
    id: "02",
    number: "02",
    name: "Linear-feed",
    slot: "calm",
    inspiration: "Linear All Issues",
    listHierarchy: "Status pill leads each one-line row",
    detailHierarchy: "Ticket card with right metadata rail",
    viz: "Pair bars + state pips",
    List: V02List,
    Detail: V02Detail,
  },
  {
    id: "03",
    number: "03",
    name: "L2Beat-dashboard",
    slot: "dense",
    inspiration: "L2Beat",
    listHierarchy: "KPI band, sparkline, mini-bar volume share",
    detailHierarchy: "Stat band, state machine, pair bars",
    viz: "Sparkline + mini-bars + pips",
    List: V03List,
    Detail: V03Detail,
  },
  {
    id: "04",
    number: "04",
    name: "Vercel-activity",
    slot: "timeline",
    inspiration: "Vercel Activity",
    listHierarchy: "Vertical timeline with leading dot rail",
    detailHierarchy: "Build-log style state events stream",
    viz: "Timeline rail + dot stops",
    List: V04List,
    Detail: V04Detail,
  },
  {
    id: "05",
    number: "05",
    name: "Stripe-balance",
    slot: "calm",
    inspiration: "Stripe Dashboard",
    listHierarchy: "Cleared-volume header, journal-entry rows",
    detailHierarchy: "Receipt — line items, total, audit",
    viz: "Status pill + state pips",
    List: V05List,
    Detail: V05Detail,
  },
  {
    id: "06",
    number: "06",
    name: "Penumbra-quiet",
    slot: "timeline",
    inspiration: "Penumbra block explorer",
    listHierarchy: "Minimal three-column number / time / status",
    detailHierarchy: "Lifecycle gantt dominates the canvas",
    viz: "SVG gantt + stage stamps",
    List: V06List,
    Detail: V06Detail,
  },
  {
    id: "07",
    number: "07",
    name: "Aztec-proof-hero",
    slot: "hero-card",
    inspiration: "Aztec Connect",
    listHierarchy: "Status-tone band leads each report card",
    detailHierarchy: "Proof gauge with stage list orbit",
    viz: "Circular gauge + stage list",
    List: V07List,
    Detail: V07Detail,
  },
  {
    id: "08",
    number: "08",
    name: "Bloomberg-restrained",
    slot: "dense",
    inspiration: "Bloomberg Terminal",
    listHierarchy: "Terminal-density table with dual mini-bars",
    detailHierarchy: "Three-pane state / pairs / audit",
    viz: "Mini-bars + pips + pair bars",
    List: V08List,
    Detail: V08Detail,
  },
  {
    id: "09",
    number: "09",
    name: "Calm narrative",
    slot: "calm",
    inspiration: "Wealthfront / CoW Swap",
    listHierarchy: "Editorial lede over generous record cards",
    detailHierarchy: "Lede paragraph then sectioned content",
    viz: "State pips only — paragraph-led",
    List: V09List,
    Detail: V09Detail,
  },
  {
    id: "10",
    number: "10",
    name: "Omega original",
    slot: "hero-card",
    inspiration: "Omega original",
    listHierarchy: "Report cards with state pips and mini-bars",
    detailHierarchy: "Hero card, provenance band, pair bars",
    viz: "Provenance band + pair bars + pips",
    List: V10List,
    Detail: V10Detail,
  },
];

export function variantById(id: string | null | undefined): VariantMeta {
  if (!id) return VARIANTS[0];
  const found = VARIANTS.find((v) => v.id === id);
  return found ?? VARIANTS[0];
}

export function isValidVariantId(id: string | null | undefined): boolean {
  if (!id) return false;
  return VARIANTS.some((v) => v.id === id);
}
