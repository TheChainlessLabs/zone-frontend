import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scrollStates } from "@/components/landing/content";
import { OrderScrollStory } from "@/components/landing/order-scroll-story";

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

describe("OrderScrollStory", () => {
  beforeEach(() => {
    mockReducedMotion(false);
  });

  it("pins a tall scroll-story section that opens on the first state", () => {
    render(<OrderScrollStory />);

    const section = document.querySelector("[data-scroll-story]");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("id")).toBe("mechanism");
    expect(section?.className).toContain("h-[520vh]");

    const first = scrollStates[0];
    const eyebrow = document.querySelector(`[data-scroll-panel="${first.id}"]`);
    expect(eyebrow?.textContent).toContain(first.label);
    expect(screen.getByText(first.title)).toBeDefined();
  });

  it("renders a static stacked fallback for reduced-motion users", () => {
    mockReducedMotion(true);

    render(<OrderScrollStory />);

    expect(screen.getByTestId("midpoint-singularity-reduced-motion")).toBeDefined();
    for (const state of scrollStates) {
      expect(screen.getByText(state.title)).toBeDefined();
    }
  });
});
