import { Suspense } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { BatchesListView } from "./_components/batches-list-view";

/**
 * /batches — public settlement explorer (M3.4 wireframe).
 *
 * Per omega-docs#5 the surface is public: the AppShell renders without
 * `auth`, content stays visible regardless of `?walletState=`. The PRD
 * resolution Q3 anchors the default to the last 100 batches paginated
 * client-side; search by batch ID or tx hash narrows the table.
 *
 * Privacy hard rule: this page exposes aggregate metadata only. Counter-
 * party identity, individual fills, and order IDs surface only to their
 * owner via /portfolio.
 */
export default function BatchesPage() {
  return (
    <AppShell route="/batches">
      <Suspense fallback={null}>
        <BatchesListView />
      </Suspense>
    </AppShell>
  );
}
