import type {
  BatchesDetailFixture,
  BatchesListFixture,
  BatchesSearchFixture,
  PageState,
} from "../types";
import { batchesDefault } from "./default";
import { batchesDetailEmpty } from "./detail-empty";
import { batchesDetailError } from "./detail-error";
import { batchesDetailFailed } from "./detail-failed";
import { batchesDetailLoading } from "./detail-loading";
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

export type BatchesDetailState =
  | "verified"
  | "pending"
  | "failed"
  | "empty"
  | "loading"
  | "error";

/**
 * /batches/[number] detail-view fixtures. The happy-path cells are keyed
 * by batch status; the route also accepts generic page-state overrides
 * (`loading` / `empty` / `error`) via `usePageState()`.
 */
export const batchesDetailFixtures: Record<
  BatchesDetailState,
  BatchesDetailFixture
> = {
  verified: batchesDetailVerified,
  pending: batchesDetailPending,
  failed: batchesDetailFailed,
  empty: batchesDetailEmpty,
  loading: batchesDetailLoading,
  error: batchesDetailError,
};

export const batchesSearchFixtures: Record<
  "results" | "no-results",
  BatchesSearchFixture
> = {
  results: batchesSearchResults,
  "no-results": batchesSearchNoResults,
};
