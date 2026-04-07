"use client";

import { useCallback } from "react";
import { useSignTypedData } from "wagmi";
import { config } from "../config";
import { eip712Types, SIDE_ENCODING } from "../eip712Types";
import type { ApiSide } from "../apiTypes";
import { useNonce } from "./useNonce";
import { useWallet } from "../wallet";

export interface SignedResult {
  signature: string;
  nonce: number;
}

interface LimitOrderParams {
  marketId: number;
  price: bigint;
  quantity: bigint;
  side: ApiSide;
}

interface MarketOrderParams extends LimitOrderParams {
  maxSlippageBps: number;
}

interface FlipOrderParams extends LimitOrderParams {
  flipPrice: bigint;
}

interface CancelParams {
  marketId: number;
  orderId: number;
}

export function useOrderSigning() {
  const { signTypedDataAsync } = useSignTypedData();
  const { accountId } = useWallet();
  const nonce = useNonce(accountId);

  const domain = config.eip712Domain;

  const signLimitOrder = useCallback(
    async (params: LimitOrderParams): Promise<SignedResult> => {
      const currentNonce = nonce.next();
      const signature = await signTypedDataAsync({
        domain,
        types: { AddLimitOrderRequest: eip712Types.AddLimitOrderRequest },
        primaryType: "AddLimitOrderRequest",
        message: {
          nonce: BigInt(currentNonce),
          market_id: params.marketId,
          price: params.price,
          quantity: params.quantity,
          side: SIDE_ENCODING[params.side],
        },
      });
      nonce.increment();
      return { signature, nonce: currentNonce };
    },
    [signTypedDataAsync, domain, nonce],
  );

  const signMarketOrder = useCallback(
    async (params: MarketOrderParams): Promise<SignedResult> => {
      const currentNonce = nonce.next();
      const signature = await signTypedDataAsync({
        domain,
        types: {
          AddMarketOrderRequest: eip712Types.AddMarketOrderRequest,
        },
        primaryType: "AddMarketOrderRequest",
        message: {
          nonce: BigInt(currentNonce),
          market_id: params.marketId,
          price: params.price,
          quantity: params.quantity,
          side: SIDE_ENCODING[params.side],
          max_slippage_bps: params.maxSlippageBps,
        },
      });
      nonce.increment();
      return { signature, nonce: currentNonce };
    },
    [signTypedDataAsync, domain, nonce],
  );

  const signFlipOrder = useCallback(
    async (params: FlipOrderParams): Promise<SignedResult> => {
      const currentNonce = nonce.next();
      const signature = await signTypedDataAsync({
        domain,
        types: { AddFlipOrderRequest: eip712Types.AddFlipOrderRequest },
        primaryType: "AddFlipOrderRequest",
        message: {
          nonce: BigInt(currentNonce),
          market_id: params.marketId,
          price: params.price,
          quantity: params.quantity,
          side: SIDE_ENCODING[params.side],
          flip_price: params.flipPrice,
        },
      });
      nonce.increment();
      return { signature, nonce: currentNonce };
    },
    [signTypedDataAsync, domain, nonce],
  );

  const signCancel = useCallback(
    async (params: CancelParams): Promise<SignedResult> => {
      const currentNonce = nonce.next();
      const signature = await signTypedDataAsync({
        domain,
        types: { CancelOrderRequest: eip712Types.CancelOrderRequest },
        primaryType: "CancelOrderRequest",
        message: {
          nonce: BigInt(currentNonce),
          market_id: params.marketId,
          order_id: BigInt(params.orderId),
        },
      });
      nonce.increment();
      return { signature, nonce: currentNonce };
    },
    [signTypedDataAsync, domain, nonce],
  );

  return { signLimitOrder, signMarketOrder, signFlipOrder, signCancel };
}
