import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarketInstrument, marketInstrumentNames } from "../market-instrument";

afterEach(cleanup);

describe("MarketInstrument", () => {
  it("renders every approved actor", () => {
    const { container } = render(
      <>
        {marketInstrumentNames.map((name) => (
          <MarketInstrument key={name} name={name} />
        ))}
      </>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("is decorative without a title", () => {
    const { container } = render(<MarketInstrument name="omega" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("becomes an accessible image with a title", () => {
    render(<MarketInstrument name="proof" title="Public proof artifact" />);
    expect(screen.getByRole("img", { name: "Public proof artifact" })).toBeDefined();
  });
});
