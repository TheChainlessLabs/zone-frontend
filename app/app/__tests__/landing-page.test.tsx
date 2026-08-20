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

it("renders the one-screen dark-book identity page", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("heading", {
      name: "Private FX Swaps",
    }),
  ).toBeDefined();
  expect(screen.queryByTestId("order-scroll-story")).toBeNull();
});

it("exposes research and account-funding actions", () => {
  render(<HomePage />);

  const researchLinks = screen.getAllByRole("link", { name: "Research" });
  expect(researchLinks.some((link) => link.getAttribute("href") === "/research")).toBe(true);

  const launchLinks = screen.getAllByRole("link", { name: "Launch app" });
  expect(launchLinks.length).toBeGreaterThan(0);
  expect(launchLinks.some((link) => link.getAttribute("href") === "/trade")).toBe(true);

  const designPartnerLinks = screen.getAllByRole("link", { name: "Design partners" });
  expect(designPartnerLinks.some((link) => link.getAttribute("href") === "/research/design-partners")).toBe(true);
});

it("sets landing page metadata", () => {
  expect(metadata.title).toBe(
    "Omega Markets — Private price discovery for stablecoin FX",
  );
  expect(metadata.description).toBe(
    "Omega is a payments-focused dark book for private stablecoin FX price discovery.",
  );
});
