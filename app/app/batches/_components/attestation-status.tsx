import * as React from "react";
import { Status } from "@/components/ui/status";
import type { BatchStatus } from "@/lib/fixtures/types";
import { copyForBatchStatus } from "@/lib/lifecycle-copy";

/**
 * AttestationStatus — maps a BatchStatus onto the Status primitive.
 *
 * The brand `Status` lexicon does not have a `verified` slot — verified
 * batches reuse the `settled` glyph + variant with a "Verified" label
 * override. Pending and failed map directly. The mapping lives here so
 * the explorer pages don't drift from each other.
 *
 * Each variant carries the M4.10 lifecycle tooltip so the technical
 * label stays canonical while non-crypto operators see plain language.
 */
const MAP: Record<BatchStatus, { state: "settled" | "pending" | "failed"; label: string }> = {
  verified: { state: "settled", label: "Verified" },
  pending: { state: "pending", label: "Pending" },
  failed: { state: "failed", label: "Failed" },
};

export interface AttestationStatusProps {
  status: BatchStatus;
  className?: string;
}

export function AttestationStatus({ status, className }: AttestationStatusProps) {
  const spec = MAP[status];
  return (
    <Status
      state={spec.state}
      label={spec.label}
      tooltip={copyForBatchStatus(status)}
      className={className}
    />
  );
}
