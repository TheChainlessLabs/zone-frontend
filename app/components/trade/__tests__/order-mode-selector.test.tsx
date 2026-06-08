import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { OrderModeSelector } from "@/components/trade";

afterEach(() => {
  cleanup();
});

it("renders both Market and Limit tabs with the active one marked aria-selected", () => {
  render(<OrderModeSelector value="market" onChange={() => {}} />);
  const market = screen.getByRole("tab", { name: "Market" });
  const limit = screen.getByRole("tab", { name: "Limit" });
  expect(market.getAttribute("aria-selected")).toBe("true");
  expect(limit.getAttribute("aria-selected")).toBe("false");
});

it("clicking an inactive tab fires onChange with that mode", () => {
  const onChange = vi.fn();
  render(<OrderModeSelector value="market" onChange={onChange} />);
  fireEvent.click(screen.getByRole("tab", { name: "Limit" }));
  expect(onChange).toHaveBeenCalledWith("limit");
});

it("re-rendering with value=limit flips aria-selected", () => {
  const { rerender } = render(
    <OrderModeSelector value="market" onChange={() => {}} />,
  );
  rerender(<OrderModeSelector value="limit" onChange={() => {}} />);
  expect(
    screen.getByRole("tab", { name: "Limit" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(
    screen.getByRole("tab", { name: "Market" }).getAttribute("aria-selected"),
  ).toBe("false");
});

it("uses the liquid-glass pill material on the container", () => {
  render(<OrderModeSelector value="market" onChange={() => {}} />);
  const list = screen.getByRole("tablist", { name: "Order mode" });
  expect(list.className).toContain("glass-pill");
});

it("renders a single sliding indicator and tags the active segment for measurement", () => {
  // The kit's mode toggle slides one indicator under the active segment,
  // measured from the active button's box (the shell Navbar technique).
  render(<OrderModeSelector value="limit" onChange={() => {}} />);
  const list = screen.getByRole("tablist", { name: "Order mode" });
  // Exactly one element carries the active-measurement hook, and it is Limit.
  const active = list.querySelectorAll('[data-mode-active="true"]');
  expect(active.length).toBe(1);
  expect(active[0]?.textContent).toBe("Limit");
  // The indicator is an aria-hidden span that is not one of the tab buttons.
  const indicator = list.querySelector(":scope > span[aria-hidden]");
  expect(indicator).not.toBeNull();
});
