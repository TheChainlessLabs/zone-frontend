import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockSignTypedDataAsync = vi.fn();
const mockCreateAccount = vi.fn();

vi.mock("wagmi", () => ({
  useSignTypedData: () => ({
    signTypedDataAsync: mockSignTypedDataAsync,
  }),
}));

vi.mock("../lib/config", () => ({
  config: {
    eip712Domain: {
      name: "Omega",
      version: "1",
      chainId: 31337,
      verifyingContract: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    },
  },
}));

vi.mock("../lib/apiClient", () => ({
  createAccount: (...args: unknown[]) => mockCreateAccount(...args),
}));

import { useAccountRegistration } from "../lib/hooks/useAccountRegistration";
import { ApiError } from "../lib/apiError";

const TEST_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" as `0x${string}`;
const FAKE_SIG = "0x" + "ab".repeat(65);

const localStorageStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
};

vi.stubGlobal("localStorage", mockLocalStorage);

beforeEach(() => {
  mockSignTypedDataAsync.mockReset();
  mockCreateAccount.mockReset();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  for (const key of Object.keys(localStorageStore)) {
    delete localStorageStore[key];
  }
});

describe("useAccountRegistration", () => {
  it("signs and creates account when address is set and no accountId", async () => {
    mockSignTypedDataAsync.mockResolvedValue(FAKE_SIG);
    mockCreateAccount.mockResolvedValue({ account_id: 42 });

    const setAccountId = vi.fn();
    renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: null,
        setAccountId,
      }),
    );

    await waitFor(() => {
      expect(mockSignTypedDataAsync).toHaveBeenCalledOnce();
    });

    expect(mockSignTypedDataAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        primaryType: "CreateAccountRequest",
        message: { owner: TEST_ADDRESS, nonce: BigInt(0) },
      }),
    );

    await waitFor(() => {
      expect(mockCreateAccount).toHaveBeenCalledWith({
        owner: TEST_ADDRESS,
        signature: FAKE_SIG,
        nonce: 0,
      });
    });

    await waitFor(() => {
      expect(setAccountId).toHaveBeenCalledWith(42);
    });

    expect(localStorage.getItem(`omega_account_${TEST_ADDRESS}`)).toBe("42");
  });

  it("skips registration when accountId already exists", () => {
    const setAccountId = vi.fn();
    renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: 42,
        setAccountId,
      }),
    );

    expect(mockSignTypedDataAsync).not.toHaveBeenCalled();
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });

  it("skips registration when address is undefined", () => {
    const setAccountId = vi.fn();
    renderHook(() =>
      useAccountRegistration({
        address: undefined,
        accountId: null,
        setAccountId,
      }),
    );

    expect(mockSignTypedDataAsync).not.toHaveBeenCalled();
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });

  it("handles 409 conflict gracefully", async () => {
    mockSignTypedDataAsync.mockResolvedValue(FAKE_SIG);
    mockCreateAccount.mockRejectedValue(
      new ApiError(409, "account already exists"),
    );

    // Pre-populate localStorage to simulate a previously registered account
    localStorage.setItem(`omega_account_${TEST_ADDRESS}`, "7");

    const setAccountId = vi.fn();
    const { result } = renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: null,
        setAccountId,
      }),
    );

    await waitFor(() => {
      expect(setAccountId).toHaveBeenCalledWith(7);
    });

    expect(result.current.registrationError).toBeNull();
  });

  it("does not set error on user rejection", async () => {
    mockSignTypedDataAsync.mockRejectedValue(new Error("User rejected the request"));

    const setAccountId = vi.fn();
    const { result } = renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: null,
        setAccountId,
      }),
    );

    await waitFor(() => {
      expect(result.current.isRegistering).toBe(false);
    });

    expect(result.current.registrationError).toBeNull();
    expect(setAccountId).not.toHaveBeenCalled();
  });

  it("sets error on unexpected failure", async () => {
    mockSignTypedDataAsync.mockResolvedValue(FAKE_SIG);
    mockCreateAccount.mockRejectedValue(new ApiError(500, "internal error"));

    const setAccountId = vi.fn();
    const { result } = renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: null,
        setAccountId,
      }),
    );

    await waitFor(() => {
      expect(result.current.registrationError).toBe("internal error");
    });

    expect(setAccountId).not.toHaveBeenCalled();
  });

  it("shows isRegistering=true during registration", async () => {
    let resolveSign: (value: string) => void;
    mockSignTypedDataAsync.mockImplementation(
      () => new Promise((resolve) => { resolveSign = resolve; }),
    );

    const setAccountId = vi.fn();
    const { result } = renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: null,
        setAccountId,
      }),
    );

    await waitFor(() => {
      expect(result.current.isRegistering).toBe(true);
    });

    mockCreateAccount.mockResolvedValue({ account_id: 1 });
    resolveSign!(FAKE_SIG);

    await waitFor(() => {
      expect(result.current.isRegistering).toBe(false);
    });
  });

  it("guards against StrictMode double-mount", async () => {
    mockSignTypedDataAsync.mockResolvedValue(FAKE_SIG);
    mockCreateAccount.mockResolvedValue({ account_id: 1 });

    const setAccountId = vi.fn();
    const { rerender } = renderHook(() =>
      useAccountRegistration({
        address: TEST_ADDRESS,
        accountId: null,
        setAccountId,
      }),
    );

    // Simulate StrictMode re-render
    rerender();

    await waitFor(() => {
      expect(mockSignTypedDataAsync).toHaveBeenCalledOnce();
    });
  });
});
