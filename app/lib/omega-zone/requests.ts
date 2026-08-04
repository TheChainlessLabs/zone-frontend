import { encodeFunctionData, parseSignature, type Address, type Hex } from "viem";

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

export const TIP20_PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export function pathUsdPermitTypedData({
  owner,
  value,
  nonce,
  deadline,
  tokenName,
}: {
  owner: Address;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
  tokenName: string;
}) {
  return {
    domain: {
      name: tokenName,
      version: "1",
      chainId: OMEGA_TEMPO_L1_CHAIN_ID,
      verifyingContract: OMEGA_ZONE_ADDRESSES.pathUsd,
    },
    types: TIP20_PERMIT_TYPES,
    primaryType: "Permit" as const,
    message: {
      owner,
      spender: OMEGA_ZONE_ADDRESSES.portal,
      value,
      nonce,
      deadline,
    },
  } as const;
}

export function approveTokenToPortalRequest(
  token: Address,
  amount: bigint,
) {
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: token,
    abi: TIP20_PARSED_ABI,
    functionName: "approve",
    args: [OMEGA_ZONE_ADDRESSES.portal, amount],
  } as const;
}

export function approvePathUsdToPortalRequest(amount: bigint) {
  return approveTokenToPortalRequest(OMEGA_ZONE_ADDRESSES.pathUsd, amount);
}

export function permitPathUsdToPortalRequest({
  owner,
  amount,
  deadline,
  signature,
}: {
  owner: Address;
  amount: bigint;
  deadline: bigint;
  signature: Hex;
}) {
  const { r, s, yParity } = parseSignature(signature);
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.pathUsd,
    abi: TIP20_PARSED_ABI,
    functionName: "permit",
    args: [
      owner,
      OMEGA_ZONE_ADDRESSES.portal,
      amount,
      deadline,
      yParity === 0 ? 27 : 28,
      r,
      s,
    ],
  } as const;
}

export function depositPathUsdToZoneRequest({
  to,
  amount,
  memo = ZERO_MEMO,
  bouncebackRecipient,
}: {
  to: Address;
  amount: bigint;
  memo?: Hex;
  bouncebackRecipient: Address;
}) {
  return depositTokenToZoneRequest({
    token: OMEGA_ZONE_ADDRESSES.pathUsd,
    to,
    amount,
    memo,
    bouncebackRecipient,
  });
}

export function depositTokenToZoneRequest({
  token,
  to,
  amount,
  memo = ZERO_MEMO,
  bouncebackRecipient,
}: {
  token: Address;
  to: Address;
  amount: bigint;
  memo?: Hex;
  bouncebackRecipient: Address;
}) {
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.portal,
    abi: ZONE_PORTAL_PARSED_ABI,
    functionName: "deposit",
    args: [token, to, amount, memo, bouncebackRecipient],
  } as const;
}

type ContractRequest =
  | ReturnType<typeof approvePathUsdToPortalRequest>
  | ReturnType<typeof approveTokenToPortalRequest>
  | ReturnType<typeof permitPathUsdToPortalRequest>
  | ReturnType<typeof depositPathUsdToZoneRequest>
  | ReturnType<typeof depositTokenToZoneRequest>
  | ReturnType<typeof depositEncryptedPathUsdToZoneRequest>
  | ReturnType<typeof approvePathUsdToDarkpoolRequest>
  | ReturnType<typeof approveTokenToDarkpoolRequest>
  | ReturnType<typeof approvePathUsdToZoneOutboxRequest>
  | ReturnType<typeof darkpoolDepositRequest>
  | ReturnType<typeof darkpoolWithdrawRequest>
  | ReturnType<typeof darkpoolCreatePairRequest>
  | ReturnType<typeof darkpoolPlaceOrderRequest>
  | ReturnType<typeof darkpoolCancelOrderRequest>
  | ReturnType<typeof darkpoolMarketBuyRequest>
  | ReturnType<typeof darkpoolMarketSellRequest>
  | ReturnType<typeof zoneOutboxRequestWithdrawal>;

export function requestToCall(request: ContractRequest) {
  return {
    to: request.address,
    data: encodeFunctionData({
      abi: request.abi,
      functionName: request.functionName,
      args: request.args,
    }),
  } as const;
}

export function depositEncryptedPathUsdToZoneRequest({
  amount,
  keyIndex,
  encrypted,
  bouncebackRecipient,
}: {
  amount: bigint;
  keyIndex: bigint;
  encrypted: EncryptedDepositPayload;
  bouncebackRecipient: Address;
}) {
  return {
    chainId: OMEGA_TEMPO_L1_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.portal,
    abi: ZONE_PORTAL_PARSED_ABI,
    functionName: "depositEncrypted",
    args: [
      OMEGA_ZONE_ADDRESSES.pathUsd,
      amount,
      keyIndex,
      encrypted,
      bouncebackRecipient,
    ],
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

export function approveAlphaUsdToDarkpoolRequest(amount: bigint) {
  return approveTokenToDarkpoolRequest(OMEGA_ZONE_ADDRESSES.alphaUsd, amount);
}

export function approvePathUsdToZoneOutboxRequest(
  amount: bigint,
  accessKeySpend = amount,
) {
  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    address: OMEGA_ZONE_ADDRESSES.pathUsd,
    abi: TIP20_PARSED_ABI,
    functionName: "approve",
    args: [OMEGA_ZONE_ADDRESSES.zoneOutbox, amount],
    accessKeySpends: [
      { token: OMEGA_ZONE_ADDRESSES.pathUsd, amount: accessKeySpend },
    ],
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
  gasLimit = BigInt(0),
  withdrawalFee = BigInt(0),
  fallbackRecipient,
  data = "0x",
  revealTo = "0x",
}: {
  token?: Address;
  to: Address;
  amount: bigint;
  memo?: Hex;
  gasLimit?: bigint;
  withdrawalFee?: bigint;
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
    accessKeySpends: [{ token, amount: amount + withdrawalFee }],
  } as const;
}
