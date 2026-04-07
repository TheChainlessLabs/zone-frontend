import { getAddress } from "viem";

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
if (!apiUrl) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_API_URL");
}

const bridgeAddress = process.env.NEXT_PUBLIC_BRIDGE_ADDRESS?.trim();
if (!bridgeAddress) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_BRIDGE_ADDRESS"
  );
}

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");

export const config = {
  apiBaseUrl: normalizeApiBaseUrl(apiUrl),
  chainId,
  bridgeAddress,
  usdcAddress:
    process.env.NEXT_PUBLIC_USDC_ADDRESS ??
    "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
  usdtAddress:
    process.env.NEXT_PUBLIC_USDT_ADDRESS ??
    "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
  eip712Domain: {
    name: "Omega" as const,
    version: "1" as const,
    chainId,
    verifyingContract: getAddress(bridgeAddress),
  },
} as const;
