import type { OrderConfirmationModalFixture } from "../types";

/** Order Confirmation modal — EIP-712 signature awaiting wallet confirmation. */
export const orderConfirmationSigning: OrderConfirmationModalFixture = {
  state: "signing",
  pair: "USDC/EURC",
  side: "sell",
  type: "limit",
  amount: "5000.00",
  price: "0.9215",
  estimatedFee: "2.30",
};
