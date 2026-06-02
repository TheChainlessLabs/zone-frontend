import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { scrollStates } from "@/components/landing/content";
import { MidpointSingularityScene } from "@/components/landing/scene/midpoint-singularity-scene";

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MidpointSingularityScene", () => {
  it("renders a clean 2D lifecycle scene when motion is allowed", () => {
    mockReducedMotion(false);

    render(<MidpointSingularityScene />);

    expect(screen.getByTestId("order-lifecycle-scene")).toBeDefined();
    expect(screen.queryByTestId("midpoint-singularity-canvas")).toBeNull();
    expect(screen.getByText("PRIVATE ORDER")).toBeDefined();
    expect(screen.getByText("DARKPOOL")).toBeDefined();
    expect(screen.getByText("NOISE FIELD")).toBeDefined();
    expect(screen.getByText("BATCH PROOF")).toBeDefined();
    expect(screen.getByText("TEMPO")).toBeDefined();
  });

  it("renders a static scroll-state sequence for reduced motion users", async () => {
    mockReducedMotion(true);

    render(<MidpointSingularityScene />);

    expect(await screen.findByTestId("midpoint-singularity-reduced-motion")).toBeDefined();
    expect(screen.queryByTestId("order-lifecycle-scene")).toBeNull();

    for (const state of scrollStates) {
      expect(screen.getByText(state.title)).toBeDefined();
    }
  });
});
