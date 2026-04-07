import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useToast, ToastProvider } from "../lib/useToast";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(ToastProvider, null, children);
}

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws if used outside ToastProvider", () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToast must be used within ToastProvider");
  });

  it("addToast adds a toast with correct type/title/message", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("success", "Done", "Operation completed");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: "success",
      title: "Done",
      message: "Operation completed",
    });
    expect(result.current.toasts[0].id).toMatch(/^toast-/);
  });

  it("removeToast removes a toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("info", "Hello", "World");
    });

    const id = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("caps at 5 toasts (oldest removed)", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      for (let i = 0; i < 6; i++) {
        result.current.addToast("info", `Toast ${i}`, `Message ${i}`);
      }
    });

    expect(result.current.toasts).toHaveLength(5);
    // The first toast (Toast 0) should have been evicted
    expect(result.current.toasts[0].title).toBe("Toast 1");
    expect(result.current.toasts[4].title).toBe("Toast 5");
  });

  it("success toast auto-dismisses at 5000ms", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("success", "OK", "Done");
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("error toast auto-dismisses at 8000ms", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("error", "Fail", "Something broke");
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("cleanup clears timers on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { result, unmount } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("info", "A", "a");
      result.current.addToast("warning", "B", "b");
    });

    expect(result.current.toasts).toHaveLength(2);

    unmount();

    // clearTimeout should have been called for each active timer during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
