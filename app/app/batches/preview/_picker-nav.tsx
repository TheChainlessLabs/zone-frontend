"use client";

/**
 * Picker chrome shared between the list-mode and detail-mode preview
 * surfaces. Lives outside the route folder so each `page.tsx` only
 * exports the route-allowed fields (default export, metadata, etc.).
 */

import * as React from "react";

import { Chip } from "@/components/ui/chip";

import type { VariantMeta } from "./_variants/manifest";

const SLOT_LABEL: Record<VariantMeta["slot"], string> = {
  dense: "Dense",
  calm: "Calm",
  timeline: "Timeline",
  "hero-card": "Hero card",
};

export function PickerNav({
  variants,
  active,
  onPick,
  mode,
}: {
  variants: VariantMeta[];
  active: VariantMeta;
  onPick: (id: string) => void;
  mode: "list" | "detail";
}) {
  return (
    <nav
      aria-label="Batches layout picker"
      className="surface-soft rounded-[var(--radius-lg)] bg-[var(--card)] p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {variants.map((v) => {
          const isActive = v.id === active.id;
          return (
            <Chip
              key={v.id}
              active={isActive}
              onClick={() => onPick(v.id)}
              aria-current={isActive ? "true" : undefined}
              className="data-[active=true]:bg-[var(--accent)] data-[active=true]:text-[var(--foreground)]"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                {v.number}
              </span>
              <span>{v.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                · {SLOT_LABEL[v.slot]}
              </span>
            </Chip>
          );
        })}
      </div>
      <AboutLine variant={active} mode={mode} />
    </nav>
  );
}

function AboutLine({
  variant,
  mode,
}: {
  variant: VariantMeta;
  mode: "list" | "detail";
}) {
  const hierarchy =
    mode === "list" ? variant.listHierarchy : variant.detailHierarchy;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        Variant {variant.number} · {mode}
      </span>
      <span>·</span>
      <span>
        Inspired by{" "}
        <strong className="text-[var(--foreground)]">
          {variant.inspiration}
        </strong>
      </span>
      <span>·</span>
      <span>{hierarchy}</span>
      <span>·</span>
      <span className="text-[var(--foreground)]">{variant.viz}</span>
    </p>
  );
}
