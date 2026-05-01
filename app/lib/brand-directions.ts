export const BRAND_DIRECTIONS = [
  { id: 1, name: "Proofline Blue" },
  { id: 2, name: "Alloy Signal" },
  { id: 3, name: "Acid Witness" },
  { id: 4, name: "Offset Ledger" },
] as const;

export type BrandDirection = 0 | 1 | 2 | 3 | 4;

export function getBrandDirection(value?: string | null): BrandDirection {
  const dir = Number(value);
  return Number.isInteger(dir) && dir >= 1 && dir <= 4 ? (dir as BrandDirection) : 0;
}
