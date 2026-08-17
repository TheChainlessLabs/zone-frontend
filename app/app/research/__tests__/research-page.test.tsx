import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { configureAxe } from "vitest-axe";

import DesignPartnersPage from "@/app/research/design-partners/page";
import PriceDiscoveryPage from "@/app/research/private-price-discovery/page";
import ResearchPage from "@/app/research/page";

afterEach(cleanup);

const axeForPage = configureAxe({
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
  },
});

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
        name: /Private transfers are only half the market/i,
      })
      .getAttribute("href"),
  ).toBe("/research/private-price-discovery");
});

it("presents private price discovery through the Omega market cast", () => {
  render(<PriceDiscoveryPage />);

  expect(
    screen.getByRole("heading", {
      name: "Private transfers are only half the market.",
    }),
  ).toBeDefined();

  const flow = screen.getByRole("group", {
    name: "Private price discovery flow",
  });
  expect(flow.getAttribute("aria-describedby")).toBe(
    "private-price-flow-description",
  );
  expect(
    screen.getByText(
      "Maker and taker converge inside Omega. Omega settles through Tempo and publishes a proof receipt.",
    ),
  ).toBeDefined();
  expect(within(flow).queryAllByRole("img")).toHaveLength(0);
  expect(
    flow.querySelectorAll(
      '[role="presentation"][aria-hidden="true"]',
    ),
  ).toHaveLength(5);

  expect(
    screen
      .getByRole("link", {
        name: "Have a payments flow worth bringing into the dark?",
      })
      .getAttribute("href"),
  ).toBe("/research/design-partners");
  expect(
    screen.getByRole("link", { name: "Research" }).getAttribute("href"),
  ).toBe("/research");
});

it("keeps the visual rail out of nested complementary landmarks", async () => {
  const { container } = render(<PriceDiscoveryPage />);
  const results = await axeForPage(container);

  expect(results.violations).toEqual([]);
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
