import { formatUnits } from "viem";

export const OMEGA_ZONE_FEE_DECIMALS = 6;
export const TEMPO_L1_GAS_PRICE_DECIMALS = 18;
export const TEMPO_GAS_ESTIMATE_BUFFER_BPS = BigInt(3_000);
export const TEMPO_GAS_ESTIMATE_FIXED_BUFFER = BigInt(50_000);

export function bufferTempoGasEstimate(estimatedGas: bigint): bigint {
  return (
    estimatedGas +
    (estimatedGas * TEMPO_GAS_ESTIMATE_BUFFER_BPS) / BigInt(10_000) +
    TEMPO_GAS_ESTIMATE_FIXED_BUFFER
  );
}

export function formatNetworkFeeUsd(
  value: bigint,
  decimals = OMEGA_ZONE_FEE_DECIMALS,
): string {
  const amount = Number(formatUnits(value, decimals));
  if (!Number.isFinite(amount)) return "—";
  const displayDecimals = amount >= 1 ? 2 : amount >= 0.01 ? 4 : 6;
  return `$${amount.toFixed(displayDecimals)}`;
}
