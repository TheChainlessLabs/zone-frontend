/**
 * Dev-only wallet provider.
 *
 * When NEXT_PUBLIC_DEV_WALLET_PK is set and NODE_ENV === "development",
 * this injects a minimal EIP-1193 provider backed by a real private key.
 * The existing wagmi `injected()` connector picks it up as "MetaMask",
 * enabling full EIP-712 signing without a browser wallet.
 *
 * SECURITY: This module is excluded from production builds via the
 * NODE_ENV check. Never set NEXT_PUBLIC_DEV_WALLET_PK in production.
 */

import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

const DEV_PK = process.env.NEXT_PUBLIC_DEV_WALLET_PK as Hex | undefined;

export const isDevWalletEnabled =
  process.env.NODE_ENV === "development" && !!DEV_PK;

/**
 * Inject the dev wallet as window.ethereum before wagmi initializes.
 * Call this in a top-level client component (e.g., Providers) before
 * WagmiProvider mounts.
 */
export function injectDevWallet(): void {
  if (!isDevWalletEnabled || !DEV_PK) return;
  if (typeof window === "undefined") return;
  if ((window as any).__devWalletInjected) return;

  const account = privateKeyToAccount(DEV_PK);
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");
  const chainIdHex = `0x${chainId.toString(16)}` as Hex;

  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  const emit = (event: string, ...args: unknown[]) => {
    listeners.get(event)?.forEach((fn) => fn(...args));
  };

  const provider = {
    isMetaMask: true,
    isDevWallet: true,

    async request({
      method,
      params,
    }: {
      method: string;
      params?: unknown[];
    }): Promise<unknown> {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [account.address];

        case "eth_chainId":
          return chainIdHex;

        case "net_version":
          return String(chainId);

        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain":
          return null;

        case "eth_requestPermissions":
          return [{ parentCapability: "eth_accounts" }];

        case "personal_sign": {
          const [message] = params as [Hex, string];
          return account.signMessage({ message: { raw: message } });
        }

        case "eth_signTypedData_v4": {
          const [, dataStr] = params as [string, string];
          const typedData = JSON.parse(dataStr);
          const { domain, types, message, primaryType } = typedData;

          // Remove EIP712Domain — viem handles it internally
          const sigTypes = { ...types };
          delete sigTypes.EIP712Domain;

          return account.signTypedData({
            domain,
            types: sigTypes,
            primaryType,
            message,
          });
        }

        case "eth_sendTransaction":
          throw new Error(
            "Dev wallet does not support eth_sendTransaction. Use wagmi useWriteContract for on-chain calls."
          );

        default:
          return null;
      }
    },

    on(event: string, handler: (...args: unknown[]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    },

    removeListener(event: string, handler: (...args: unknown[]) => void) {
      listeners.get(event)?.delete(handler);
    },

    removeAllListeners() {
      listeners.clear();
    },

    emit,

    isConnected() {
      return true;
    },
  };

  Object.defineProperty(window, "ethereum", {
    configurable: true,
    value: provider,
  });

  (window as any).__devWalletInjected = true;

  // eslint-disable-next-line no-console
  console.log(
    `[Dev Wallet] Injected with address ${account.address} on chain ${chainId}`
  );
}
