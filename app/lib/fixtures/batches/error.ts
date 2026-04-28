import type { BatchesListFixture } from "../types";

/** /batches error — explorer endpoint unavailable. */
export const batchesError: BatchesListFixture = {
  batches: [],
  error: {
    message: "Batch history unavailable. Retry in a moment.",
    code: "EXPLORER_UNREACHABLE",
  },
};
