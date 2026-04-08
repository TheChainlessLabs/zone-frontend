import { describe, it, expect } from "vitest";
import {
  FEE_SCHEDULE,
  calculateFee,
  formatFeePercent,
  calculateSavingsPips,
} from "@/lib/fees";

describe("FEE_SCHEDULE", () => {
  it("has expected default rates", () => {
    expect(FEE_SCHEDULE.makerFeeRate).toBe(0);
    expect(FEE_SCHEDULE.takerFeeRate).toBe(0.00005);
    expect(FEE_SCHEDULE.minFee).toBe(0);
  });
});

describe("calculateFee", () => {
  it("returns 0 for maker orders", () => {
    expect(calculateFee(10000, true)).toBe(0);
  });

  it("returns taker fee for market orders", () => {
    // 10000 * 0.00005 = 0.5
    expect(calculateFee(10000)).toBeCloseTo(0.5);
  });

  it("returns 0 for zero amount", () => {
    expect(calculateFee(0)).toBe(0);
    expect(calculateFee(0, true)).toBe(0);
  });

  it("defaults to taker when isMaker omitted", () => {
    expect(calculateFee(1000)).toBeCloseTo(0.05);
  });

  it("never returns less than minFee", () => {
    expect(calculateFee(0.001)).toBeGreaterThanOrEqual(FEE_SCHEDULE.minFee);
  });
});

describe("formatFeePercent", () => {
  it("returns 'No fee' for maker", () => {
    expect(formatFeePercent(true)).toBe("No fee");
  });

  it("returns formatted percentage for taker", () => {
    expect(formatFeePercent()).toBe("0.005%");
    expect(formatFeePercent(false)).toBe("0.005%");
  });
});

describe("calculateSavingsPips", () => {
  it("returns null when midpoint is 0", () => {
    expect(calculateSavingsPips(0, 1.085)).toBeNull();
  });

  it("returns null when venue rate is 0", () => {
    expect(calculateSavingsPips(1.085, 0)).toBeNull();
  });

  it("calculates savings in pips", () => {
    // Wise at 1.0842, midpoint at 1.0850 → diff = 0.0008 → 8 pips
    const savings = calculateSavingsPips(1.085, 1.0842);
    expect(savings).toBeCloseTo(8, 0);
  });

  it("returns 0 when rates are identical", () => {
    expect(calculateSavingsPips(1.085, 1.085)).toBe(0);
  });

  it("handles large differences", () => {
    // 1.0850 vs 1.0900 → 50 pips
    const savings = calculateSavingsPips(1.085, 1.09);
    expect(savings).toBeCloseTo(50, 0);
  });
});
