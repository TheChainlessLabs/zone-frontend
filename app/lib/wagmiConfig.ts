import {
  createConfig,
  createStorage,
  cookieStorage,
  http,
  injected,
} from "wagmi";
import { mainnet, type Chain } from "wagmi/chains";

const anvil: Chain = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
};

export const supportedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");
export const supportedChain = supportedChainId === 1 ? mainnet : anvil;

export const config = createConfig({
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  chains: [supportedChain],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [supportedChain.id]: http(),
  },
});
