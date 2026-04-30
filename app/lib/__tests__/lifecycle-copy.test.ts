import { describe, expect, it } from "vitest";

import {
  LIFECYCLE_COPY,
  copyForBatchStage,
  copyForBatchStatus,
  copyForStatusState,
} from "@/lib/lifecycle-copy";

describe("lifecycle-copy", () => {
  it("exposes the canonical copy strings expected by M4.10", () => {
    expect(LIFECYCLE_COPY.queued).toBe(
      "Submitted, waiting for the next batch sealing.",
    );
    expect(LIFECYCLE_COPY.sealed).toBe(
      "Matched in batch — awaiting proof generation.",
    );
    expect(LIFECYCLE_COPY.proven).toBe(
      "Proof generated, awaiting L1 settlement.",
    );
    expect(LIFECYCLE_COPY.settled).toBe(
      "Anchored on Ethereum L1. Funds usable for withdrawal.",
    );
    expect(LIFECYCLE_COPY["pending-deposit"]).toBe(
      "Awaiting on-chain confirmation.",
    );
    expect(LIFECYCLE_COPY["pending-withdrawal"]).toBe(
      "Awaiting batch sealing then L1 anchor.",
    );
    expect(LIFECYCLE_COPY.failed).toBe(
      "Settlement reverted on L1. Fills remain valid offchain — no action required.",
    );
    expect(LIFECYCLE_COPY.verified).toBe(
      "Sealed and proven. Anchored on Ethereum L1.",
    );
  });

  it("disambiguates pending by surface (deposit vs withdrawal)", () => {
    expect(copyForStatusState("pending", "deposit")).toBe(
      LIFECYCLE_COPY["pending-deposit"],
    );
    expect(copyForStatusState("pending", "withdrawal")).toBe(
      LIFECYCLE_COPY["pending-withdrawal"],
    );
    // Default falls back to the deposit copy.
    expect(copyForStatusState("pending")).toBe(
      LIFECYCLE_COPY["pending-deposit"],
    );
  });

  it("maps every lifecycle StatusState to a copy string", () => {
    expect(copyForStatusState("matched")).toBe(LIFECYCLE_COPY.matched);
    expect(copyForStatusState("settled")).toBe(LIFECYCLE_COPY.settled);
    expect(copyForStatusState("proven")).toBe(LIFECYCLE_COPY.proven);
    expect(copyForStatusState("failed")).toBe(LIFECYCLE_COPY.failed);
    expect(copyForStatusState("submitting")).toBe(LIFECYCLE_COPY.submitting);
    expect(copyForStatusState("awaiting-signature")).toBe(
      LIFECYCLE_COPY["awaiting-signature"],
    );
    expect(copyForStatusState("cancelled")).toBe(LIFECYCLE_COPY.cancelled);
    expect(copyForStatusState("connected")).toBe(LIFECYCLE_COPY.connected);
    expect(copyForStatusState("wrong-network")).toBe(
      LIFECYCLE_COPY["wrong-network"],
    );
  });

  it("maps every BatchStatus onto plain language", () => {
    expect(copyForBatchStatus("verified")).toBe(LIFECYCLE_COPY.verified);
    expect(copyForBatchStatus("failed")).toBe(LIFECYCLE_COPY.failed);
    // pending batch surfaces the withdrawal-style "awaiting batch sealing
    // then L1 anchor" line — same shape, different surface label.
    expect(copyForBatchStatus("pending")).toBe(
      LIFECYCLE_COPY["pending-withdrawal"],
    );
  });

  it("maps every batch state-machine stage onto plain language", () => {
    expect(copyForBatchStage("queued")).toBe(LIFECYCLE_COPY.queued);
    expect(copyForBatchStage("sealed")).toBe(LIFECYCLE_COPY.sealed);
    expect(copyForBatchStage("proven")).toBe(LIFECYCLE_COPY.proven);
    expect(copyForBatchStage("settled")).toBe(LIFECYCLE_COPY.settled);
  });

  it("never uses an exclamation point (brand voice rule)", () => {
    for (const value of Object.values(LIFECYCLE_COPY)) {
      expect(value.includes("!")).toBe(false);
    }
  });
});
