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
  it("renders the pinned SVG singularity scene when motion is allowed", () => {
    mockReducedMotion(false);

    render(<MidpointSingularityScene />);

    const scene = screen.getByTestId("order-lifecycle-scene");
    expect(scene).toBeDefined();
    expect(scene.tagName.toLowerCase()).toBe("svg");
    expect(screen.queryByTestId("midpoint-singularity-reduced-motion")).toBeNull();
  });

  it("renders a static scroll-state sequence for reduced motion users", () => {
    mockReducedMotion(true);

    render(<MidpointSingularityScene />);

    expect(screen.getByTestId("midpoint-singularity-reduced-motion")).toBeDefined();
    expect(screen.queryByTestId("order-lifecycle-scene")).toBeNull();

    for (const state of scrollStates) {
      expect(screen.getByText(state.title)).toBeDefined();
    }
  });
});
