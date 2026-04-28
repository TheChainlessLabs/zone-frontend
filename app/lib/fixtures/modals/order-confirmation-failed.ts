import type { OrderConfirmationModalFixture } from "../types";

/** Order Confirmation modal — gateway rejected (insufficient balance, stale nonce, etc). */
export const orderConfirmationFailed: OrderConfirmationModalFixture = {
  state: "failed",
  pair: "USDC/EURC",
  side: "sell",
  type: "limit",
  amount: "5000.00",
  price: "0.9215",
  estimatedFee: "2.30",
  error: {
    message: "Order rejected. Insufficient balance.",
    code: "INSUFFICIENT_BALANCE",
  },
};
