import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "../lib/hooks/useKeyboardShortcuts";

function fireKey(key: string, target?: Partial<HTMLElement>) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  if (target) {
    Object.defineProperty(event, "target", { value: target });
  }
  window.dispatchEvent(event);
}

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires handler when matching key is pressed", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "b", handler, description: "Buy" }])
    );

    fireKey("b");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("matches keys case-insensitively", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", handler, description: "Sell" }])
    );

    fireKey("S");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores keys when focused on an input (except Escape/Enter)", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "b", handler, description: "Buy" }])
    );

    fireKey("b", { tagName: "INPUT" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("allows Escape in input fields", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "Escape", handler, description: "Clear" }])
    );

    fireKey("Escape", { tagName: "INPUT" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("allows Enter in input fields", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "Enter", handler, description: "Submit" }])
    );

    fireKey("Enter", { tagName: "INPUT" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores keys in textarea and select elements", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "b", handler, description: "Buy" }])
    );

    fireKey("b", { tagName: "TEXTAREA" });
    expect(handler).not.toHaveBeenCalled();

    fireKey("b", { tagName: "SELECT" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not fire handlers when disabled", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "b", handler, description: "Buy" }], false)
    );

    fireKey("b");
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores unregistered keys", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "b", handler, description: "Buy" }])
    );

    fireKey("x");
    expect(handler).not.toHaveBeenCalled();
  });

  it("cleans up listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: "b", handler, description: "Buy" }])
    );

    unmount();
    fireKey("b");
    expect(handler).not.toHaveBeenCalled();
  });
});
