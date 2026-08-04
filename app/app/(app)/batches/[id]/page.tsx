import { Suspense } from "react";

import { BatchDetailView } from "../_components/batch-detail-view";

/**
 * Public per-batch settlement detail backed by `zone_getBatch`.
 *
 * Privacy hard rule: aggregate-only. No counterparty, order, or fill IDs.
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
