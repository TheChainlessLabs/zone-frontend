/**
 * Static registry for the 20 persona redesigns. Each `_redesigns/<id>.ts`
 * is a thin wrapper that re-exports its persona's default-or-named export
 * as `default`, with `// @ts-nocheck` to skip agent-produced type drift.
 *
 * The registry maps id → { Component, target } so the renderer can supply
 * appropriate props per surface (OrderForm needs pair/mode/midpoint;
 * full-page rebuilds render directly; BatchDetailView needs an id).
 */

import type { ComponentType } from "react";

import P01 from "./_redesigns/01";
import P02 from "./_redesigns/02";
import P03 from "./_redesigns/03";
import P04 from "./_redesigns/04";
import P05 from "./_redesigns/05";
import P06 from "./_redesigns/06";
import P07 from "./_redesigns/07";
import P08 from "./_redesigns/08";
import P09 from "./_redesigns/09";
import P10 from "./_redesigns/10";
import P11 from "./_redesigns/11";
import P12 from "./_redesigns/12";
import P13 from "./_redesigns/13";
import P14 from "./_redesigns/14";
import P15 from "./_redesigns/15";
import P16 from "./_redesigns/16";
import P17 from "./_redesigns/17";
import P18 from "./_redesigns/18";
import P19 from "./_redesigns/19";
import P20 from "./_redesigns/20";

export type RenderTarget =
  | "order-form"
  | "trade-page"
  | "portfolio-page"
  | "batches-page"
  | "batch-detail"
  | "account-page";

export interface RedesignEntry {
  id: string;
  Component: ComponentType<Record<string, unknown>>;
  target: RenderTarget;
}

export const REGISTRY: Record<string, RedesignEntry> = {
  "01": { id: "01", Component: P01 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "02": { id: "02", Component: P02 as unknown as ComponentType<Record<string, unknown>>, target: "trade-page" },
  "03": { id: "03", Component: P03 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "04": { id: "04", Component: P04 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "05": { id: "05", Component: P05 as unknown as ComponentType<Record<string, unknown>>, target: "batches-page" },
  "06": { id: "06", Component: P06 as unknown as ComponentType<Record<string, unknown>>, target: "batch-detail" },
  "07": { id: "07", Component: P07 as unknown as ComponentType<Record<string, unknown>>, target: "batches-page" },
  "08": { id: "08", Component: P08 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "09": { id: "09", Component: P09 as unknown as ComponentType<Record<string, unknown>>, target: "portfolio-page" },
  "10": { id: "10", Component: P10 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "11": { id: "11", Component: P11 as unknown as ComponentType<Record<string, unknown>>, target: "account-page" },
  "12": { id: "12", Component: P12 as unknown as ComponentType<Record<string, unknown>>, target: "trade-page" },
  "13": { id: "13", Component: P13 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "14": { id: "14", Component: P14 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "15": { id: "15", Component: P15 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "16": { id: "16", Component: P16 as unknown as ComponentType<Record<string, unknown>>, target: "batch-detail" },
  "17": { id: "17", Component: P17 as unknown as ComponentType<Record<string, unknown>>, target: "order-form" },
  "18": { id: "18", Component: P18 as unknown as ComponentType<Record<string, unknown>>, target: "portfolio-page" },
  "19": { id: "19", Component: P19 as unknown as ComponentType<Record<string, unknown>>, target: "trade-page" },
  "20": { id: "20", Component: P20 as unknown as ComponentType<Record<string, unknown>>, target: "trade-page" },
};
