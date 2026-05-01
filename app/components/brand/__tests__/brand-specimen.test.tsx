import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandSpecimen } from "../brand-specimen";

describe("BrandSpecimen", () => {
  it("renders the full canonical fixture set", () => {
    render(<BrandSpecimen direction={1} />);
    for (const fixture of [
      "fixture-navbar",
      "fixture-order-ticket",
      "fixture-disconnected",
      "fixture-verified-batch",
      "fixture-pending-batch",
      "fixture-receipt-export",
      "fixture-modal-stepper",
    ]) {
      expect(screen.getByTestId(fixture)).toBeDefined();
    }
  });
});
