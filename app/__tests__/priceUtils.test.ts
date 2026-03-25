import { describe, it, expect } from "vitest";
import { encodePrice, decodePrice, encodeQuantity, decodeQuantity } from "../lib/priceUtils";

describe("priceUtils", () => {
  describe("encodePrice", () => {
    it("encodes 1.0856 to 18-decimal fixed-point", () => {
      expect(encodePrice(1.0856)).toBe("1085600000000000000");
    });

    it("encodes 1.0 to 18-decimal fixed-point", () => {
      expect(encodePrice(1.0)).toBe("1000000000000000000");
    });

    it("encodes 0.5 correctly", () => {
      expect(encodePrice(0.5)).toBe("500000000000000000");
    });

    it("encodes with custom decimals", () => {
      expect(encodePrice(1.5, 6)).toBe("1500000");
    });
  });

  describe("decodePrice", () => {
    it("decodes 18-decimal fixed-point string", () => {
      expect(decodePrice("1085600000000000000")).toBe(1.0856);
    });

    it("decodes number input", () => {
      expect(decodePrice(1000000000000000000)).toBe(1.0);
    });

    it("roundtrips with encodePrice", () => {
      const values = [1.0856, 0.9999, 1.5, 0.001, 100.123456];
      for (const v of values) {
        expect(decodePrice(encodePrice(v))).toBeCloseTo(v, 10);
      }
    });
  });

  describe("encodeQuantity", () => {
    it("encodes 100 USDC (6 decimals)", () => {
      expect(encodeQuantity(100, 6)).toBe("100000000");
    });

    it("encodes 0.5 USDC", () => {
      expect(encodeQuantity(0.5, 6)).toBe("500000");
    });

    it("encodes 1000 with 18 decimals", () => {
      expect(encodeQuantity(1000, 18)).toBe("1000000000000000000000");
    });
  });

  describe("decodeQuantity", () => {
    it("decodes 100 USDC", () => {
      expect(decodeQuantity("100000000", 6)).toBe(100);
    });

    it("roundtrips with encodeQuantity", () => {
      const pairs: [number, number][] = [
        [100, 6],
        [0.5, 6],
        [1000, 18],
        [0.001, 8],
      ];
      for (const [qty, dec] of pairs) {
        expect(decodeQuantity(encodeQuantity(qty, dec), dec)).toBeCloseTo(qty, 10);
      }
    });
  });
});
