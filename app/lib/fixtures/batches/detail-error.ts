import type { BatchesDetailFixture } from "../types";

import { batchesDetailVerified } from "./detail-verified";

/** /batches/[number] error — detail endpoint unavailable. */
export const batchesDetailError: BatchesDetailFixture = {
  ...batchesDetailVerified,
  error: {
    message: "Batch detail unavailable. Retry in a moment.",
    code: "EXPLORER_UNREACHABLE",
  },
};
