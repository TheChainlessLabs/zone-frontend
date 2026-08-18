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
      .getByRole("link", { name: /Connect your corridor - design partner signup/i })
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
      name: "Connect your corridor - design partner signup.",
    }),
  ).toBeDefined();
  expect(
    screen.getByText(
      /teams that move stablecoins regularly and know exactly where today’s execution falls short/i,
    ),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Start with the business case." }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Why take part?" }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", {
      name: "We’ll test our shared thesis.",
    }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Summary - One pair. One clear test." }),
  ).toBeDefined();
  expect(
    screen.getByText(
      /Integrations and corridor go-live follow this important sequence of testing/i,
    ),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Request Access" }),
  ).toBeDefined();
});
