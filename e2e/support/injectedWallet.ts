import type { Page } from "@playwright/test";

export const TEST_ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678";
export const ANVIL_CHAIN_ID = "0x7a69";
export const MAINNET_CHAIN_ID = "0x1";

interface InjectedWalletOptions {
  account?: string;
  chainId?: `0x${string}`;
  connected?: boolean;
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function injectMockWallet(
  page: Page,
  {
    account = TEST_ACCOUNT,
    chainId = ANVIL_CHAIN_ID,
    connected = false,
  }: InjectedWalletOptions = {}
) {
  await page.addInitScript(
    ({ account: initialAccount, chainId: initialChainId, connected: initiallyConnected }) => {
      const connectedKey = "omega:e2e:wallet-connected";
      const chainKey = "omega:e2e:wallet-chain-id";
      const accountKey = "omega:e2e:wallet-account";
      const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

      const emit = (event: string, payload: unknown) => {
        const handlers = listeners.get(event);
        if (!handlers) return;
        handlers.forEach((handler) => handler(payload));
      };

      if (!window.localStorage.getItem(accountKey)) {
        window.localStorage.setItem(accountKey, initialAccount);
      }
      if (!window.localStorage.getItem(chainKey)) {
        window.localStorage.setItem(chainKey, initialChainId);
      }
      if (!window.localStorage.getItem(connectedKey)) {
        window.localStorage.setItem(connectedKey, initiallyConnected ? "true" : "false");
      }

      const getAccount = () => window.localStorage.getItem(accountKey) ?? initialAccount;
      const getChainId = () => window.localStorage.getItem(chainKey) ?? initialChainId;
      const isConnected = () => window.localStorage.getItem(connectedKey) === "true";

      const provider = {
        isMetaMask: true,
        async request({
          method,
          params,
        }: {
          method: string;
          params?: Array<Record<string, string>>;
        }) {
          switch (method) {
            case "eth_requestAccounts": {
              window.localStorage.setItem(connectedKey, "true");
              const account = getAccount();
              emit("accountsChanged", [account]);
              return [account];
            }
            case "eth_accounts":
              return isConnected() ? [getAccount()] : [];
            case "eth_chainId":
              return getChainId();
            case "net_version":
              return parseInt(getChainId(), 16).toString();
            case "wallet_switchEthereumChain": {
              const nextChainId = params?.[0]?.chainId ?? initialChainId;
              window.localStorage.setItem(chainKey, nextChainId);
              emit("chainChanged", nextChainId);
              return null;
            }
            case "wallet_addEthereumChain": {
              const nextChainId = params?.[0]?.chainId ?? initialChainId;
              window.localStorage.setItem(chainKey, nextChainId);
              emit("chainChanged", nextChainId);
              return null;
            }
            case "eth_requestPermissions":
              return [{ parentCapability: "eth_accounts" }];
            default:
              return null;
          }
        },
        on(event: string, handler: (...args: unknown[]) => void) {
          if (!listeners.has(event)) listeners.set(event, new Set());
          listeners.get(event)?.add(handler);
        },
        removeListener(event: string, handler: (...args: unknown[]) => void) {
          listeners.get(event)?.delete(handler);
        },
        isConnected,
      };

      Object.defineProperty(window, "ethereum", {
        configurable: true,
        value: provider,
      });
    },
    { account, chainId, connected }
  );
}
