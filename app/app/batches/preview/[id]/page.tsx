"use client";

/**
 * /batches/preview/[id] — detail-mode picker. Same chip set as the
 * list-mode picker; the active chip drives which variant's Detail
 * component renders below. The route segment carries the batch number,
 * `?variant=NN` carries the active variant.
 *
 * Privacy contract — variants only render aggregate batch metadata. No
 * counterparty data anywhere.
 */

import * as React from "react";
import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout } from "@/components/shell/PageLayout";
import { batchesDetailFixtures } from "@/lib/fixtures";
import type { BatchesDetailFixture } from "@/lib/fixtures/types";
import type { BatchesDetailState } from "@/lib/fixtures/batches";

import { PickerNav } from "../_picker-nav";
import { VARIANTS, variantById } from "../_variants/manifest";

export default function BatchesPreviewDetailPage() {
  return (
    <AppShell route="/batches/preview">
      <Suspense fallback={null}>
        <BatchesPreviewDetailPicker />
      </Suspense>
    </AppShell>
  );
}

function BatchesPreviewDetailPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const route = useParams<{ id: string }>();
  const id = String(route?.id ?? "");
  const rawVariant = params.get("variant");
  const active = variantById(rawVariant);

  const onPick = (variantId: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("variant", variantId);
    router.replace(`/batches/preview/${id}?${next.toString()}`);
  };

  const fixture = pickDetailFixture(id, params.get("state"));
  const DetailVariant = active.Detail;
  const listHref = `/batches/preview?variant=${active.id}`;

  return (
    <PageLayout
      width="wide"
      title={`Batch · explorer picker`}
      description="Detail-mode preview. Switch variants to compare detail-page layouts. Production /batches/[id] is untouched."
    >
      <PickerNav
        variants={VARIANTS}
        active={active}
        onPick={onPick}
        mode="detail"
      />
      <section
        aria-label={`Variant ${active.number} — ${active.name} · detail`}
        className="mt-6 min-h-[60vh]"
      >
        <DetailVariant fixture={fixture} listHref={listHref} />
      </section>
    </PageLayout>
  );
}

/**
 * Pick a detail fixture. Three rules:
 *  1. `?state=detail-verified|detail-pending|detail-failed` overrides — useful
 *     for review-time variant coverage.
 *  2. Otherwise match the route segment to a known fixture batch number.
 *  3. Otherwise fall back to the verified happy path.
 */
function pickDetailFixture(
  id: string,
  stateParam: string | null,
): BatchesDetailFixture {
  if (stateParam === "detail-verified") return batchesDetailFixtures.verified;
  if (stateParam === "detail-pending") return batchesDetailFixtures.pending;
  if (stateParam === "detail-failed") return batchesDetailFixtures.failed;

  const numeric = /^\d+$/.test(id) ? Number(id) : null;
  if (numeric !== null) {
    const matchingState = (
      ["verified", "pending", "failed"] satisfies Extract<
        BatchesDetailState,
        "verified" | "pending" | "failed"
      >[]
    ).find((s) => batchesDetailFixtures[s].batch.number === numeric);
    if (matchingState) return batchesDetailFixtures[matchingState];
  }
  return batchesDetailFixtures.verified;
}
