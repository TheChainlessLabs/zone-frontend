import { formatUnits, type Address, type Hex } from "viem";

import {
  OMEGA_ZONE_ADDRESSES,
  type ZoneBatchStatus,
  type ZoneBatchSummary,
} from "@/lib/zone";

export type BatchRecordStatus = Extract<
  ZoneBatchStatus,
  "pending" | "submitted" | "verified" | "failed"
>;

export interface BatchVolume {
  token: Address;
  amount: bigint;
}

export interface BatchRecord {
  number: bigint;
  zoneBlockFrom?: bigint;
  zoneBlockTo?: bigint;
  tempoBlockNumber: bigint;
  root?: Hex;
  prevBlockHash: Hex;
  nextBlockHash: Hex;
  status: BatchRecordStatus;
  sealedAt?: string;
  settledAt?: string;
  orderCount: bigint;
  fillCount: bigint;
  pairs: readonly string[];
  volumes: readonly BatchVolume[];
  settlementTx?: Hex;
  proofRef?: string;
}

const ZERO_HASH = `0x${"00".repeat(32)}`;
const TOKEN_METADATA = new Map<string, { symbol: string; decimals: number }>([
  [OMEGA_ZONE_ADDRESSES.pathUsd.toLowerCase(), { symbol: "PATH.USD", decimals: 6 }],
  [OMEGA_ZONE_ADDRESSES.alphaUsd.toLowerCase(), { symbol: "ALPHAUSD", decimals: 6 }],
]);

export function zoneBatchToRecord(batch: ZoneBatchSummary): BatchRecord {
  const status = parseStatus(batch.status);
  const root = parseHash(batch.root, "root");

  return {
    number: parseQuantity(batch.batchNumber, "batchNumber"),
    zoneBlockFrom: parseOptionalQuantity(batch.zoneBlockFrom, "zoneBlockFrom"),
    zoneBlockTo: parseOptionalQuantity(batch.zoneBlockTo, "zoneBlockTo"),
    tempoBlockNumber: parseQuantity(
      batch.tempoBlockNumber,
      "tempoBlockNumber",
    ),
    root: status === "pending" && root.toLowerCase() === ZERO_HASH ? undefined : root,
    prevBlockHash: parseHash(batch.prevBlockHash, "prevBlockHash"),
    nextBlockHash: parseHash(batch.nextBlockHash, "nextBlockHash"),
    status,
    sealedAt: timestampToIso(batch.sealedAt, "sealedAt"),
    settledAt: timestampToIso(batch.settledAt, "settledAt"),
    orderCount: parseQuantity(batch.orderCount, "orderCount"),
    fillCount: parseQuantity(batch.fillCount, "fillCount"),
    pairs: Array.isArray(batch.aggregatePairs)
      ? batch.aggregatePairs.map(formatPairLabel)
      : [],
    volumes: parseVolumes(batch.aggregateVolume),
    settlementTx: parseOptionalHash(
      batch.settlementTxHash,
      "settlementTxHash",
    ),
    proofRef:
      typeof batch.proofRef === "string" && batch.proofRef.length > 0
        ? batch.proofRef
        : undefined,
  };
}

export function formatBatchNumber(value: bigint): string {
  return `#${value.toLocaleString("en-US")}`;
}

export function formatBlockRange(batch: BatchRecord): string {
  if (batch.zoneBlockFrom == null || batch.zoneBlockTo == null) return "Unavailable";
  return `${batch.zoneBlockFrom.toLocaleString("en-US")}–${batch.zoneBlockTo.toLocaleString("en-US")}`;
}

export function formatBatchVolume(volume: BatchVolume): string {
  const metadata = TOKEN_METADATA.get(volume.token.toLowerCase());
  if (!metadata) {
    return `${volume.amount.toLocaleString("en-US")} ${shortAddress(volume.token)}`;
  }
  return `${formatDecimal(formatUnits(volume.amount, metadata.decimals))} ${metadata.symbol}`;
}

export function formatBatchVolumes(volumes: readonly BatchVolume[]): string {
  if (volumes.length === 0) return "Unavailable";
  return volumes.map(formatBatchVolume).join(" · ");
}

export function averageSettlementInterval(
  batches: readonly BatchRecord[],
): number | undefined {
  const timestamps = batches
    .map((batch) => batch.settledAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => Date.parse(value))
    .filter(Number.isFinite)
    .sort((a, b) => b - a);
  if (timestamps.length < 2) return undefined;

  let totalSeconds = 0;
  let intervals = 0;
  for (let index = 1; index < timestamps.length; index += 1) {
    const seconds = Math.round((timestamps[index - 1] - timestamps[index]) / 1000);
    if (seconds <= 0) continue;
    totalSeconds += seconds;
    intervals += 1;
  }
  return intervals > 0 ? Math.round(totalSeconds / intervals) : undefined;
}

export function formatDuration(seconds: number | undefined): string {
  if (seconds == null) return "Unavailable";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

function parseStatus(status: ZoneBatchStatus): BatchRecordStatus {
  if (
    status === "pending" ||
    status === "submitted" ||
    status === "verified" ||
    status === "failed"
  ) {
    return status;
  }
  throw new Error(`Unsupported zone batch status: ${status}`);
}

function parseVolumes(value: ZoneBatchSummary["aggregateVolume"]): BatchVolume[] {
  if (!Array.isArray(value)) {
    throw new Error("Invalid zone batch aggregateVolume: expected an array.");
  }
  return value.map((entry, index) => ({
    token: parseAddress(entry.token, `aggregateVolume[${index}].token`),
    amount: parseQuantity(entry.amount, `aggregateVolume[${index}].amount`),
  }));
}

function formatPairLabel(value: string): string {
  const [base, quote, ...rest] = value.split("/");
  if (!base || !quote || rest.length > 0) return value;
  return `${tokenLabel(base)}/${tokenLabel(quote)}`;
}

function tokenLabel(value: string): string {
  return TOKEN_METADATA.get(value.toLowerCase())?.symbol ?? value;
}

function timestampToIso(value: unknown, field: string): string | undefined {
  if (value == null) return undefined;
  const seconds = parseQuantity(value, field);
  if (seconds === BigInt(0)) return undefined;
  const milliseconds = Number(seconds) * 1000;
  if (!Number.isSafeInteger(milliseconds)) {
    throw new Error(`Invalid zone batch ${field}: timestamp is out of range.`);
  }
  return new Date(milliseconds).toISOString();
}

function parseOptionalQuantity(value: unknown, field: string): bigint | undefined {
  return value == null ? undefined : parseQuantity(value, field);
}

function parseQuantity(value: unknown, field: string): bigint {
  try {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
      return BigInt(value);
    }
    if (typeof value === "string" && /^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(value)) {
      return BigInt(value);
    }
  } catch {
    // Fall through to the field-specific error below.
  }
  throw new Error(`Invalid zone batch ${field}: expected an unsigned quantity.`);
}

function parseOptionalHash(value: unknown, field: string): Hex | undefined {
  return value == null ? undefined : parseHash(value, field);
}

function parseHash(value: unknown, field: string): Hex {
  if (typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value)) {
    return value as Hex;
  }
  throw new Error(`Invalid zone batch ${field}: expected a 32-byte hash.`);
}

function parseAddress(value: unknown, field: string): Address {
  if (typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value)) {
    return value as Address;
  }
  throw new Error(`Invalid zone batch ${field}: expected an address.`);
}

function shortAddress(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatDecimal(value: string): string {
  const [whole, fraction] = value.split(".");
  const grouped = BigInt(whole).toLocaleString("en-US");
  if (!fraction) return grouped;
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}
