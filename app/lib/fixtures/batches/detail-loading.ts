import type { BatchesDetailFixture } from "../types";

import { batchesDetailVerified } from "./detail-verified";

/** /batches/[number] loading — detail view fetching batch metadata. */
export const batchesDetailLoading: BatchesDetailFixture = {
  ...batchesDetailVerified,
  isLoading: true,
};
