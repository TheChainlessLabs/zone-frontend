const PRICE_DECIMALS = 18;
const SPLIT_DECIMALS = 10;

export function encodePrice(price: number, decimals: number = PRICE_DECIMALS): string {
  if (decimals <= SPLIT_DECIMALS) {
    return BigInt(Math.round(price * 10 ** decimals)).toString();
  }
  // Split multiply to avoid floating-point precision loss at high decimal counts
  const upper = BigInt(Math.round(price * 10 ** SPLIT_DECIMALS));
  const lower = BigInt(10 ** (decimals - SPLIT_DECIMALS));
  return (upper * lower).toString();
}

export function decodePrice(encoded: string | number, decimals: number = PRICE_DECIMALS): number {
  return Number(BigInt(encoded)) / 10 ** decimals;
}

export function encodeQuantity(qty: number, tokenDecimals: number): string {
  return BigInt(Math.round(qty * 10 ** tokenDecimals)).toString();
}

export function decodeQuantity(encoded: string | number, tokenDecimals: number): number {
  return Number(BigInt(encoded)) / 10 ** tokenDecimals;
}
