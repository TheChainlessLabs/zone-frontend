import type { BatchesDetailFixture } from "../types";

import { batchesDetailVerified } from "./detail-verified";

/** /batches/[number] empty — route points at a batch that does not exist. */
export const batchesDetailEmpty: BatchesDetailFixture = {
  ...batchesDetailVerified,
  orders: [],
  fills: [],
};
