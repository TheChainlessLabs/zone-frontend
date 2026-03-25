import { createConfig, http } from "wagmi";
import { mainnet, type Chain } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const anvil: Chain = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
};

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");
const chain = chainId === 1 ? mainnet : anvil;

export const config = createConfig({
  chains: [chain],
  connectors: [
    injected(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "" }),
    coinbaseWallet({ appName: "Omega Markets" }),
  ],
  transports: {
    [chain.id]: http(),
  },
});
