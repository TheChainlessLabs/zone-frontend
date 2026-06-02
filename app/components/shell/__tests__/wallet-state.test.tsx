import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

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
  type WalletStateContextValue,
} from "@/components/shell/WalletStateProvider";

const STORAGE_KEY = "omega:wallet-state";

afterEach(() => {
  cleanup();
  currentParams = new URLSearchParams();
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
});

function Probe({
  capture,
}: {
  capture?: (ctx: WalletStateContextValue) => void;
}) {
  const ctx = useWalletState();
  capture?.(ctx);
  return (
    <div data-testid="probe">
      {ctx.state}|{ctx.address ?? ""}|{ctx.chainName ?? ""}|
      {ctx.connector ?? ""}
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
    param: "signing-up",
    expected: "signing-up",
    hasAddress: false,
    chain: "Tempo Testnet (Moderato)",
  },
  {
    param: "connecting",
    expected: "connecting",
    hasAddress: false,
    chain: "Tempo Testnet (Moderato)",
  },
  {
    param: "connected",
    expected: "connected",
    hasAddress: true,
    chain: "Tempo Testnet (Moderato)",
  },
  {
    param: "wrong-network",
    expected: "wrong-network",
    hasAddress: true,
    chain: "Ethereum",
  },
  {
    param: "no-nft-pass",
    expected: "no-nft-pass",
    hasAddress: true,
    chain: "Tempo Testnet (Moderato)",
  },
  // Unknown values fall back to disconnected — same intent as a missing param.
  { param: "garbage", expected: "disconnected", hasAddress: false, chain: "" },
];

describe("WalletStateProvider — query-param overrides", () => {
  for (const tc of CASES) {
    it(`maps ?walletState=${tc.param ?? "<unset>"} → ${tc.expected}`, () => {
      currentParams = new URLSearchParams(
        tc.param === null ? "" : `walletState=${tc.param}`
      );

      render(
        <WalletStateProvider mode="mock">
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

describe("WalletStateProvider — interactive flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("signUp() transitions disconnected → signing-up → connected", () => {
    let captured: WalletStateContextValue | null = null;

    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    expect(captured!.state).toBe("disconnected");

    act(() => {
      captured!.signUp();
    });
    expect(captured!.state).toBe("signing-up");

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(captured!.state).toBe("connected");
    expect(captured!.address).toBe(
      "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
    );
  });

  it("connect() transitions disconnected → connecting → connected", () => {
    let captured: WalletStateContextValue | null = null;

    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    expect(captured!.state).toBe("disconnected");

    act(() => {
      captured!.connect("Tempo Wallet");
    });
    expect(captured!.state).toBe("connecting");
    expect(captured!.connector).toBe("Tempo Wallet");
    expect(captured!.address).toBeUndefined();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(captured!.state).toBe("connected");
    expect(captured!.address).toBe(
      "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
    );
    expect(captured!.chainName).toBe("Tempo Testnet (Moderato)");
  });

  it("disconnect() resets to disconnected and clears connector", () => {
    let captured: WalletStateContextValue | null = null;

    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    act(() => {
      captured!.connect("Tempo Wallet");
    });
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(captured!.state).toBe("connected");

    act(() => {
      captured!.disconnect();
    });
    expect(captured!.state).toBe("disconnected");
    expect(captured!.connector).toBeUndefined();
    expect(captured!.address).toBeUndefined();
  });

  it("switchNetwork() transitions wrong-network → connected", () => {
    currentParams = new URLSearchParams("walletState=wrong-network");
    let captured: WalletStateContextValue | null = null;

    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    expect(captured!.state).toBe("wrong-network");
    expect(captured!.chainName).toBe("Ethereum");

    act(() => {
      captured!.switchNetwork();
    });
    expect(captured!.state).toBe("connected");
    expect(captured!.chainName).toBe("Tempo Testnet (Moderato)");
  });

  it("persists connected state to localStorage and rehydrates on remount", () => {
    let captured: WalletStateContextValue | null = null;

    const { unmount } = render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    act(() => {
      captured!.connect("Tempo Wallet");
    });
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(captured!.state).toBe("connected");

    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string) as {
      state: WalletState;
      connector?: string;
    };
    expect(parsed.state).toBe("connected");
    expect(parsed.connector).toBe("Tempo Wallet");

    unmount();

    let rehydrated: WalletStateContextValue | null = null;
    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (rehydrated = ctx)} />
      </WalletStateProvider>
    );
    expect(rehydrated!.state).toBe("connected");
    expect(rehydrated!.connector).toBe("Tempo Wallet");
    expect(rehydrated!.address).toBe(
      "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"
    );
  });

  it("does not persist transient `connecting` state across reload", () => {
    let captured: WalletStateContextValue | null = null;

    const { unmount } = render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    act(() => {
      captured!.connect("Tempo Wallet");
    });
    expect(captured!.state).toBe("connecting");
    // Persistence skips while we're mid-connect.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    unmount();

    let rehydrated: WalletStateContextValue | null = null;
    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (rehydrated = ctx)} />
      </WalletStateProvider>
    );
    // Stale connecting reload falls back gracefully.
    expect(rehydrated!.state).toBe("disconnected");
  });

  it("disconnect() clears persistence", () => {
    let captured: WalletStateContextValue | null = null;

    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    act(() => {
      captured!.connect("Tempo Wallet");
    });
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    act(() => {
      captured!.disconnect();
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("query override beats persisted state on hydrate", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: "connected", connector: "Tempo Wallet" })
    );
    currentParams = new URLSearchParams("walletState=disconnected");

    let captured: WalletStateContextValue | null = null;
    render(
      <WalletStateProvider mode="mock">
        <Probe capture={(ctx) => (captured = ctx)} />
      </WalletStateProvider>
    );

    expect(captured!.state).toBe("disconnected");
  });
});

describe("useWalletState — outside provider", () => {
  it("throws when used without a provider", () => {
    // Suppress React's expected error log + jsdom's unhandled-error event
    // re-emission for this single render. Both are by design when a render
    // throws; we just don't want the noise in test output.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const swallow = (event: Event) => event.preventDefault();
    window.addEventListener("error", swallow, true);
    try {
      expect(() => render(<Probe />)).toThrow(
        /useWalletState must be used inside a WalletStateProvider/
      );
    } finally {
      window.removeEventListener("error", swallow, true);
      errorSpy.mockRestore();
    }
  });
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
