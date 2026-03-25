import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNonce } from "../lib/hooks/useNonce";

describe("useNonce", () => {
  it("starts at 0", () => {
    const { result } = renderHook(() => useNonce());
    expect(result.current.next()).toBe(0);
  });

  it("next() does not increment", () => {
    const { result } = renderHook(() => useNonce());
    result.current.next();
    result.current.next();
    expect(result.current.next()).toBe(0);
  });

  it("increment() bumps the nonce", () => {
    const { result } = renderHook(() => useNonce());
    act(() => result.current.increment());
    expect(result.current.next()).toBe(1);
  });

  it("monotonically increases across multiple increments", () => {
    const { result } = renderHook(() => useNonce());
    for (let i = 0; i < 5; i++) {
      expect(result.current.next()).toBe(i);
      act(() => result.current.increment());
    }
    expect(result.current.next()).toBe(5);
  });
});
