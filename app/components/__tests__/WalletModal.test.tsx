import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { useState, useEffect } from "react";

const mockConnect = vi.fn();
let mockOnSuccess: ((data: { accounts: string[] }) => void) | undefined;
let mockOnError: ((error: Error) => void) | undefined;

const mockConnectors = [
  {
    uid: "metamask-1",
    name: "MetaMask",
    getProvider: () => Promise.resolve({}),
  },
  {
    uid: "walletconnect-1",
    name: "WalletConnect",
    getProvider: () => Promise.resolve({}),
  },
];

vi.mock("wagmi", () => ({
  useConnect: (opts: {
    mutation?: {
      onSuccess?: (data: { accounts: string[] }) => void;
      onError?: (error: Error) => void;
    };
  }) => {
    mockOnSuccess = opts?.mutation?.onSuccess;
    mockOnError = opts?.mutation?.onError;
    return {
      connectors: mockConnectors,
      connect: mockConnect,
      isPending: false,
    };
  },
}));

vi.mock("@/lib/useToast", () => ({
  useToast: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));

// Import after mocks are set up
import WalletModal from "@/components/WalletModal";

const onClose = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  mockConnect.mockClear();
  onClose.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

async function renderAndDetectConnectors() {
  await act(async () => {
    render(<WalletModal isOpen={true} onClose={onClose} />);
  });
  // Flush microtasks for getProvider promises
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

describe("WalletModal", () => {
  it("renders connector list in idle state", async () => {
    await renderAndDetectConnectors();

    expect(screen.getByText("MetaMask")).toBeTruthy();
    expect(screen.getByText("WalletConnect")).toBeTruthy();
    expect(
      screen.getByText("Connect your wallet to start trading on Omega Markets darkpool.")
    ).toBeTruthy();
  });

  it("shows connecting state when a connector is clicked", async () => {
    await renderAndDetectConnectors();

    fireEvent.click(screen.getByTestId("wallet-connector-metamask-1"));

    expect(screen.getByTestId("connecting-state")).toBeTruthy();
    expect(screen.getByText("Waiting for wallet approval...")).toBeTruthy();
    expect(screen.getByText("MetaMask")).toBeTruthy();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("shows connected state on success and auto-closes after 2 seconds", async () => {
    await renderAndDetectConnectors();

    fireEvent.click(screen.getByTestId("wallet-connector-metamask-1"));

    // Simulate success callback
    act(() => {
      mockOnSuccess?.({ accounts: ["0x7a3f1234567890abcdef1234567890abcdefb2c1"] });
    });

    expect(screen.getByTestId("connected-state")).toBeTruthy();
    expect(screen.getByText("0x7a3f...b2c1")).toBeTruthy();
    expect(screen.getByText("Wallet connected successfully.")).toBeTruthy();

    // Should not have closed yet
    expect(onClose).not.toHaveBeenCalled();

    // Advance timer by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows failed state on error with retry and cancel buttons", async () => {
    await renderAndDetectConnectors();

    fireEvent.click(screen.getByTestId("wallet-connector-metamask-1"));

    act(() => {
      mockOnError?.(new Error("MetaMask rejected the connection request."));
    });

    expect(screen.getByTestId("failed-state")).toBeTruthy();
    expect(
      screen.getByText("MetaMask rejected the connection request.")
    ).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Try Again")).toBeTruthy();
  });

  it("retries connection when Try Again is clicked", async () => {
    await renderAndDetectConnectors();

    fireEvent.click(screen.getByTestId("wallet-connector-metamask-1"));

    act(() => {
      mockOnError?.(new Error("Connection rejected."));
    });

    mockConnect.mockClear();
    fireEvent.click(screen.getByText("Try Again"));

    expect(screen.getByTestId("connecting-state")).toBeTruthy();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("closes modal and resets state when Cancel is clicked in failed state", async () => {
    await renderAndDetectConnectors();

    fireEvent.click(screen.getByTestId("wallet-connector-metamask-1"));

    act(() => {
      mockOnError?.(new Error("Connection rejected."));
    });

    fireEvent.click(screen.getByText("Cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<WalletModal isOpen={false} onClose={onClose} />);
    expect(container.innerHTML).toBe("");
  });
});
