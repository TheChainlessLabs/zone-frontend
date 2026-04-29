"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { batchesDetailFixtures } from "@/lib/fixtures";
import type { BatchesDetailFixture } from "@/lib/fixtures/types";

import Variant07Detail from "../preview/_variants/variant-07-aztec-proof-hero/detail";

/**
 * BatchDetailView — per-batch verification surface.
 *
 * Privacy hard rule: aggregate-by-pair only. No individual fills, no
 * counterparty IDs, no order IDs. Users see their own fills via
 * /portfolio. Three default cells (verified / pending / failed) are
 * reachable via `?state=detail-verified|detail-pending|detail-failed`.
 *
 * Layout is the Aztec-proof-hero variant (proof gauge + stage list +
 * pair aggregate + audit hashes). Production keeps the route-segment
 * fallback for the displayed batch number.
 */

type DetailStateKey = "detail-verified" | "detail-pending" | "detail-failed";

const STATE_TO_FIXTURE: Record<DetailStateKey, BatchesDetailFixture> = {
  "detail-verified": batchesDetailFixtures.verified,
  "detail-pending": batchesDetailFixtures.pending,
  "detail-failed": batchesDetailFixtures.failed,
};

const VALID_DETAIL_KEYS = new Set<DetailStateKey>([
  "detail-verified",
  "detail-pending",
  "detail-failed",
]);

export function BatchDetailView({ id }: { id: string }) {
  const params = useSearchParams();
  const raw = params.get("state");
  const key: DetailStateKey =
    raw && VALID_DETAIL_KEYS.has(raw as DetailStateKey)
      ? (raw as DetailStateKey)
      : "detail-verified";
  const fixture = STATE_TO_FIXTURE[key];

  // Honour the route segment for the title even when we render a
  // status-keyed fixture. Falls back to the fixture batch number.
  const overrideNumber = /^\d+$/.test(id) ? Number(id) : null;
  const fixtureForVariant: BatchesDetailFixture =
    overrideNumber !== null
      ? {
          ...fixture,
          batch: { ...fixture.batch, number: overrideNumber },
        }
      : fixture;

  return (
    <PageLayout width="wide">
      <Variant07Detail fixture={fixtureForVariant} listHref="/batches" />
      <PrivacyFooter />
    </PageLayout>
  );
}

function PrivacyFooter() {
  return (
    <Card className="mt-5 flex flex-col gap-2 p-5 text-xs text-[var(--muted-foreground)]">
      <span className="inline-flex items-center gap-1.5 font-medium text-[var(--foreground)]">
        <Icon.Proof className="h-3.5 w-3.5" aria-hidden />
        Externally verifiable
      </span>
      <p className="leading-relaxed">
        Anyone can verify this batch&apos;s proof on-chain. Individual fills are visible only to their counterparties — see{" "}
        <Link
          href="/portfolio"
          className="underline-offset-4 hover:text-[var(--foreground)] hover:underline"
        >
          /portfolio
        </Link>
        .
      </p>
    </Card>
  );
}
