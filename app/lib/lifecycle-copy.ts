/**
 * Lifecycle copy — plain-language tooltip text for every state pill.
 *
 * The technical labels (`Queued`, `Sealed`, `Proven`, `Settled`,
 * `Pending`, `Failed`, `Verified`, …) stay canonical on the surface so
 * the explorer reads as an institutional venue, not a consumer wallet.
 * The tooltip carries the [what happened] [what to do next] sentence
 * for non-crypto operators — the Monzo writing system, lifted by the
 * brand voice in `omega-docs/03-brand/messaging.md` (factual, terse,
 * no marketing fluff, no exclamations).
 *
 * Centralised here so future surfaces reuse a single source of truth —
 * if the copy ever needs to change, it changes once.
 *
 * Source signal: M4.10 / B07 — Decision 3 = A (keep technical canonical,
 * tooltip bridges).
 */
import type { StatusState } from "@/components/ui/status";
import type { ZoneBatchStatus } from "@/lib/zone";

export type LifecycleSurface = "deposit" | "withdrawal";

/**
 * Stable keys for every lifecycle copy entry. Keep these grep-able so a
 * change to the underlying lexicon flushes through every site.
 */
export type LifecycleKey =
  | "queued"
  | "sealed"
  | "proven"
  | "settled"
  | "submitted"
  | "pending-deposit"
  | "pending-withdrawal"
  | "pending-batch"
  | "failed"
  | "verified"
  | "matched"
  | "submitting"
  | "awaiting-signature"
  | "cancelled"
  | "wrong-network"
  | "connected";

export const LIFECYCLE_COPY: Record<LifecycleKey, string> = {
  queued: "Submitted, waiting for the next batch sealing.",
  sealed: "Included in a finalized zone block range.",
  proven: "The zone reports this batch proof as verified.",
  settled: "Submitted to Tempo L1.",
  submitted: "Submitted to Tempo L1.",
  "pending-deposit": "Awaiting on-chain confirmation.",
  "pending-withdrawal": "Awaiting batch sealing then L1 anchor.",
  "pending-batch": "Zone blocks produced; awaiting Tempo L1 submission.",
  failed: "Batch submission failed.",
  verified: "Proof verified for the Tempo L1 submission.",
  matched: "Matched in batch — awaiting proof generation.",
  submitting: "Sending the order to the matching engine.",
  "awaiting-signature": "Confirm in your wallet to proceed.",
  cancelled: "Cancelled before any fills landed. Nothing settled.",
  "wrong-network": "Switch to the configured chain to continue.",
  connected: "Wallet connected. Ready to trade.",
};

/**
 * Lookup helper: copy for a `Status` primitive (`StatusState` lexicon).
 *
 * Pending is ambiguous between deposit and withdrawal — the surface
 * passes its own context via `surface` to disambiguate. Defaults to the
 * deposit copy because the deposit flow is the more common pending site
 * (every fill funds-in passes through deposit; withdrawal pending is
 * explicit, post-signature).
 */
export function copyForStatusState(
  state: StatusState,
  surface?: LifecycleSurface,
): string | null {
  if (state === "pending") {
    return surface === "withdrawal"
      ? LIFECYCLE_COPY["pending-withdrawal"]
      : LIFECYCLE_COPY["pending-deposit"];
  }
  if (state === "matched") return LIFECYCLE_COPY.matched;
  if (state === "settled") return LIFECYCLE_COPY.settled;
  if (state === "proven") return LIFECYCLE_COPY.proven;
  if (state === "failed") return LIFECYCLE_COPY.failed;
  if (state === "submitting") return LIFECYCLE_COPY.submitting;
  if (state === "awaiting-signature") return LIFECYCLE_COPY["awaiting-signature"];
  if (state === "cancelled") return LIFECYCLE_COPY.cancelled;
  if (state === "wrong-network") return LIFECYCLE_COPY["wrong-network"];
  if (state === "connected") return LIFECYCLE_COPY.connected;
  return null;
}

/**
 * Lookup helper: copy for the `BatchStatus` lexicon used by the explorer.
 * `verified` uses its own line because the batch detail surface frames
 * the end state as "sealed and proven" rather than just "settled".
 */
export function copyForBatchStatus(status: ZoneBatchStatus): string {
  if (status === "verified") return LIFECYCLE_COPY.verified;
  if (status === "submitted") return LIFECYCLE_COPY.submitted;
  if (status === "failed") return LIFECYCLE_COPY.failed;
  return LIFECYCLE_COPY["pending-batch"];
}

/**
 * Lookup helper: copy for one of the four batch state-machine stages
 * rendered in the proof-gauge stage list (`/batches/[id]`). The stage
 * key is the canonical state-machine key, independent of whether the
 * batch reached or failed at that stage.
 */
export function copyForBatchStage(
  key: "queued" | "sealed" | "proven" | "settled",
): string {
  return LIFECYCLE_COPY[key];
}

/**
 * Plain-language "what this means" subtitle for each numbered action on
 * the batch-detail receipt (M4.22). One sentence per stage, written for a
 * non-engineer reading the receipt cold. The technical labels above
 * (`Queued`, `Sealed`, `Proven`, `Settled`) stay canonical — these
 * sentences sit under each action's payload row to translate the term.
 */
export const BATCH_STAGE_MEANING: Record<
  "queued" | "sealed" | "proven" | "settled",
  string
> = {
  queued: "We received your trade and grouped it with others for privacy.",
  sealed: "The zone finalized this block range as a batch.",
  proven: "The zone reports the batch proof as verified.",
  settled: "The batch submission landed on Tempo L1.",
};
