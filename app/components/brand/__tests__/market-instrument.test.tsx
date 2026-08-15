import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarketInstrument, marketInstrumentNames } from "../market-instrument";

afterEach(cleanup);

const canonicalGeometry = {
  taker: {
    paths: ["M8 32h26M27 23l9 9-9 9M47 17v-5M47 52v-5"],
    circles: [["47", "32", "9"]],
  },
  maker: {
    paths: ["M32 10v44M15 20h34M12 32h40M17 44h30"],
    circles: [
      ["15", "20", "4"], ["49", "20", "4"], ["12", "32", "4"],
      ["52", "32", "4"], ["17", "44", "4"], ["47", "44", "4"],
    ],
  },
  omega: {
    paths: ["M5 32h18M41 32h18"],
    circles: [["32", "32", "21"], ["32", "32", "11"]],
  },
  tempo: {
    paths: ["M8 19h29l8 8h11M8 32h48M8 45h11l8-8h29"],
    circles: [["8", "19", "3"], ["56", "32", "3"], ["8", "45", "3"]],
  },
  proof: {
    paths: ["M17 8h23l9 9v39H17zM40 8v10h9M24 28h18M24 36h12", "m37.5 44 2.5 2.5 5-5"],
    circles: [["41", "44", "8"]],
  },
} as const;

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

  it("preserves each actor's canonical geometry", () => {
    for (const [name, expected] of Object.entries(canonicalGeometry)) {
      const { container, unmount } = render(
        <MarketInstrument name={name as keyof typeof canonicalGeometry} />,
      );
      expect([...container.querySelectorAll("path")].map((path) => path.getAttribute("d"))).toEqual(expected.paths);
      expect([...container.querySelectorAll("circle")].map((circle) => ["cx", "cy", "r"].map((key) => circle.getAttribute(key)))).toEqual(expected.circles);
      unmount();
    }
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
