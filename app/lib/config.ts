function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");
const bridgeAddress =
  process.env.NEXT_PUBLIC_BRIDGE_ADDRESS ??
  "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

export const config = {
  apiBaseUrl: normalizeApiBaseUrl(requireEnv("NEXT_PUBLIC_API_URL")),
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
    verifyingContract: bridgeAddress as `0x${string}`,
  },
} as const;
