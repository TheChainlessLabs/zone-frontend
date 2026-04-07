import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockGetAccountNonce = vi.fn();

vi.mock("../lib/apiClient", () => ({
  getAccountNonce: (...args: unknown[]) => mockGetAccountNonce(...args),
}));

import { useNonce } from "../lib/hooks/useNonce";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

beforeEach(() => {
  mockGetAccountNonce.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useNonce", () => {
  it("returns isReady: false when accountId is null", () => {
    const { result } = renderHook(() => useNonce(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.isReady).toBe(false);
  });

  it("fetches server nonce on mount and next() returns it", async () => {
    mockGetAccountNonce.mockResolvedValue({ account_id: 1, nonce: 5 });

    const { result } = renderHook(() => useNonce(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.next()).toBe(5);
    expect(mockGetAccountNonce).toHaveBeenCalledWith(1);
  });

  it("increment() bumps local nonce", async () => {
    mockGetAccountNonce.mockResolvedValue({ account_id: 1, nonce: 5 });

    const { result } = renderHook(() => useNonce(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      result.current.increment();
    });

    expect(result.current.next()).toBe(6);
  });

  it("resync() re-fetches nonce from server", async () => {
    mockGetAccountNonce.mockResolvedValue({ account_id: 1, nonce: 5 });

    const { result } = renderHook(() => useNonce(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    // Increment locally to 6
    act(() => {
      result.current.increment();
    });
    expect(result.current.next()).toBe(6);

    // Server now has nonce 10
    mockGetAccountNonce.mockResolvedValue({ account_id: 1, nonce: 10 });

    act(() => {
      result.current.resync();
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.next()).toBe(10);
  });

  it("next() throws when not ready", () => {
    const { result } = renderHook(() => useNonce(null), {
      wrapper: createWrapper(),
    });
    expect(() => result.current.next()).toThrow("Nonce not ready");
  });

  it("resets local nonce when accountId changes (wallet switch)", async () => {
    mockGetAccountNonce.mockResolvedValue({ account_id: 1, nonce: 5 });

    const { result, rerender } = renderHook(
      ({ accountId }: { accountId: number | null }) => useNonce(accountId),
      { wrapper: createWrapper(), initialProps: { accountId: 1 } },
    );

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.next()).toBe(5);

    // Switch to account 2
    mockGetAccountNonce.mockResolvedValue({ account_id: 2, nonce: 10 });
    rerender({ accountId: 2 });

    // Should reset isReady while fetching new nonce
    expect(result.current.isReady).toBe(false);

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.next()).toBe(10);
  });

  it("isReady transitions from false to true after fetch", async () => {
    mockGetAccountNonce.mockResolvedValue({ account_id: 1, nonce: 0 });

    const { result } = renderHook(() => useNonce(1), {
      wrapper: createWrapper(),
    });

    // Initially not ready
    expect(result.current.isReady).toBe(false);

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });
});
