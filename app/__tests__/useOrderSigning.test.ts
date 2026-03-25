import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockSignTypedDataAsync = vi.fn();

vi.mock("wagmi", () => ({
  useSignTypedData: () => ({
    signTypedDataAsync: mockSignTypedDataAsync,
  }),
}));

vi.mock("../lib/config", () => ({
  config: {
    eip712Domain: {
      name: "Omega",
      version: "1",
      chainId: 31337,
      verifyingContract: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    },
  },
}));

import { useOrderSigning } from "../lib/hooks/useOrderSigning";

const FAKE_SIG = "0x" + "ab".repeat(65);

beforeEach(() => {
  mockSignTypedDataAsync.mockReset();
  mockSignTypedDataAsync.mockResolvedValue(FAKE_SIG);
});

describe("useOrderSigning", () => {
  describe("signLimitOrder", () => {
    it("constructs correct typed data with 5 fields", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt("1085600000000000000"),
          quantity: BigInt("100000000"),
          side: "Buy",
        });
      });

      const call = mockSignTypedDataAsync.mock.calls[0][0];
      expect(call.primaryType).toBe("AddLimitOrderRequest");
      expect(call.message).toEqual({
        nonce: BigInt(0),
        market_id: 1,
        price: BigInt("1085600000000000000"),
        quantity: BigInt("100000000"),
        side: 0,
      });
    });

    it("encodes Buy side as 0", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
        });
      });

      expect(mockSignTypedDataAsync.mock.calls[0][0].message.side).toBe(0);
    });

    it("encodes Sell side as 1", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Sell",
        });
      });

      expect(mockSignTypedDataAsync.mock.calls[0][0].message.side).toBe(1);
    });

    it("returns signature and nonce", async () => {
      const { result } = renderHook(() => useOrderSigning());

      let signed: { signature: string; nonce: number } | undefined;
      await act(async () => {
        signed = await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
        });
      });

      expect(signed!.signature).toBe(FAKE_SIG);
      expect(signed!.nonce).toBe(0);
    });

    it("passes uint128 fields as BigInt", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt("999999999999999999999"),
          quantity: BigInt("888888888888888888888"),
          side: "Buy",
        });
      });

      const msg = mockSignTypedDataAsync.mock.calls[0][0].message;
      expect(typeof msg.price).toBe("bigint");
      expect(typeof msg.quantity).toBe("bigint");
    });
  });

  describe("signMarketOrder", () => {
    it("includes max_slippage_bps in typed data", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signMarketOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
          maxSlippageBps: 50,
        });
      });

      const call = mockSignTypedDataAsync.mock.calls[0][0];
      expect(call.primaryType).toBe("AddMarketOrderRequest");
      expect(call.message.max_slippage_bps).toBe(50);
    });
  });

  describe("signFlipOrder", () => {
    it("includes flip_price as BigInt in typed data", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signFlipOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Sell",
          flipPrice: BigInt("2000000000000000000"),
        });
      });

      const call = mockSignTypedDataAsync.mock.calls[0][0];
      expect(call.primaryType).toBe("AddFlipOrderRequest");
      expect(call.message.flip_price).toBe(BigInt("2000000000000000000"));
      expect(typeof call.message.flip_price).toBe("bigint");
    });
  });

  describe("signCancel", () => {
    it("constructs CancelOrderRequest typed data", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signCancel({
          marketId: 1,
          orderId: 42,
        });
      });

      const call = mockSignTypedDataAsync.mock.calls[0][0];
      expect(call.primaryType).toBe("CancelOrderRequest");
      expect(call.message).toEqual({
        nonce: BigInt(0),
        market_id: 1,
        order_id: BigInt(42),
      });
    });
  });

  describe("nonce management", () => {
    it("increments nonce after successful sign", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        const first = await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
        });
        expect(first.nonce).toBe(0);
      });

      await act(async () => {
        const second = await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
        });
        expect(second.nonce).toBe(1);
      });

      // Verify the nonce in the typed data messages
      expect(mockSignTypedDataAsync.mock.calls[0][0].message.nonce).toBe(
        BigInt(0),
      );
      expect(mockSignTypedDataAsync.mock.calls[1][0].message.nonce).toBe(
        BigInt(1),
      );
    });

    it("does NOT increment nonce on sign failure", async () => {
      mockSignTypedDataAsync.mockRejectedValueOnce(new Error("user rejected"));

      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await expect(
          result.current.signLimitOrder({
            marketId: 1,
            price: BigInt(1),
            quantity: BigInt(1),
            side: "Buy",
          }),
        ).rejects.toThrow("user rejected");
      });

      // Nonce should still be 0 since sign failed
      mockSignTypedDataAsync.mockResolvedValueOnce(FAKE_SIG);

      await act(async () => {
        const retry = await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
        });
        expect(retry.nonce).toBe(0);
      });
    });
  });

  describe("domain", () => {
    it("passes config.eip712Domain to signTypedDataAsync", async () => {
      const { result } = renderHook(() => useOrderSigning());

      await act(async () => {
        await result.current.signLimitOrder({
          marketId: 1,
          price: BigInt(1),
          quantity: BigInt(1),
          side: "Buy",
        });
      });

      const call = mockSignTypedDataAsync.mock.calls[0][0];
      expect(call.domain).toEqual({
        name: "Omega",
        version: "1",
        chainId: 31337,
        verifyingContract: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
      });
    });
  });
});
