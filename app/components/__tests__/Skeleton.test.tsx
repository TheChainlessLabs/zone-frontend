import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { Skeleton, SkeletonRow } from "@/components/Skeleton";

afterEach(cleanup);

describe("Skeleton", () => {
  it("renders with animate-pulse class", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("animate-pulse");
  });

  it("renders with bg-bg-elevated class", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el.className).toContain("bg-bg-elevated");
  });

  it("accepts additional className", () => {
    render(<Skeleton data-testid="skeleton" className="h-[28px] w-full" />);
    const el = screen.getByTestId("skeleton");
    expect(el.className).toContain("h-[28px]");
    expect(el.className).toContain("w-full");
  });
});

describe("SkeletonRow", () => {
  it("renders the correct number of skeleton cells", () => {
    render(
      <SkeletonRow
        data-testid="skeleton-row"
        height="28px"
        columns={[{ width: "30%" }, { width: "35%" }, { width: "35%" }]}
      />
    );
    const row = screen.getByTestId("skeleton-row");
    expect(row).toBeInTheDocument();
    // 3 columns = 3 skeleton cells
    const cells = row.querySelectorAll("[class*='animate-pulse']");
    expect(cells.length).toBe(3);
  });

  it("renders with the specified height", () => {
    render(
      <SkeletonRow
        data-testid="skeleton-row"
        height="32px"
        columns={[{ width: "50%" }, { width: "50%" }]}
      />
    );
    const row = screen.getByTestId("skeleton-row");
    expect(row.style.height).toBe("32px");
  });

  it("applies right alignment to columns with align: right", () => {
    render(
      <SkeletonRow
        data-testid="skeleton-row"
        height="28px"
        columns={[
          { width: "30%" },
          { width: "35%", align: "right" },
          { width: "35%", align: "right" },
        ]}
      />
    );
    const row = screen.getByTestId("skeleton-row");
    const cells = row.children;
    expect(cells[0].className).toContain("justify-start");
    expect(cells[1].className).toContain("justify-end");
    expect(cells[2].className).toContain("justify-end");
  });
});
