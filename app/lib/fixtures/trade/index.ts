import type { PageState, TradeFixture } from "../types";
import { tradeDefault } from "./default";
import { tradeDisconnected } from "./disconnected";
import { tradeEmpty } from "./empty";
import { tradeError } from "./error";
import { tradeLoading } from "./loading";
import { tradeSkeleton } from "./skeleton";
import { tradeWrongNetwork } from "./wrong-network";

export {
  DEMO_ZONE_PATH_USD_BALANCE,
  DEMO_ZONE_OALPHA_BALANCE,
  DEMO_ZONE_MIDPOINT,
  DEMO_ZONE_BEST_BID,
  DEMO_ZONE_BEST_ASK,
  DEMO_ZONE_FILLS,
} from "./demo";

export const tradeFixtures: Record<PageState, TradeFixture> = {
  default: tradeDefault,
  empty: tradeEmpty,
  loading: tradeLoading,
  error: tradeError,
  skeleton: tradeSkeleton,
  disconnected: tradeDisconnected,
  "wrong-network": tradeWrongNetwork,
};
