import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("EmptyState", () => {
  it("renders icon, title, and description", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">IC</span>}
        title="No items"
        description="Nothing to show here."
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show here.")).toBeInTheDocument();
  });

  it("renders CTA button when action with onClick is provided", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={<span>IC</span>}
        title="Empty"
        description="Desc"
        action={{ label: "Do thing", onClick: handleClick }}
      />
    );
    const btn = screen.getByText("Do thing");
    expect(btn.tagName).toBe("BUTTON");
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders CTA link when action with href is provided", () => {
    render(
      <EmptyState
        icon={<span>IC</span>}
        title="Empty"
        description="Desc"
        action={{ label: "Go there", href: "/funding" }}
      />
    );
    const link = screen.getByText("Go there");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/funding");
  });

  it("does not render CTA when action is not provided", () => {
    render(
      <EmptyState
        icon={<span>IC</span>}
        title="Empty"
        description="Desc"
      />
    );
    // No button or link beyond the component itself
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders default message when none provided", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/couldn\u2019t load this data/)).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ErrorState message="Custom error." />);
    expect(screen.getByText("Custom error.")).toBeInTheDocument();
  });

  it("renders Retry button that calls onRetry", () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const btn = screen.getByText("Retry");
    fireEvent.click(btn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render Retry button when onRetry is not provided", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });
});
