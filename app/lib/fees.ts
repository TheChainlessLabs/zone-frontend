export const FEE_SCHEDULE = {
  makerFeeRate: 0, // 0% maker fee (rebate)
  takerFeeRate: 0.00005, // 0.005% taker fee
  minFee: 0,
} as const;

export function calculateFee(
  amount: number,
  isMaker: boolean = false,
): number {
  const rate = isMaker
    ? FEE_SCHEDULE.makerFeeRate
    : FEE_SCHEDULE.takerFeeRate;
  return Math.max(amount * rate, FEE_SCHEDULE.minFee);
}

export function formatFeePercent(isMaker: boolean = false): string {
  const rate = isMaker
    ? FEE_SCHEDULE.makerFeeRate
    : FEE_SCHEDULE.takerFeeRate;
  if (rate === 0) return "No fee";
  return `${(rate * 100).toFixed(3)}%`;
}

/**
 * Calculate savings in pips comparing the Omega midpoint rate
 * against a venue rate (e.g. Wise). A positive result means Omega
 * is cheaper for the trader.
 *
 * 1 pip = 0.0001 for most FX pairs.
 */
export function calculateSavingsPips(
  midpointRate: number,
  venueRate: number,
): number | null {
  if (!midpointRate || !venueRate) return null;
  // Savings = how many pips closer to mid the Omega rate is vs venue
  // For a buy: lower venue rate is worse (you get less), so savings = (venueRate spread from mid)
  // We use absolute distance: venue is always wider than midpoint
  const diffPips = Math.abs(venueRate - midpointRate) / 0.0001;
  return Math.round(diffPips * 10) / 10; // round to 1 decimal
}
