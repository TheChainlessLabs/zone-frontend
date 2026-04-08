import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

// A component that throws on demand
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Boom!");
  }
  return <div>Child content</div>;
}

afterEach(cleanup);

describe("SectionErrorBoundary", () => {
  it("renders children normally when no error", () => {
    render(
      <SectionErrorBoundary>
        <div>Hello</div>
      </SectionErrorBoundary>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows ErrorState with fallback message when child throws", () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <SectionErrorBoundary fallbackMessage="Section failed">
        <Bomb shouldThrow={true} />
      </SectionErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Section failed")).toBeInTheDocument();
    expect(screen.queryByText("Child content")).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it("shows error message from thrown error when no fallbackMessage", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <SectionErrorBoundary>
        <Bomb shouldThrow={true} />
      </SectionErrorBoundary>
    );

    expect(screen.getByText("Boom!")).toBeInTheDocument();

    spy.mockRestore();
  });

  it("retry resets error state and re-renders children", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;

    function ConditionalBomb() {
      if (shouldThrow) {
        throw new Error("Boom!");
      }
      return <div>Recovered</div>;
    }

    render(
      <SectionErrorBoundary fallbackMessage="Section failed">
        <ConditionalBomb />
      </SectionErrorBoundary>
    );

    expect(screen.getByText("Section failed")).toBeInTheDocument();

    // Fix the error condition before retrying
    shouldThrow = false;

    fireEvent.click(screen.getByText("Retry"));

    expect(screen.getByText("Recovered")).toBeInTheDocument();
    expect(screen.queryByText("Section failed")).not.toBeInTheDocument();

    spy.mockRestore();
  });
});
