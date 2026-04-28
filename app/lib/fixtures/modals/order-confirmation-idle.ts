import type { OrderConfirmationModalFixture } from "../types";

/** Order Confirmation modal — order summary visible, awaiting Confirm. */
export const orderConfirmationIdle: OrderConfirmationModalFixture = {
  state: "idle",
  pair: "USDC/EURC",
  side: "sell",
  type: "limit",
  amount: "5000.00",
  price: "0.9215",
  estimatedFee: "2.30",
};
