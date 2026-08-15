import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import DesignPartnersPage from "@/app/research/design-partners/page";
import PriceDiscoveryPage from "@/app/research/private-price-discovery/page";
import ResearchPage from "@/app/research/page";

afterEach(cleanup);

it("renders the research index with both public articles", () => {
  render(<ResearchPage />);

  expect(screen.getByRole("heading", { name: "Research" })).toBeDefined();
  expect(
    screen.getByRole("link", { name: /Design partners/i }).getAttribute("href"),
  ).toBe("/research/design-partners");
  expect(
    screen
      .getByRole("link", { name: /Private price discovery for payments flow/i })
      .getAttribute("href"),
  ).toBe("/research/private-price-discovery");
});

it("renders the design partner page with the existing request form", () => {
  render(<DesignPartnersPage />);

  expect(
    screen.getByRole("heading", { name: /Help shape private stablecoin FX/i }),
  ).toBeDefined();
  expect(screen.getByRole("button", { name: /Request access/i })).toBeDefined();
});

it("renders the private price discovery explanation", () => {
  render(<PriceDiscoveryPage />);

  expect(
    screen.getByRole("heading", { name: /Private price discovery for payments flow/i }),
  ).toBeDefined();
  expect(
    screen.getByText(
      "Privacy is not the destination. It is the condition that lets makers and takers discover price without exposing the flow that creates the price.",
    ),
  ).toBeDefined();
});
