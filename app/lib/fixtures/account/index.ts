import type { AccountFixture } from "../types";
import { accountDefault } from "./default";
import { accountDisconnected } from "./disconnected";

/**
 * /account exposes only `default` and `disconnected`. There is no empty,
 * loading, error, skeleton, or wrong-network variant — the page is a
 * profile/settings surface that's either rendered or not.
 */
export const accountFixtures: Record<
  "default" | "disconnected",
  AccountFixture
> = {
  default: accountDefault,
  disconnected: accountDisconnected,
};
