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

it("renders the approved design partner call without changing the form", () => {
  render(<DesignPartnersPage />);

  expect(
    screen.getByRole("heading", {
      name: "Bring us a corridor worth solving.",
    }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Real flow, not a sandbox." }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "What we measure" }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "One pair. A defined test." }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Request Access" }),
  ).toBeDefined();
});
