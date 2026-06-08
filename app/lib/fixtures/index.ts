/**
 * Fixture data registry — root barrel.
 *
 * Pages import the fixture map for their surface and index into it by
 * the state returned from `usePageState()`. See ./README.md for the
 * convention and ./M3-state-coverage.md (in app/.claude/) for the
 * coverage matrix.
 */

export * from "./types";
export * from "./pairs";
export {
  tradeFixtures,
  DEMO_ZONE_PATH_USD_BALANCE,
  DEMO_ZONE_OALPHA_BALANCE,
  DEMO_ZONE_MIDPOINT,
  DEMO_ZONE_BEST_BID,
  DEMO_ZONE_BEST_ASK,
  DEMO_ZONE_FILLS,
} from "./trade";
export { portfolioFixtures } from "./portfolio";
export {
  batchesListFixtures,
  batchesDetailFixtures,
  batchesSearchFixtures,
} from "./batches";
export { accountFixtures } from "./account";
export {
  depositModalFixtures,
  withdrawModalFixtures,
  orderConfirmationModalFixtures,
} from "./modals";
export { usePageState, VALID_STATES } from "./use-page-state";
