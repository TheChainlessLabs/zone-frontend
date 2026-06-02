import type { Address, Hex } from "viem";

import {
  DARKPOOL_PARSED_ABI,
  TIP20_PARSED_ABI,
  ZONE_OUTBOX_PARSED_ABI,
  ZONE_PORTAL_PARSED_ABI,
} from "./abi";
import {
  OMEGA_TEMPO_L1_CHAIN_ID,
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  ZERO_MEMO,
} from "./config";

export interface EncryptedDepositPayload {
  ephemeralPubkeyX: Hex;
  ephemeralPubkeyYParity: number;
  ciphertext: Hex;
  nonce: Hex;
  tag: Hex;
}

export function approvePathUsdToPortalRequest(amount: bigint) {
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.pathUsd,
    abi: TIP20_PARSED_ABI,
    functionName: "approve",
    args: [OMEGA_ZONE_ADDRESSES.portal, amount],
  } as const;
}

export function depositPathUsdToZoneRequest({
  to,
  amount,
  memo = ZERO_MEMO,
}: {
  to: Address;
  amount: bigint;
  memo?: Hex;
}) {
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.portal,
    abi: ZONE_PORTAL_PARSED_ABI,
    functionName: "deposit",
    args: [OMEGA_ZONE_ADDRESSES.pathUsd, to, amount, memo],
  } as const;
}

export function depositEncryptedPathUsdToZoneRequest({
  amount,
  keyIndex,
  encrypted,
}: {
  amount: bigint;
  keyIndex: bigint;
  encrypted: EncryptedDepositPayload;
}) {
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.portal,
    abi: ZONE_PORTAL_PARSED_ABI,
    functionName: "depositEncrypted",
    args: [OMEGA_ZONE_ADDRESSES.pathUsd, amount, keyIndex, encrypted],
  } as const;
}

export function approvePathUsdToDarkpoolRequest(amount: bigint) {
  return approveTokenToDarkpoolRequest(OMEGA_ZONE_ADDRESSES.pathUsd, amount);
}

export function approveTokenToDarkpoolRequest(token: Address, amount: bigint) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: token,
    abi: TIP20_PARSED_ABI,
    functionName: "approve",
    args: [OMEGA_ZONE_ADDRESSES.darkpool, amount],
  } as const;
}

export function approveOalphaToDarkpoolRequest(amount: bigint) {
  return approveTokenToDarkpoolRequest(OMEGA_ZONE_ADDRESSES.oalpha, amount);
}

export function approvePathUsdToZoneOutboxRequest(amount: bigint) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.pathUsd,
    abi: TIP20_PARSED_ABI,
    functionName: "approve",
    args: [OMEGA_ZONE_ADDRESSES.zoneOutbox, amount],
  } as const;
}

export function darkpoolDepositRequest(
  amount: bigint,
  token: Address = OMEGA_ZONE_ADDRESSES.pathUsd,
) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "deposit",
    args: [token, amount],
  } as const;
}

export function darkpoolWithdrawRequest(
  amount: bigint,
  token: Address = OMEGA_ZONE_ADDRESSES.pathUsd,
) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "withdraw",
    args: [token, amount],
  } as const;
}

export function darkpoolCreatePairRequest(base: Address) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "createPair",
    args: [base],
  } as const;
}

export function darkpoolPlaceOrderRequest({
  base,
  amount,
  price,
  isBid,
}: {
  base: Address;
  amount: bigint;
  price: bigint;
  isBid: boolean;
}) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "place",
    args: [base, amount, price, isBid],
  } as const;
}

export function darkpoolCancelOrderRequest(orderId: bigint) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "cancel",
    args: [orderId],
  } as const;
}

export function darkpoolMarketBuyRequest({
  base,
  amount,
  maxQuoteIn,
}: {
  base: Address;
  amount: bigint;
  maxQuoteIn: bigint;
}) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "marketBuy",
    args: [base, amount, maxQuoteIn],
  } as const;
}

export function darkpoolMarketSellRequest({
  base,
  amount,
  minQuoteOut,
}: {
  base: Address;
  amount: bigint;
  minQuoteOut: bigint;
}) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    abi: DARKPOOL_PARSED_ABI,
    functionName: "marketSell",
    args: [base, amount, minQuoteOut],
  } as const;
}

export function zoneOutboxRequestWithdrawal({
  token = OMEGA_ZONE_ADDRESSES.pathUsd,
  to,
  amount,
  memo = ZERO_MEMO,
  gasLimit,
  fallbackRecipient,
  data = "0x",
  revealTo = "0x",
}: {
  token?: Address;
  to: Address;
  amount: bigint;
  memo?: Hex;
  gasLimit: bigint;
  fallbackRecipient: Address;
  data?: Hex;
  revealTo?: Hex;
}) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.zoneOutbox,
    abi: ZONE_OUTBOX_PARSED_ABI,
    functionName: "requestWithdrawal",
    args: [token, to, amount, memo, gasLimit, fallbackRecipient, data, revealTo],
  } as const;
}
