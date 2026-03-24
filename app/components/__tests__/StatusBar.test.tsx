import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import StatusBar from "@/components/StatusBar";

afterEach(cleanup);

describe("StatusBar", () => {
  it("renders the connection status indicator", () => {
    render(<StatusBar />);
    expect(screen.getByText("TEE Connected")).toBeInTheDocument();
  });

  it("renders the last update timestamp", () => {
    render(<StatusBar />);
    expect(screen.getByText(/Last update/)).toBeInTheDocument();
  });
});
