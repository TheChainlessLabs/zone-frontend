/**
 * useCopyToClipboard tests — M5.3 (#226).
 *
 * Covers the click-to-copy 2-second affirmation contract: copy success
 * flips `copied` true, then resets to false after the configured timeout.
 * Uses vitest's fake timers so the assertion is deterministic and the
 * test never has to actually wait 2 seconds.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useCopyToClipboard } from "../use-copy-to-clipboard";

describe("useCopyToClipboard", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("flips copied true after a successful copy and resets after timeout", async () => {
    const { result } = renderHook(() => useCopyToClipboard({ timeout: 2000 }));

    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it("respects a custom timeout", async () => {
    const { result } = renderHook(() => useCopyToClipboard({ timeout: 500 }));

    await act(async () => {
      await result.current.copy("v");
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it("no-ops silently when the clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await result.current.copy("nope");
    });

    expect(result.current.copied).toBe(false);
  });
});
