import type {
  DepositModalFixture,
  DepositModalState,
  OrderConfirmationModalFixture,
  OrderConfirmationModalState,
  WithdrawModalFixture,
  WithdrawModalState,
} from "../types";
import { depositApproving } from "./deposit-approving";
import { depositDepositing } from "./deposit-depositing";
import { depositFailed } from "./deposit-failed";
import { depositIdle } from "./deposit-idle";
import { depositPending } from "./deposit-pending";
import { depositSuccess } from "./deposit-success";
import { orderConfirmationFailed } from "./order-confirmation-failed";
import { orderConfirmationIdle } from "./order-confirmation-idle";
import { orderConfirmationSigning } from "./order-confirmation-signing";
import { orderConfirmationSubmitting } from "./order-confirmation-submitting";
import { withdrawFailed } from "./withdraw-failed";
import { withdrawIdle } from "./withdraw-idle";
import { withdrawPending } from "./withdraw-pending";
import { withdrawSigning } from "./withdraw-signing";
import { withdrawSuccess } from "./withdraw-success";

export const depositModalFixtures: Record<
  DepositModalState,
  DepositModalFixture
> = {
  idle: depositIdle,
  approving: depositApproving,
  depositing: depositDepositing,
  pending: depositPending,
  success: depositSuccess,
  failed: depositFailed,
};

export const withdrawModalFixtures: Record<
  WithdrawModalState,
  WithdrawModalFixture
> = {
  idle: withdrawIdle,
  signing: withdrawSigning,
  pending: withdrawPending,
  success: withdrawSuccess,
  failed: withdrawFailed,
};

export const orderConfirmationModalFixtures: Record<
  OrderConfirmationModalState,
  OrderConfirmationModalFixture
> = {
  idle: orderConfirmationIdle,
  signing: orderConfirmationSigning,
  submitting: orderConfirmationSubmitting,
  failed: orderConfirmationFailed,
};
