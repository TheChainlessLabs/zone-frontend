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
      name: "Private stablecoin swaps",
    }),
  ).toBeDefined();
  expect(screen.getByTestId("hero-abstract-field")).toBeDefined();
  expect(screen.queryByTestId("order-scroll-story")).toBeNull();
});

it("exposes research and account-funding actions", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("link", { name: "Research" }).getAttribute("href"),
  ).toBe("/research");
  // The nav CTA reads "Fund account" at every breakpoint; the hero keeps the
  // longer label. Both point at /trade.
  expect(
    screen.getByRole("link", { name: "Fund account" }).getAttribute("href"),
  ).toBe("/trade");
  expect(
    screen.getByRole("link", { name: "Fund your account" }).getAttribute("href"),
  ).toBe("/trade");
  expect(
    screen.getByRole("link", { name: "Design partner access" }).getAttribute("href"),
  ).toBe("/research/design-partners");
  // "Launch app" sits in both the nav and the hero row, so there are two of
  // them; both point at the app entry alongside the fund CTA.
  const launch = screen.getAllByRole("link", { name: "Launch app" });
  expect(launch).toHaveLength(2);
  for (const link of launch) {
    expect(link.getAttribute("href")).toBe("/trade");
  }
});

it("sets landing page metadata", () => {
  expect(metadata.title).toBe(
    "Omega Markets — Private price discovery for stablecoin FX",
  );
  expect(metadata.description).toBe(
    "Omega is a payments-focused dark book for private stablecoin FX price discovery.",
  );
});

it("renders the status panel with live testnet figures", () => {
  render(<HomePage />);

  expect(screen.getByText("Omega Markets Status")).toBeDefined();
  expect(screen.getByText("Live alpha testnet")).toBeDefined();
  // `###` is the shipped placeholder until the testnet feed lands.
  expect(screen.getAllByText("###")).toHaveLength(2);
  expect(screen.getByText("Batch number - testnet")).toBeDefined();
  expect(screen.getByText("Volume (30d) - testnet")).toBeDefined();
  expect(screen.getByText("Orders match")).toBeDefined();
});
