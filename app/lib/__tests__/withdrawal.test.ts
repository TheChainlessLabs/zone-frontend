import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Address, Hex } from "viem";

const rpc = vi.hoisted(() => ({
  readPrivateTokenAllowance: vi.fn(),
  readPrivateZoneWithdrawalFee: vi.fn(),
  signAndSendPrivateZoneContractWrite: vi.fn(),
  waitForZoneTransactionReceipt: vi.fn(),
}));

vi.mock("../omega-zone/rpc", () => rpc);

import { OMEGA_ZONE_ADDRESSES } from "../omega-zone/config";
import {
  SIMPLE_WITHDRAWAL_GAS_LIMIT,
  submitPrivateZoneWithdrawal,
} from "../omega-zone/withdrawal";

const AUTH_TOKEN = "0x1234" as Hex;
const ACCOUNT = "0x1000000000000000000000000000000000000001" as Address;
const RECIPIENT = "0x2000000000000000000000000000000000000002" as Address;
const APPROVAL_TX = `0x${"a".repeat(64)}` as Hex;
const WITHDRAWAL_TX = `0x${"b".repeat(64)}` as Hex;
const SIGNER = { request: vi.fn() };

describe("submitPrivateZoneWithdrawal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.readPrivateZoneWithdrawalFee.mockResolvedValue(BigInt(50));
    rpc.waitForZoneTransactionReceipt.mockResolvedValue({ status: "success" });
    rpc.signAndSendPrivateZoneContractWrite
      .mockResolvedValueOnce(APPROVAL_TX)
      .mockResolvedValueOnce(WITHDRAWAL_TX);
  });

  it("approves amount plus fee before requesting a simple withdrawal", async () => {
    rpc.readPrivateTokenAllowance
      .mockResolvedValueOnce(BigInt(0))
      .mockResolvedValueOnce(BigInt(1_050));

    await expect(
      submitPrivateZoneWithdrawal({
        authToken: AUTH_TOKEN,
        signer: SIGNER,
        account: ACCOUNT,
        to: RECIPIENT,
        amount: BigInt(1_000),
      }),
    ).resolves.toEqual({
      txHash: WITHDRAWAL_TX,
      approvalTxHash: APPROVAL_TX,
      withdrawalFee: BigInt(50),
    });

    expect(rpc.readPrivateZoneWithdrawalFee).toHaveBeenCalledWith(
      AUTH_TOKEN,
      ACCOUNT,
      SIMPLE_WITHDRAWAL_GAS_LIMIT,
    );
    expect(rpc.readPrivateTokenAllowance).toHaveBeenCalledWith(
      AUTH_TOKEN,
      ACCOUNT,
      OMEGA_ZONE_ADDRESSES.pathUsd,
      OMEGA_ZONE_ADDRESSES.zoneOutbox,
    );
    expect(rpc.signAndSendPrivateZoneContractWrite).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        request: expect.objectContaining({
          functionName: "approve",
          args: [OMEGA_ZONE_ADDRESSES.zoneOutbox, BigInt(1_050)],
          accessKeySpends: [
            { token: OMEGA_ZONE_ADDRESSES.pathUsd, amount: BigInt(2_100) },
          ],
        }),
      }),
    );
    expect(rpc.waitForZoneTransactionReceipt).toHaveBeenCalledWith(APPROVAL_TX, {
      authToken: AUTH_TOKEN,
    });
    expect(rpc.signAndSendPrivateZoneContractWrite).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          functionName: "requestWithdrawal",
          args: [
            OMEGA_ZONE_ADDRESSES.pathUsd,
            RECIPIENT,
            BigInt(1_000),
            `0x${"0".repeat(64)}`,
            SIMPLE_WITHDRAWAL_GAS_LIMIT,
            RECIPIENT,
            "0x",
            "0x",
          ],
          accessKeySpends: [
            { token: OMEGA_ZONE_ADDRESSES.pathUsd, amount: BigInt(1_050) },
          ],
        }),
      }),
    );
  });

  it("reuses a sufficient outbox allowance without another approval", async () => {
    rpc.readPrivateTokenAllowance.mockResolvedValue(BigInt(1_050));
    rpc.signAndSendPrivateZoneContractWrite.mockReset();
    rpc.signAndSendPrivateZoneContractWrite.mockResolvedValue(WITHDRAWAL_TX);

    const result = await submitPrivateZoneWithdrawal({
      authToken: AUTH_TOKEN,
      signer: SIGNER,
      account: ACCOUNT,
      to: RECIPIENT,
      amount: BigInt(1_000),
    });

    expect(result.approvalTxHash).toBeUndefined();
    expect(rpc.waitForZoneTransactionReceipt).not.toHaveBeenCalled();
    expect(rpc.signAndSendPrivateZoneContractWrite).toHaveBeenCalledOnce();
    expect(rpc.signAndSendPrivateZoneContractWrite).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          functionName: "requestWithdrawal",
        }),
      }),
    );
  });

  it("does not submit the withdrawal when the approval reverts", async () => {
    rpc.readPrivateTokenAllowance.mockResolvedValue(BigInt(0));
    rpc.waitForZoneTransactionReceipt.mockResolvedValue({ status: "reverted" });

    await expect(
      submitPrivateZoneWithdrawal({
        authToken: AUTH_TOKEN,
        signer: SIGNER,
        account: ACCOUNT,
        to: RECIPIENT,
        amount: BigInt(1_000),
      }),
    ).rejects.toThrow("Zone outbox approval reverted");

    expect(rpc.signAndSendPrivateZoneContractWrite).toHaveBeenCalledOnce();
  });
});
