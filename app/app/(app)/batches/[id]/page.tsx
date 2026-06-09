import { Suspense } from "react";

import { BatchDetailView } from "../_components/batch-detail-view";

/**
 * /batches/[id] — per-batch settlement detail (M3.4 wireframe).
 *
 * Public surface, no wallet gating. The route segment `id` is informational
 * at the wireframe stage — fixtures drive the data via `?state=
 * detail-verified|detail-pending|detail-failed`. M6 swaps this for a real
 * fetch keyed on the segment.
 *
 * Privacy hard rule: aggregate-by-pair only. No counterparty IDs, no
 * individual fills with owner mapping.
 */
export default function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={null}>
      <BatchDetailView id={params.id} />
    </Suspense>
  );
}
