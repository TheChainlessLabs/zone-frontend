export interface TokenMeta {
  symbol: string;
  decimals: number;
  color: string;
}

export const TOKEN_MAP: Record<number, TokenMeta> = {
  1: { symbol: "USDC", decimals: 6, color: "#2775CA" },
  2: { symbol: "USDT", decimals: 6, color: "#26A17B" },
  3: { symbol: "EURC", decimals: 6, color: "#1434CB" },
};

export function getTokenMeta(tokenId: number): TokenMeta {
  return TOKEN_MAP[tokenId] ?? { symbol: `Token ${tokenId}`, decimals: 18, color: "#888" };
}

export function formatTokenAmount(raw: string, decimals: number): number {
  return Number(BigInt(raw)) / 10 ** decimals;
}

/** Reverse lookup: find token ID by symbol. Returns undefined if not found. */
export function getTokenIdBySymbol(symbol: string): number | undefined {
  for (const [id, meta] of Object.entries(TOKEN_MAP)) {
    if (meta.symbol === symbol) return Number(id);
  }
  return undefined;
}
