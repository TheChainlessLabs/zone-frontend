import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import DesignPartnersPage from "@/app/research/design-partners/page";
import ResearchPage from "@/app/research/page";

afterEach(cleanup);

it("renders exactly two research articles", () => {
  render(<ResearchPage />);

  const index = screen.getByRole("list", { name: "Research articles" });
  expect(within(index).getAllByRole("link")).toHaveLength(2);
  expect(
    within(index)
      .getByRole("link", { name: /Bring us a corridor worth solving/i })
      .getAttribute("href"),
  ).toBe("/research/design-partners");
  expect(
    within(index)
      .getByRole("link", {
        name: /Private price discovery for payments flow/i,
      })
      .getAttribute("href"),
  ).toBe("/research/private-price-discovery");
});

it("renders the expanded design partner call without changing the form", () => {
  render(<DesignPartnersPage />);

  expect(
    screen.getByRole("heading", {
      name: "Bring us a corridor worth solving.",
    }),
  ).toBeDefined();
  expect(
    screen.getByText(
      /teams that move stablecoins regularly and know exactly where today’s execution falls short/i,
    ),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Start with something real." }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Why take part?" }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", {
      name: "We’ll compare it with what already works.",
    }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "One pair. One clear test." }),
  ).toBeDefined();
  expect(
    screen.getByText("Only then do we talk about integration."),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Request Access" }),
  ).toBeDefined();
});
