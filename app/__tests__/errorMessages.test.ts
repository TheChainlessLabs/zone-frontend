import { describe, it, expect } from "vitest";
import { getFriendlyError } from "@/lib/errorMessages";

describe("getFriendlyError", () => {
  it("maps nonce errors correctly", () => {
    expect(getFriendlyError("invalid nonce: expected 5, got 3")).toBe(
      "Transaction out of sync. Please try again."
    );
  });

  it("maps insufficient balance errors", () => {
    expect(getFriendlyError("insufficient balance for withdrawal")).toBe(
      "Insufficient balance for this order."
    );
  });

  it("maps invalid signature errors", () => {
    expect(getFriendlyError("invalid signature: recovery failed")).toBe(
      "Signing failed. Try reconnecting your wallet."
    );
  });

  it("maps account not found errors", () => {
    expect(getFriendlyError("account 0xabc not found")).toBe(
      "Account not found. Please reconnect your wallet."
    );
  });

  it("maps order not found errors", () => {
    expect(getFriendlyError("order 42 not found")).toBe(
      "Order not found. It may have already been filled or cancelled."
    );
  });

  it("maps duplicate errors", () => {
    expect(getFriendlyError("duplicate order request")).toBe(
      "This request is already being processed."
    );
  });

  it("returns default message for unknown errors", () => {
    expect(getFriendlyError("something completely unexpected")).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("is case-insensitive", () => {
    expect(getFriendlyError("NONCE mismatch")).toBe(
      "Transaction out of sync. Please try again."
    );
    expect(getFriendlyError("INSUFFICIENT BALANCE")).toBe(
      "Insufficient balance for this order."
    );
    expect(getFriendlyError("Invalid Signature")).toBe(
      "Signing failed. Try reconnecting your wallet."
    );
  });
});
