"use client";

/**
 * /portfolio/preview — comparison picker for 10 alternative portfolio
 * layouts. Sibling route to production /portfolio (which is untouched).
 *
 * URL state: `?variant=01..10` selects the rendered layout. Each variant
 * reads the same fixture set so the comparison is honest. The picker UI
 * stays calm — chips wrap, the "About this variant" line gives a 1-line
 * description, and the variant area scrolls underneath.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout } from "@/components/shell/PageLayout";
import { Chip } from "@/components/ui/chip";
import { portfolioFixtures } from "@/lib/fixtures";

import {
  VARIANTS,
  variantById,
  type VariantMeta,
} from "./_variants/manifest";

const SLOT_LABEL: Record<VariantMeta["slot"], string> = {
  dense: "Dense",
  calm: "Calm",
  "hero-chart": "Chart-led",
  tabbed: "Tabbed",
};

export default function PortfolioPreviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const rawVariant = params.get("variant");
  const active = variantById(rawVariant);

  const onPick = (id: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("variant", id);
    router.replace(`/portfolio/preview?${next.toString()}`);
  };

  // Always show the rendered variants over the same default fixture so
  // the comparison surfaces layout differences, not state-coverage gaps.
  const fixture = portfolioFixtures.default;
  const Variant = active.Component;

  return (
    <AppShell route="/portfolio/preview">
      <PageLayout
        width="wide"
        title="Portfolio · layout picker"
        description="Ten layout variants for /portfolio. Pick one to compare. Production /portfolio is untouched."
      >
        <nav
          aria-label="Portfolio layout picker"
          className="surface-soft mb-6 rounded-[var(--radius-lg)] bg-[var(--card)] p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((v) => {
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

          <AboutLine variant={active} />
        </nav>

        <section
          aria-label={`Variant ${active.number} — ${active.name}`}
          className="min-h-[60vh]"
        >
          <Variant fixture={fixture} />
        </section>
      </PageLayout>
    </AppShell>
  );
}

function AboutLine({ variant }: { variant: VariantMeta }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        Variant {variant.number}
      </span>
      <span>·</span>
      <span>
        Inspired by <strong className="text-[var(--foreground)]">{variant.inspiration}</strong>
      </span>
      <span>·</span>
      <span>{variant.hierarchy}</span>
      <span>·</span>
      <span className="text-[var(--foreground)]">{variant.viz}</span>
    </p>
  );
}
