import * as React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useZoneLiveSnapshot } from "@/lib/omega-zone/use-live-snapshot";

afterEach(cleanup);

describe("useZoneLiveSnapshot", () => {
  it("finishes the second Strict Mode load after the first mount is cancelled", async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    const load = vi
      .fn<() => Promise<void>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    render(
      <React.StrictMode>
        <SnapshotProbe load={load} />
      </React.StrictMode>,
    );

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));

    await act(async () => second.resolve());
    expect(screen.getByTestId("snapshot-state").textContent).toBe("ready");

    await act(async () => first.reject(new Error("stale request failed")));
    expect(screen.getByTestId("snapshot-state").textContent).toBe("ready");
  });
});

function SnapshotProbe({ load }: { load: () => Promise<void> }) {
  const snapshot = useZoneLiveSnapshot({
    enabled: true,
    identity: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    load,
  });
  return <output data-testid="snapshot-state">{snapshot.state}</output>;
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
