import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSignedOperationQueue } from "../lib/hooks/useSignedOperationQueue";

describe("useSignedOperationQueue", () => {
  it("executes an operation and returns its result", async () => {
    const { result } = renderHook(() => useSignedOperationQueue());

    let value: string | undefined;
    await act(async () => {
      value = await result.current.execute(async () => "done");
    });

    expect(value).toBe("done");
  });

  it("locks during execution and unlocks after completion", async () => {
    const { result } = renderHook(() => useSignedOperationQueue());

    expect(result.current.isLocked).toBe(false);

    let resolve: () => void;
    const pending = new Promise<void>((r) => {
      resolve = r;
    });

    let executePromise: Promise<void>;
    act(() => {
      executePromise = result.current.execute(() => pending);
    });

    // isLocked should be true while operation is in progress
    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      resolve!();
      await executePromise!;
    });

    expect(result.current.isLocked).toBe(false);
  });

  it("rejects concurrent operations", async () => {
    const { result } = renderHook(() => useSignedOperationQueue());

    let resolve: () => void;
    const pending = new Promise<void>((r) => {
      resolve = r;
    });

    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.execute(() => pending);
    });

    // Second call should throw
    await expect(
      result.current.execute(async () => "second"),
    ).rejects.toThrow("Another signed operation is in progress");

    // Clean up
    await act(async () => {
      resolve!();
      await firstPromise!;
    });
  });

  it("unlocks after a failed operation", async () => {
    const { result } = renderHook(() => useSignedOperationQueue());

    await act(async () => {
      try {
        await result.current.execute(async () => {
          throw new Error("boom");
        });
      } catch {
        // expected
      }
    });

    expect(result.current.isLocked).toBe(false);

    // Should be able to execute again
    let value: string | undefined;
    await act(async () => {
      value = await result.current.execute(async () => "recovered");
    });

    expect(value).toBe("recovered");
  });
});
