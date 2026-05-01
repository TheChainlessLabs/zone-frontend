import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let pathname = "/brand";
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));

import BrandPage from "../page";
import BrandComparePage from "../compare/page";

describe("/brand direction routing", () => {
  it("sets data-brand-direction from ?dir=N", () => {
    pathname = "/brand";
    searchParams = new URLSearchParams("dir=3");
    const { container } = render(<BrandPage />);
    expect(container.querySelector("main")?.getAttribute("data-brand-direction")).toBe("3");
    expect(screen.getByTestId("brand-specimen-3")).toBeDefined();
  });

  it("renders four compare cells", () => {
    pathname = "/brand/compare";
    searchParams = new URLSearchParams();
    render(<BrandComparePage />);
    expect(screen.getAllByTestId("brand-compare-cell")).toHaveLength(4);
  });
});
