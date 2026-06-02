import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/landing/scene/midpoint-singularity-scene", () => ({
  MidpointSingularityScene: () => (
    <div data-testid="midpoint-singularity-scene">Scene stand-in</div>
  ),
}));

import { scrollStates } from "@/components/landing/content";
import { OrderScrollStory } from "@/components/landing/order-scroll-story";

afterEach(() => {
  cleanup();
});

describe("OrderScrollStory", () => {
  it("spaces each narrative state like a full scroll page", () => {
    render(<OrderScrollStory />);

    for (const state of scrollStates) {
      const panel = screen.getByText(state.title).closest("article");

      expect(panel?.getAttribute("data-scroll-panel")).toBe(state.id);
      expect(panel?.className).toContain("min-h-[110svh]");
      expect(panel?.className).toContain("pt-[66svh]");
    }
  });
});
