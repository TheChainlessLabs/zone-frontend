import type { Address, Hex } from "viem";

import { OMEGA_ZONE_ADDRESSES } from "./config";
import {
  approvePathUsdToZoneOutboxRequest,
  zoneOutboxRequestWithdrawal,
} from "./requests";
import {
  readPrivateTokenAllowance,
  readPrivateZoneWithdrawalFee,
  signAndSendPrivateZoneContractWrite,
  waitForZoneTransactionReceipt,
  type ZoneTransactionSigner,
} from "./rpc";

export const SIMPLE_WITHDRAWAL_GAS_LIMIT = BigInt(0);

export async function submitPrivateZoneWithdrawal({
  authToken,
  signer,
  account,
  to,
  amount,
}: {
  authToken: Hex;
  signer: ZoneTransactionSigner;
  account: Address;
  to: Address;
  amount: bigint;
}) {
  const withdrawalFee = await readPrivateZoneWithdrawalFee(
    authToken,
    account,
    SIMPLE_WITHDRAWAL_GAS_LIMIT,
  );
  const requiredAllowance = amount + withdrawalFee;
  let allowance = await readPrivateTokenAllowance(
    authToken,
    account,
    OMEGA_ZONE_ADDRESSES.pathUsd,
    OMEGA_ZONE_ADDRESSES.zoneOutbox,
  );
  let approvalTxHash: Hex | undefined;

  if (allowance < requiredAllowance) {
    approvalTxHash = await signAndSendPrivateZoneContractWrite({
      authToken,
      signer,
      account,
      // Tempo access-key approvals consume their token spending limit. Reserve
      // the same amount again so the following transferFrom can use this key.
      request: approvePathUsdToZoneOutboxRequest(
        requiredAllowance,
        requiredAllowance * BigInt(2),
      ),
    });
    const receipt = await waitForZoneTransactionReceipt(approvalTxHash, {
      authToken,
    });
    if (!receiptSucceeded(receipt.status)) {
      throw new Error(
        "Zone outbox approval reverted. Withdrawal was not submitted.",
      );
    }

    allowance = await readPrivateTokenAllowance(
      authToken,
      account,
      OMEGA_ZONE_ADDRESSES.pathUsd,
      OMEGA_ZONE_ADDRESSES.zoneOutbox,
    );
    if (allowance < requiredAllowance) {
      throw new Error(
        "Zone outbox approval confirmed, but the allowance is not available yet. Retry the withdrawal.",
      );
    }
  }

  const txHash = await signAndSendPrivateZoneContractWrite({
    authToken,
    signer,
    account,
    request: zoneOutboxRequestWithdrawal({
      to,
      amount,
      gasLimit: SIMPLE_WITHDRAWAL_GAS_LIMIT,
      withdrawalFee,
      fallbackRecipient: to,
    }),
  });

  return { txHash, approvalTxHash, withdrawalFee };
}

function receiptSucceeded(status: unknown) {
  return status === "success" || status === "0x1" || status === BigInt(1);
}
