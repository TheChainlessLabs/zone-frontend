import type { PageState, TradeFixture } from "../types";
import { tradeDefault } from "./default";
import { tradeDisconnected } from "./disconnected";
import { tradeEmpty } from "./empty";
import { tradeError } from "./error";
import { tradeLoading } from "./loading";
import { tradeSkeleton } from "./skeleton";
import { tradeWrongNetwork } from "./wrong-network";

export const tradeFixtures: Record<PageState, TradeFixture> = {
  default: tradeDefault,
  empty: tradeEmpty,
  loading: tradeLoading,
  error: tradeError,
  skeleton: tradeSkeleton,
  disconnected: tradeDisconnected,
  "wrong-network": tradeWrongNetwork,
};
