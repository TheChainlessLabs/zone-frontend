import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";

const mockDisconnect = vi.fn();

vi.mock("wagmi", () => ({
  useDisconnect: () => ({ disconnect: mockDisconnect }),
}));

const mockAddToast = vi.fn();
vi.mock("@/lib/useToast", () => ({
  useToast: () => ({ toasts: [], addToast: mockAddToast, removeToast: vi.fn() }),
}));

import WalletDropdown from "@/components/WalletDropdown";

const TEST_ADDRESS = "0x7a3f1234567890abcdef1234567890abcdefb2c1" as `0x${string}`;

beforeEach(() => {
  mockDisconnect.mockClear();
  mockAddToast.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("WalletDropdown", () => {
  it("renders truncated address", () => {
    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />);
    expect(screen.getByText("0x7a3f...b2c1")).toBeTruthy();
  });

  it("opens dropdown on click", () => {
    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />);
    expect(screen.queryByTestId("wallet-dropdown-menu")).toBeNull();

    fireEvent.click(screen.getByTestId("wallet-dropdown-trigger"));
    expect(screen.getByTestId("wallet-dropdown-menu")).toBeTruthy();
  });

  it("shows Copy Address, View on Etherscan, and Disconnect options", () => {
    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />);
    fireEvent.click(screen.getByTestId("wallet-dropdown-trigger"));

    expect(screen.getByText("Copy Address")).toBeTruthy();
    expect(screen.getByText("View on Etherscan")).toBeTruthy();
    expect(screen.getByText("Disconnect")).toBeTruthy();
  });

  it("copies address and shows toast on Copy Address click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />);
    fireEvent.click(screen.getByTestId("wallet-dropdown-trigger"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("wallet-dropdown-copy"));
    });

    expect(writeText).toHaveBeenCalledWith(TEST_ADDRESS);
    expect(mockAddToast).toHaveBeenCalledWith("success", "Address copied", "Copied to clipboard");
    // Dropdown should close
    expect(screen.queryByTestId("wallet-dropdown-menu")).toBeNull();
  });

  it("opens Etherscan link on View on Etherscan click", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />);
    fireEvent.click(screen.getByTestId("wallet-dropdown-trigger"));
    fireEvent.click(screen.getByTestId("wallet-dropdown-etherscan"));

    expect(openSpy).toHaveBeenCalledWith(
      `https://etherscan.io/address/${TEST_ADDRESS}`,
      "_blank"
    );
    openSpy.mockRestore();
  });

  it("disconnects wallet on Disconnect click", () => {
    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />);
    fireEvent.click(screen.getByTestId("wallet-dropdown-trigger"));
    fireEvent.click(screen.getByTestId("wallet-dropdown-disconnect"));

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    // Dropdown should close
    expect(screen.queryByTestId("wallet-dropdown-menu")).toBeNull();
  });

  it("closes on outside click", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <WalletDropdown address={TEST_ADDRESS} isSupportedChain={true} />
      </div>
    );

    fireEvent.click(screen.getByTestId("wallet-dropdown-trigger"));
    expect(screen.getByTestId("wallet-dropdown-menu")).toBeTruthy();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("wallet-dropdown-menu")).toBeNull();
  });

  it("shows 'Wrong network' when chain is not supported", () => {
    render(<WalletDropdown address={TEST_ADDRESS} isSupportedChain={false} />);
    expect(screen.getByText("Wrong network")).toBeTruthy();
  });
});
