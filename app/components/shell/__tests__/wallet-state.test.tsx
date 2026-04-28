import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// next/navigation's `useSearchParams` is mocked at module scope so the
// provider can be driven without a real router. Tests mutate
// `currentParams` to flip query strings between cases.
let currentParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => currentParams,
}));

import {
  WalletStateProvider,
  truncateAddress,
  useWalletState,
  type WalletState,
} from "@/components/shell/WalletStateProvider";

afterEach(() => {
  cleanup();
  currentParams = new URLSearchParams();
});

function Probe() {
  const ctx = useWalletState();
  return (
    <div data-testid="probe">
      {ctx.state}|{ctx.address ?? ""}|{ctx.chainName ?? ""}
    </div>
  );
}

const CASES: Array<{
  param: string | null;
  expected: WalletState;
  hasAddress: boolean;
  chain: string;
}> = [
  { param: null, expected: "disconnected", hasAddress: false, chain: "" },
  {
    param: "disconnected",
    expected: "disconnected",
    hasAddress: false,
    chain: "",
  },
  {
    param: "connected",
    expected: "connected",
    hasAddress: true,
    chain: "Ethereum",
  },
  {
    param: "wrong-network",
    expected: "wrong-network",
    hasAddress: true,
    chain: "Base",
  },
  {
    param: "no-nft-pass",
    expected: "no-nft-pass",
    hasAddress: true,
    chain: "Ethereum",
  },
  // Unknown values fall back to disconnected — same intent as a missing param.
  { param: "garbage", expected: "disconnected", hasAddress: false, chain: "" },
];

describe("WalletStateProvider", () => {
  for (const tc of CASES) {
    it(`maps ?walletState=${tc.param ?? "<unset>"} → ${tc.expected}`, () => {
      currentParams = new URLSearchParams(
        tc.param === null ? "" : `walletState=${tc.param}`
      );

      render(
        <WalletStateProvider>
          <Probe />
        </WalletStateProvider>
      );
      const probe = screen.getByTestId("probe");
      const [state, addr, chain] = (probe.textContent ?? "").split("|");
      expect(state).toBe(tc.expected);
      expect(Boolean(addr)).toBe(tc.hasAddress);
      expect(chain).toBe(tc.chain);
    });
  }
});

describe("truncateAddress", () => {
  it("collapses long addresses to 0xabcd…WXYZ form", () => {
    expect(truncateAddress("0xa513e6e4b8f2a923d98304ec87f64353c4d5c853")).toBe(
      "0xa513…C853"
    );
  });

  it("returns short strings unchanged", () => {
    expect(truncateAddress("0x123")).toBe("0x123");
  });
});
