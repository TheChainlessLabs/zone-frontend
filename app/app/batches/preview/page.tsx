"use client";

/**
 * /batches/preview — comparison picker for 10 alternative explorer
 * layouts. Sibling route to production /batches (untouched). Detail-mode
 * lives at /batches/preview/[id].
 *
 * URL state: `?variant=01..10` selects the rendered list layout. Each
 * variant reads the same default fixture so the comparison surfaces
 * design differences, not data-coverage gaps. Variant rows link to
 * /batches/preview/<batchNumber>?variant=NN so the list→detail flow
 * stays coherent inside one variant.
 *
 * Privacy contract — every variant on this surface renders aggregate
 * batch metadata only. No counterparty data anywhere.
 */

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout } from "@/components/shell/PageLayout";
import { batchesListFixtures } from "@/lib/fixtures";

import { PickerNav } from "./_picker-nav";
import { VARIANTS, variantById } from "./_variants/manifest";

export default function BatchesPreviewPage() {
  return (
    <AppShell route="/batches/preview">
      <Suspense fallback={null}>
        <BatchesPreviewListPicker />
      </Suspense>
    </AppShell>
  );
}

function BatchesPreviewListPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const rawVariant = params.get("variant");
  const active = variantById(rawVariant);

  const onPick = (id: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("variant", id);
    router.replace(`/batches/preview?${next.toString()}`);
  };

  const fixture = batchesListFixtures.default;
  const ListVariant = active.List;
  const buildHref = React.useCallback(
    (batchNumber: number) =>
      `/batches/preview/${batchNumber}?variant=${active.id}`,
    [active.id],
  );

  return (
    <PageLayout
      width="wide"
      title="Batches · explorer picker"
      description="Ten layout variants for /batches and /batches/[id]. Pick one to compare. Production /batches is untouched."
    >
      <PickerNav
        variants={VARIANTS}
        active={active}
        onPick={onPick}
        mode="list"
      />
      <section
        aria-label={`Variant ${active.number} — ${active.name} · list`}
        className="mt-6 min-h-[60vh]"
      >
        <ListVariant fixture={fixture} buildHref={buildHref} />
      </section>
    </PageLayout>
  );
}
