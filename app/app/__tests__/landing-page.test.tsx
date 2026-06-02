import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@/components/landing/scene/midpoint-singularity-scene", () => ({
  MidpointSingularityScene: () => (
    <div data-testid="midpoint-singularity-scene">Scene stand-in</div>
  ),
}));

import HomePage, { metadata } from "@/app/page";

afterEach(() => {
  cleanup();
});

it("renders the public landing hero instead of redirecting to trade", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("heading", {
      name: "Darkpool spot FX. Onchain settlement.",
    }),
  ).toBeDefined();
  expect(screen.getAllByRole("link", { name: "Request Access" }).length).toBeGreaterThan(0);
  expect(screen.getByTestId("hero-abstract-field")).toBeDefined();
  expect(screen.getAllByTestId("midpoint-singularity-scene").length).toBe(1);
});

it("renders post-animation conversion sections", () => {
  render(<HomePage />);

  expect(screen.getByText("Midpoint-or-better pricing")).toBeDefined();
  expect(screen.getByText("No pre-fill visibility")).toBeDefined();
  expect(
    screen.getByText(
      "Built for funds, treasuries, onchain traders, payment processors, and FX-exposed crypto businesses.",
    ),
  ).toBeDefined();
  expect(screen.getByText("Omega Markets — Proven, not promised.")).toBeDefined();
});

it("sets landing page metadata", () => {
  expect(metadata.title).toBe("Omega Markets — Darkpool spot FX");
  expect(metadata.description).toBe(
    "Private spot FX execution with onchain settlement and verifiable fills.",
  );
});
