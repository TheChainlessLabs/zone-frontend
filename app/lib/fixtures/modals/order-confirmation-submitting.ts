import type { OrderConfirmationModalFixture } from "../types";

/** Order Confirmation modal — signed payload submitted to gateway. */
export const orderConfirmationSubmitting: OrderConfirmationModalFixture = {
  state: "submitting",
  pair: "USDC/EURC",
  side: "sell",
  type: "limit",
  amount: "5000.00",
  price: "0.9215",
  estimatedFee: "2.30",
};
