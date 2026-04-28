/**
 * Manifest — registers every variant + its picker metadata in one place so
 * the preview page can render the picker chip set without duplicating
 * per-variant copy.
 *
 * Each `inspiration`, `hierarchy`, and `viz` field maps directly into the PR
 * body's variants table — the picker IS the source of truth for that table.
 */

import type { ComponentType } from "react";

import type { PortfolioFixture } from "@/lib/fixtures";

import Variant01 from "./variant-01-cow-centered";
import Variant02 from "./variant-02-mm-grid";
import Variant03 from "./variant-03-debank-dense";
import Variant04 from "./variant-04-wealthfront-soft";
import Variant05 from "./variant-05-aave-dual";
import Variant06 from "./variant-06-bloomberg-band";
import Variant07 from "./variant-07-robinhood-hero";
import Variant08 from "./variant-08-zerion-tabs";
import Variant09 from "./variant-09-rainbow-cards";
import Variant10 from "./variant-10-darkpool-report";

export type VariantSlot =
  | "dense"
  | "calm"
  | "hero-chart"
  | "tabbed";

export interface VariantMeta {
  id: string;
  number: string;
  name: string;
  slot: VariantSlot;
  inspiration: string;
  /** 6–10 word hierarchy summary for the "About this variant" line. */
  hierarchy: string;
  /** 4–6 word visualization summary for the "About this variant" line. */
  viz: string;
  Component: ComponentType<{ fixture: PortfolioFixture }>;
}

export const VARIANTS: VariantMeta[] = [
  {
    id: "01",
    number: "01",
    name: "Centered card",
    slot: "calm",
    inspiration: "CoW Swap",
    hierarchy: "Single hero card — value, sparkline, action row",
    viz: "Sparkline + ratio bar",
    Component: Variant01,
  },
  {
    id: "02",
    number: "02",
    name: "Multi-section grid",
    slot: "tabbed",
    inspiration: "MetaMask Portfolio",
    hierarchy: "Hero plus side-by-side holdings and activity columns",
    viz: "Sparkline + token bars",
    Component: Variant02,
  },
  {
    id: "03",
    number: "03",
    name: "Dense terminal",
    slot: "dense",
    inspiration: "DeBank",
    hierarchy: "Compact rows — token, balance, allocation, change",
    viz: "Inline mini-bars",
    Component: Variant03,
  },
  {
    id: "04",
    number: "04",
    name: "Narrative",
    slot: "calm",
    inspiration: "Wealthfront",
    hierarchy: "Editorial lede, line chart, allocation donut",
    viz: "Line chart + donut",
    Component: Variant04,
  },
  {
    id: "05",
    number: "05",
    name: "Dual-column",
    slot: "dense",
    inspiration: "Aave V3",
    hierarchy: "Positions on left, summary stack pinned right",
    viz: "Donut + ratio bars",
    Component: Variant05,
  },
  {
    id: "06",
    number: "06",
    name: "Performance band",
    slot: "dense",
    inspiration: "Restrained Bloomberg",
    hierarchy: "Top metrics band, dense holdings and activity grid",
    viz: "KPI band + sparkline",
    Component: Variant06,
  },
  {
    id: "07",
    number: "07",
    name: "Chart hero",
    slot: "hero-chart",
    inspiration: "Robinhood",
    hierarchy: "Chart-led — value above, range chips below",
    viz: "Large area chart",
    Component: Variant07,
  },
  {
    id: "08",
    number: "08",
    name: "Tabbed sections",
    slot: "tabbed",
    inspiration: "Zerion",
    hierarchy: "Overview, positions, activity, transfers — one at a time",
    viz: "Sparkline + segment bar",
    Component: Variant08,
  },
  {
    id: "09",
    number: "09",
    name: "Tinted cards",
    slot: "calm",
    inspiration: "Rainbow Wallet",
    hierarchy: "Per-token cards with restrained warm accents",
    viz: "Per-token sparklines",
    Component: Variant09,
  },
  {
    id: "10",
    number: "10",
    name: "Darkpool report",
    slot: "hero-chart",
    inspiration: "Omega original",
    hierarchy: "Report card — value, attestation strip, ledger",
    viz: "Sparkline + provenance band",
    Component: Variant10,
  },
];

export function variantById(id: string | null | undefined): VariantMeta {
  if (!id) return VARIANTS[0];
  return VARIANTS.find((v) => v.id === id) ?? VARIANTS[0];
}
