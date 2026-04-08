import { describe, it, expect } from "vitest";
import { isDevWalletEnabled, injectDevWallet } from "../lib/devWalletStub";

describe("devWalletStub", () => {
  it("isDevWalletEnabled is false", () => {
    expect(isDevWalletEnabled).toBe(false);
  });
  it("injectDevWallet is a no-op function", () => {
    expect(() => injectDevWallet()).not.toThrow();
  });
});
