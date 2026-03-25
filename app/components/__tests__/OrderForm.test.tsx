import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import OrderForm from "@/components/OrderForm";

afterEach(cleanup);

describe("OrderForm", () => {
  it("renders skeleton blocks when isLoading is true", () => {
    const { container } = render(<OrderForm isLoading={true} />);
    const skeletons = container.querySelectorAll("[class*='animate-pulse']");
    // Should have multiple skeleton blocks (toggle, input, shortcuts, details, submit, privacy)
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it("does not render Buy/Sell buttons when loading", () => {
    render(<OrderForm isLoading={true} />);
    expect(screen.queryByText("Buy")).toBeNull();
    expect(screen.queryByText("Sell")).toBeNull();
  });

  it("renders Buy/Sell buttons when not loading", () => {
    render(<OrderForm isLoading={false} />);
    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  it("wraps loaded content in animate-fadeIn", () => {
    const { container } = render(<OrderForm isLoading={false} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });

  it("does not show animate-fadeIn when loading", () => {
    const { container } = render(<OrderForm isLoading={true} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).toBeNull();
  });
});
