import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const { mockUseReadContract } = vi.hoisted(() => ({
  mockUseReadContract: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useReadContract: mockUseReadContract,
}));

import { useTokenBalance } from "../lib/hooks/useTokenBalance";

beforeEach(() => {
  mockUseReadContract.mockReset();
});

describe("useTokenBalance", () => {
  it("returns formatted balance (1000000 raw with 6 decimals = 1.0)", () => {
    mockUseReadContract.mockReturnValue({
      data: BigInt(1000000),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useTokenBalance("0x1234" as `0x${string}`, "0xabcd" as `0x${string}`, 6),
    );

    expect(result.current.formatted).toBe(1.0);
    expect(result.current.balance).toBe(BigInt(1000000));
    expect(result.current.isLoading).toBe(false);
  });

  it("returns 0 when no data", () => {
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useTokenBalance("0x1234" as `0x${string}`, "0xabcd" as `0x${string}`, 6),
    );

    expect(result.current.formatted).toBe(0);
    expect(result.current.balance).toBe(BigInt(0));
  });

  it("disables query when walletAddress is undefined", () => {
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderHook(() =>
      useTokenBalance("0x1234" as `0x${string}`, undefined, 6),
    );

    const callArgs = mockUseReadContract.mock.calls[0][0];
    expect(callArgs.query.enabled).toBe(false);
  });

  it("disables query when tokenAddress is undefined", () => {
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderHook(() =>
      useTokenBalance(undefined, "0xabcd" as `0x${string}`, 6),
    );

    const callArgs = mockUseReadContract.mock.calls[0][0];
    expect(callArgs.query.enabled).toBe(false);
  });

  it("returns isLoading state", () => {
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useTokenBalance("0x1234" as `0x${string}`, "0xabcd" as `0x${string}`, 6),
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("sets refetchInterval to 15000ms", () => {
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderHook(() =>
      useTokenBalance("0x1234" as `0x${string}`, "0xabcd" as `0x${string}`, 6),
    );

    const callArgs = mockUseReadContract.mock.calls[0][0];
    expect(callArgs.query.refetchInterval).toBe(15000);
  });
});
