import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// The pinned scroll story drives itself from scroll + matchMedia; stub it so
// the page-level test focuses on section composition and copy.
vi.mock("@/components/landing/order-scroll-story", () => ({
  OrderScrollStory: () => <div data-testid="order-scroll-story">Mechanism stand-in</div>,
}));

import HomePage, { metadata } from "@/app/page";

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("renders the public landing hero with the kit headline", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("heading", {
      name: "Private stablecoin execution across chains and venues.",
    }),
  ).toBeDefined();
  expect(screen.getByTestId("hero-abstract-field")).toBeDefined();
  expect(screen.getByTestId("order-scroll-story")).toBeDefined();
});

it("exposes the nav launch-app and request-access actions", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("link", { name: "Launch app" }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("link", { name: "Request Access" }).length).toBeGreaterThan(0);
});

it("renders the Why Omega and Built for sections", () => {
  render(<HomePage />);

  expect(screen.getByText("Stable rates everywhere")).toBeDefined();
  expect(screen.getByText("Compliance by default")).toBeDefined();
  expect(screen.getByRole("heading", { name: "Funds" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Exchanges" })).toBeDefined();
});

it("renders the request-access card and footer tagline", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: "Request access" })).toBeDefined();
  expect(
    screen.getByText("Private stablecoin execution · Onchain settlement"),
  ).toBeDefined();
});

it("sets landing page metadata", () => {
  expect(metadata.title).toBe("Omega Markets — Private stablecoin execution");
  expect(metadata.description).toBe(
    "Omega matches stablecoin orders privately, accesses external liquidity when needed, and settles with verifiable proofs.",
  );
});
