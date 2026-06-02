import type { Address, Hex } from "viem";

export interface TempoWalletAdapter {
  connect(): Promise<void>;
  getAccount(): Promise<Address | undefined>;
  getChainId(): Promise<number | undefined>;
  switchChain(chainId: number): Promise<void>;
  addChain?(chain: TempoWalletChain): Promise<void>;
  signMessage(parameters: TempoSignMessageParameters): Promise<Hex>;
  signDigest(parameters: TempoSignDigestParameters): Promise<Hex>;
  sendTransaction(transaction: unknown): Promise<Hex>;
  signTransaction?(transaction: unknown): Promise<Hex>;
  onAccountChange(listener: (account: Address | undefined) => void): () => void;
  onNetworkChange(listener: (chainId: number | undefined) => void): () => void;
}

export interface TempoWalletChain {
  id: number;
  name: string;
  rpcUrls: readonly string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TempoSignMessageParameters {
  account: Address;
  message: string | { raw: Hex };
}

export interface TempoSignDigestParameters {
  account: Address;
  digest: Hex;
}

export interface TempoWalletAdapterDependencies {
  connect: () => Promise<unknown>;
  getAccount: () => Address | undefined | Promise<Address | undefined>;
  getChainId: () => number | undefined | Promise<number | undefined>;
  switchChain: (chainId: number) => Promise<unknown>;
  addChain?: (chain: TempoWalletChain) => Promise<unknown>;
  signMessage: (parameters: TempoSignMessageParameters) => Promise<Hex>;
  sendTransaction: (transaction: unknown) => Promise<Hex>;
  signTransaction?: (transaction: unknown) => Promise<Hex>;
  onAccountChange?: (listener: (account: Address | undefined) => void) => () => void;
  onNetworkChange?: (listener: (chainId: number | undefined) => void) => () => void;
}

export function createTempoWalletAdapter({
  connect,
  getAccount,
  getChainId,
  switchChain,
  addChain,
  signMessage,
  sendTransaction,
  signTransaction,
  onAccountChange,
  onNetworkChange,
}: TempoWalletAdapterDependencies): TempoWalletAdapter {
  return {
    async connect() {
      await connect();
    },
    async getAccount() {
      return getAccount();
    },
    async getChainId() {
      return getChainId();
    },
    async switchChain(chainId) {
      await switchChain(chainId);
    },
    addChain: addChain
      ? async (chain) => {
          await addChain(chain);
        }
      : undefined,
    signMessage,
    signDigest({ account, digest }) {
      return signMessage({ account, message: { raw: digest } });
    },
    sendTransaction,
    signTransaction,
    onAccountChange(listener) {
      return onAccountChange?.(listener) ?? noop;
    },
    onNetworkChange(listener) {
      return onNetworkChange?.(listener) ?? noop;
    },
  };
}

function noop() {}
