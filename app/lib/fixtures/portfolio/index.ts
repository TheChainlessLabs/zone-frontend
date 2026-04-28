import type { PageState, PortfolioFixture } from "../types";
import { portfolioDefault } from "./default";
import { portfolioDisconnected } from "./disconnected";
import { portfolioEmpty } from "./empty";
import { portfolioError } from "./error";
import { portfolioLoading } from "./loading";
import { portfolioSkeleton } from "./skeleton";

/**
 * /portfolio has no `wrong-network` state — the page is read-only and
 * doesn't gate on chain. Connecting on the wrong network just shows the
 * disconnected variant. Coverage matrix marks this as `—`.
 */
export const portfolioFixtures: Record<
  Exclude<PageState, "wrong-network">,
  PortfolioFixture
> = {
  default: portfolioDefault,
  empty: portfolioEmpty,
  loading: portfolioLoading,
  error: portfolioError,
  skeleton: portfolioSkeleton,
  disconnected: portfolioDisconnected,
};
