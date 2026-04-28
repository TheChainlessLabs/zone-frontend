import type {
  BatchesDetailFixture,
  BatchesListFixture,
  BatchesSearchFixture,
  PageState,
} from "../types";
import { batchesDefault } from "./default";
import { batchesDetailFailed } from "./detail-failed";
import { batchesDetailPending } from "./detail-pending";
import { batchesDetailVerified } from "./detail-verified";
import { batchesEmpty } from "./empty";
import { batchesError } from "./error";
import { batchesLoading } from "./loading";
import { batchesSearchNoResults } from "./search-no-results";
import { batchesSearchResults } from "./search-results";

/**
 * /batches list view fixtures. The list does not have skeleton/disconnected/
 * wrong-network variants — the page is public read-only and uses inline
 * loading affordances rather than skeleton primitives. Coverage matrix
 * marks those cells as `—`.
 */
export const batchesListFixtures: Record<
  Extract<PageState, "default" | "empty" | "loading" | "error">,
  BatchesListFixture
> = {
  default: batchesDefault,
  empty: batchesEmpty,
  loading: batchesLoading,
  error: batchesError,
};

export type BatchesDetailState = "verified" | "pending" | "failed" | "loading" | "error";

/**
 * /batches/[number] detail-view fixtures. Detail variants are keyed by
 * batch status rather than the generic PageState because the matrix cell
 * is "shows a verified vs pending vs failed batch", not "is the page
 * loading".
 */
export const batchesDetailFixtures: Record<
  Extract<BatchesDetailState, "verified" | "pending" | "failed">,
  BatchesDetailFixture
> = {
  verified: batchesDetailVerified,
  pending: batchesDetailPending,
  failed: batchesDetailFailed,
};

export const batchesSearchFixtures: Record<
  "results" | "no-results",
  BatchesSearchFixture
> = {
  results: batchesSearchResults,
  "no-results": batchesSearchNoResults,
};
