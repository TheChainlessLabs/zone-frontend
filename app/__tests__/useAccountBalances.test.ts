import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// Mock apiClient before importing the hook
vi.mock("../lib/apiClient", () => ({
  getAccountBalances: vi.fn(),
}));

import { getAccountBalances } from "../lib/apiClient";
import { useAccountBalances } from "../lib/hooks/useAccountBalances";

const mockedGetAccountBalances = vi.mocked(getAccountBalances);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  mockedGetAccountBalances.mockReset();
});

describe("useAccountBalances", () => {
  it("returns loading state when accountId is provided", () => {
    mockedGetAccountBalances.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAccountBalances(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.balances).toEqual([]);
  });

  it("returns not loading when accountId is null", () => {
    const { result } = renderHook(() => useAccountBalances(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.balances).toEqual([]);
  });

  it("maps U256 string with 6 decimals correctly", async () => {
    mockedGetAccountBalances.mockResolvedValue({
      account_id: 1,
      balances: [
        {
          token_id: 1,
          available: "10000000000",
          collateral: "5000000000",
          total: "15000000000",
        },
      ],
    });

    const { result } = renderHook(() => useAccountBalances(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.balances).toHaveLength(1);
    expect(result.current.balances[0]).toEqual({
      tokenId: 1,
      symbol: "USDC",
      color: "#2775CA",
      available: 10000,
      collateral: 5000,
      total: 15000,
    });
  });

  it("returns empty array when API returns no balances", async () => {
    mockedGetAccountBalances.mockResolvedValue({
      account_id: 1,
      balances: [],
    });

    const { result } = renderHook(() => useAccountBalances(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.balances).toEqual([]);
  });

  it("includes symbol and color from TOKEN_MAP", async () => {
    mockedGetAccountBalances.mockResolvedValue({
      account_id: 1,
      balances: [
        { token_id: 2, available: "0", collateral: "0", total: "0" },
        { token_id: 3, available: "0", collateral: "0", total: "0" },
      ],
    });

    const { result } = renderHook(() => useAccountBalances(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.balances[0].symbol).toBe("USDT");
    expect(result.current.balances[0].color).toBe("#26A17B");
    expect(result.current.balances[1].symbol).toBe("EURC");
    expect(result.current.balances[1].color).toBe("#1434CB");
  });

  it("uses fallback for unknown token ID", async () => {
    mockedGetAccountBalances.mockResolvedValue({
      account_id: 1,
      balances: [
        { token_id: 99, available: "1000000000000000000", collateral: "0", total: "1000000000000000000" },
      ],
    });

    const { result } = renderHook(() => useAccountBalances(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.balances[0].symbol).toBe("Token 99");
    expect(result.current.balances[0].total).toBe(1); // 18 decimals
  });
});
