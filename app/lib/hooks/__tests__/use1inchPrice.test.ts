import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { use1inchPrice } from "@/lib/hooks/use1inchPrice";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("use1inchPrice", () => {
  it("returns rate when API succeeds", async () => {
    const mockResponse = {
      usdc_usd: 1.0,
      usdt_usd: 0.9998,
      usdt_usdc_rate: 0.9998,
      source: "mock",
      timestamp: Date.now(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => use1inchPrice(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.rate).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rate).toBe(0.9998);
    expect(result.current.source).toBe("mock");
    expect(result.current.isError).toBe(false);
  });

  it("returns null rate when API fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 502,
    });

    const { result } = renderHook(() => use1inchPrice(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rate).toBeNull();
    expect(result.current.isError).toBe(true);
  });

  it("starts in loading state", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise(() => {}), // never resolves
    );

    const { result } = renderHook(() => use1inchPrice(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.rate).toBeNull();
    expect(result.current.source).toBeNull();
  });
});
