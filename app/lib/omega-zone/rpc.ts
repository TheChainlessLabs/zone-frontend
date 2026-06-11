import {
  createPublicClient,
  custom,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  numberToHex,
  toFunctionSelector,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { Account as TempoAccount, Transaction as TempoTransaction } from "viem/tempo";

import {
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  OMEGA_ZONE_RPC_PROXY_URLS,
  OMEGA_ZONE_RPC_URLS,
  omegaZoneChain,
  tempoL1Chain,
  zonePrivateRpcUrl,
  zonePublicRpcUrl,
} from "./config";
import {
  DARKPOOL_PARSED_ABI,
  TIP20_PARSED_ABI,
} from "./abi";

/**
 * Thrown when a zone RPC proxy returns a non-2xx HTTP status. Carries the status
 * so callers can distinguish auth failures (401/403 → re-mint the auth token and
 * retry) from other transport errors. See {@link isZoneAuthError}.
 */
export class ZoneRpcHttpError extends Error {
  readonly status: number;
  constructor(status: number, scope: "private" | "public" = "private") {
    super(`${scope === "public" ? "Public" : "Private"} zone RPC failed with HTTP ${status}.`);
    this.name = "ZoneRpcHttpError";
    this.status = status;
  }
}

/**
 * True when `error` is an auth failure (HTTP 401/403) from the private zone RPC —
 * i.e. the wallet-signed auth token was missing/expired/rejected. Callers re-mint
 * a fresh token and retry once.
 */
export function isZoneAuthError(error: unknown): boolean {
  if (error instanceof ZoneRpcHttpError) {
    return error.status === 401 || error.status === 403;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /HTTP 40[13]\b/.test(message) || /unauthorized|forbidden/i.test(message);
}

export interface ZoneRpcRequest {
  method: string;
  params?: readonly unknown[];
  id?: number | string;
}

export interface ZoneRpcFetchOptions {
  rpcUrl?: string;
}

export interface AuthorizationTokenInfoResponse {
  account: Address;
  expiresAt: Hex;
}

export interface ZoneInfoResponse {
  zoneId: Hex;
  zoneTokens: Address[];
  chainId: Hex;
}

export interface DepositStatusEntry {
  depositHash: Hex;
  kind: "regular" | "encrypted";
  token: Address;
  sender: Address;
  recipient: Address | null;
  amount: Hex;
  memo: Hex | null;
  status: "pending" | "processed" | "failed";
}

export interface DepositStatusResponse {
  tempoBlockNumber: Hex;
  zoneProcessedThrough: Hex;
  processed: boolean;
  deposits: DepositStatusEntry[];
}

export type RpcQuantity = Hex;

export const publicZoneClient = createPublicClient({
  chain: omegaZoneChain,
  transport: http(omegaZoneChain.rpcUrls.default.http[0]),
});

/**
 * Wait for a zone transaction receipt by polling `eth_getTransactionReceipt`.
 *
 * viem's `waitForTransactionReceipt` watches the chain via
 * `eth_getBlockByNumber(_, /* includeTransactions *​/ true)`, which the privacy
 * zone restricts to the sequencer ("Sequencer only / request exceeds defined
 * limit") — so it throws on the public RPC even after the tx has landed.
 * Receipts themselves are public, so we poll for the receipt directly instead
 * of watching full blocks.
 */
export async function waitForZoneTransactionReceipt(
  hash: Hex,
  {
    timeoutMs = 30_000,
    intervalMs = 1_000,
  }: { timeoutMs?: number; intervalMs?: number } = {},
) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      return await publicZoneClient.getTransactionReceipt({ hash });
    } catch (error) {
      if (Date.now() >= deadline) {
        throw new Error(
          `Timed out waiting for the Omega Zone transaction receipt (${hash}).`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
}

export const serverPublicZoneClient = createPublicClient({
  chain: omegaZoneChain,
  transport: http(OMEGA_ZONE_RPC_URLS.publicServer),
});

export const tempoL1Client = createPublicClient({
  chain: tempoL1Chain,
  transport: http(tempoL1Chain.rpcUrls.default.http[0]),
});

export function toRpcQuantity(value: number | bigint | Hex): RpcQuantity {
  return typeof value === "string" ? value : numberToHex(value);
}

export async function privateRpcFetch<T>(
  authToken: Hex,
  { method, params = [], id = 1 }: ZoneRpcRequest,
  { rpcUrl = zonePrivateRpcUrl() }: ZoneRpcFetchOptions = {},
): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-authorization-token": authToken,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new ZoneRpcHttpError(response.status, "private");
  }

  const payload = (await response.json()) as {
    result?: T;
    error?: { message?: string; code?: number };
  };
  if (payload.error) {
    throw new Error(
      payload.error.message ??
        `Private zone RPC failed with code ${payload.error.code ?? "unknown"}.`,
    );
  }
  return payload.result as T;
}

export const callPrivateZoneRpc = privateRpcFetch;

export function createPrivateZoneClient(authToken: Hex, rpcUrl?: string) {
  return createPublicClient({
    chain: omegaZoneChain,
    transport: custom({
      async request({ method, params }) {
        return privateRpcFetch(authToken, {
          method,
          params: Array.isArray(params) ? params : [],
        }, rpcUrl ? { rpcUrl } : undefined);
      },
    }),
  });
}

export async function getZoneAuthorizationTokenInfo(
  authToken: Hex,
  options?: ZoneRpcFetchOptions,
) {
  return privateRpcFetch<AuthorizationTokenInfoResponse>(
    authToken,
    {
      method: "zone_getAuthorizationTokenInfo",
      params: [],
    },
    options,
  );
}

export async function getZoneInfo(
  authToken: Hex,
  options?: ZoneRpcFetchOptions,
) {
  return privateRpcFetch<ZoneInfoResponse>(
    authToken,
    {
      method: "zone_getZoneInfo",
      params: [],
    },
    options,
  );
}

export async function getZoneDepositStatus(
  authToken: Hex,
  tempoBlockNumber: number | bigint | Hex,
  options?: ZoneRpcFetchOptions,
) {
  return privateRpcFetch<DepositStatusResponse>(
    authToken,
    {
      method: "zone_getDepositStatus",
      params: [toRpcQuantity(tempoBlockNumber)],
    },
    options,
  );
}

export interface PrivateZoneCall {
  from: Address;
  to: Address;
  data: Hex;
  blockTag?: "latest" | "earliest" | "pending" | RpcQuantity;
}

export async function privateZoneEthCall(
  authToken: Hex,
  { from, to, data, blockTag = "latest" }: PrivateZoneCall,
  options?: ZoneRpcFetchOptions,
): Promise<Hex> {
  return privateRpcFetch<Hex>(
    authToken,
    {
      method: "eth_call",
      params: [
        {
          from,
          to,
          data,
        },
        blockTag,
      ],
    },
    options,
  );
}

export interface PrivateZoneTransactionRequest {
  from: Address;
  to: Address;
  data: Hex;
  value?: bigint;
}

export interface ZoneContractWriteRequest {
  address: Address;
  abi: Abi | readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
}

export interface ZoneTransactionSigner {
  request(args: {
    method: string;
    params?: readonly unknown[];
  }, options?: unknown): Promise<unknown>;
  store?: {
    getState?: () => {
      accessKeys?: readonly StoredTempoAccessKey[];
    };
    setState?: (state: {
      accessKeys?: readonly StoredTempoAccessKey[];
    }) => void;
  };
  getZoneTransactionDefaults?(account: Address): Promise<{
    chainId: number;
    nonce: number;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }>;
  signTempoTransaction?(parameters: TempoAccessKeyTransaction): Promise<Hex>;
}

type TempoP256KeyPair = Parameters<typeof TempoAccount.fromWebCryptoP256>[0];

interface StoredAccessKeyScope {
  address: Address;
  selector?: Hex | string;
}

interface StoredAccessKeyLimit {
  token: Address;
  limit?: bigint | number | string;
  amount?: bigint | number | string;
}

interface StoredTempoAccessKey {
  access: Address;
  address?: Address;
  keyPair?: TempoP256KeyPair;
  keyAuthorization?: unknown;
  expiry?: number;
  limits?: readonly StoredAccessKeyLimit[];
  scopes?: readonly StoredAccessKeyScope[];
}

interface TempoAccessKeyTransaction {
  account: Address;
  to: Address;
  data: Hex;
  gas: bigint;
  chainId: number;
  nonce: number;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  keyAuthorization?: unknown;
}

const DARKPOOL_ACCESS_KEY_TTL_SECONDS = 24 * 60 * 60;
const ACCESS_KEY_REFRESH_BUFFER_SECONDS = 60;
const ACCESS_KEY_AUTHORIZATION_GAS_OVERHEAD = BigInt(16_000_000);
const UINT128_MAX = (BigInt(1) << BigInt(128)) - BigInt(1);
const GAS_ESTIMATE_BUFFER_BPS = BigInt(2_000);
const GAS_ESTIMATE_FIXED_BUFFER = BigInt(50_000);
const DARKPOOL_ACCESS_KEY_SCOPES = [
  {
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    selector: toFunctionSelector("deposit(address,uint128)"),
  },
  {
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    selector: toFunctionSelector("withdraw(address,uint128)"),
  },
  {
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    selector: toFunctionSelector("place(address,uint128,uint128,bool)"),
  },
  {
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    selector: toFunctionSelector("cancel(uint128)"),
  },
  {
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    selector: toFunctionSelector("marketBuy(address,uint128,uint128)"),
  },
  {
    address: OMEGA_ZONE_ADDRESSES.darkpool,
    selector: toFunctionSelector("marketSell(address,uint128,uint128)"),
  },
] as const;
const DARKPOOL_ACCESS_KEY_TOKENS = [
  OMEGA_ZONE_ADDRESSES.pathUsd,
  OMEGA_ZONE_ADDRESSES.oalpha,
] as const;

export async function privateZoneEstimateGas(
  authToken: Hex,
  { from, to, data, value }: PrivateZoneTransactionRequest,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  const result = await privateRpcFetch<Hex>(
    authToken,
    {
      method: "eth_estimateGas",
      params: [
        {
          from,
          to,
          data,
          ...(typeof value === "bigint" ? { value: toRpcQuantity(value) } : {}),
        },
      ],
    },
    options,
  );
  return BigInt(result);
}

export async function privateZoneGasPrice(
  authToken: Hex,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  const result = await privateRpcFetch<Hex>(
    authToken,
    {
      method: "eth_gasPrice",
      params: [],
    },
    options,
  );
  return BigInt(result);
}

export async function privateZoneTransactionCount(
  authToken: Hex,
  account: Address,
  blockTag: "latest" | "pending" = "pending",
  options?: ZoneRpcFetchOptions,
): Promise<number> {
  const result = await privateRpcFetch<Hex>(
    authToken,
    {
      method: "eth_getTransactionCount",
      params: [account, blockTag],
    },
    options,
  );
  return Number(BigInt(result));
}

export async function sendPrivateZoneRawTransaction(
  authToken: Hex,
  serializedTransaction: Hex,
  options?: ZoneRpcFetchOptions,
): Promise<Hex> {
  return privateRpcFetch<Hex>(
    authToken,
    {
      method: "eth_sendRawTransaction",
      params: [serializedTransaction],
    },
    options,
  );
}

async function getZoneTransactionDefaults(account: Address) {
  const [nonce, fees] = await Promise.all([
    publicZoneClient.getTransactionCount({
      address: account,
      blockTag: "pending",
    }),
    publicZoneClient.estimateFeesPerGas(),
  ]);

  if (
    !("maxFeePerGas" in fees) ||
    fees.maxFeePerGas == null ||
    !("maxPriorityFeePerGas" in fees) ||
    fees.maxPriorityFeePerGas == null
  ) {
    throw new Error("Omega Zone EIP-1559 fee data is unavailable.");
  }

  return {
    chainId: OMEGA_ZONE_CHAIN_ID,
    nonce,
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  };
}

function accessKeyRequest() {
  return {
    chainId: BigInt(OMEGA_ZONE_CHAIN_ID),
    expiry: Math.floor(Date.now() / 1000) + DARKPOOL_ACCESS_KEY_TTL_SECONDS,
    limits: DARKPOOL_ACCESS_KEY_TOKENS.map((token) => ({
      token,
      limit: UINT128_MAX,
    })),
    scopes: DARKPOOL_ACCESS_KEY_SCOPES,
  };
}

function getAccessKeys(signer: ZoneTransactionSigner) {
  return signer.store?.getState?.().accessKeys ?? [];
}

function setAccessKeys(
  signer: ZoneTransactionSigner,
  accessKeys: readonly StoredTempoAccessKey[],
) {
  signer.store?.setState?.({ accessKeys });
}

function accessKeyLimitAmount(limit: StoredAccessKeyLimit) {
  const value = limit.limit ?? limit.amount;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return null;
}

function scopesCoverDarkpool(scopes: readonly StoredAccessKeyScope[] | undefined) {
  if (!scopes) return false;
  return DARKPOOL_ACCESS_KEY_SCOPES.every((required) =>
    scopes.some((scope) => {
      const sameAddress =
        scope.address.toLowerCase() === required.address.toLowerCase();
      const sameSelector =
        !scope.selector ||
        scope.selector.toLowerCase() === required.selector.toLowerCase();
      return sameAddress && sameSelector;
    }),
  );
}

function limitsCoverDarkpool(limits: readonly StoredAccessKeyLimit[] | undefined) {
  if (!limits) return false;
  return DARKPOOL_ACCESS_KEY_TOKENS.every((token) =>
    limits.some((limit) => {
      const amount = accessKeyLimitAmount(limit);
      return (
        limit.token.toLowerCase() === token.toLowerCase() &&
        amount === UINT128_MAX
      );
    }),
  );
}

function keyAuthorizationChainId(keyAuthorization: unknown) {
  if (!keyAuthorization || typeof keyAuthorization !== "object") return null;
  const value = (keyAuthorization as { chainId?: unknown }).chainId;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return null;
}

function findDarkpoolAccessKey(
  signer: ZoneTransactionSigner,
  account: Address,
) {
  const now = Math.floor(Date.now() / 1000);
  return getAccessKeys(signer).find((key) => {
    const hasLocalKey = key.keyPair != null;
    const sameOwner = key.access.toLowerCase() === account.toLowerCase();
    const notExpiring =
      !key.expiry || key.expiry > now + ACCESS_KEY_REFRESH_BUFFER_SECONDS;
    const matchingAuthorization =
      !key.keyAuthorization ||
      keyAuthorizationChainId(key.keyAuthorization) === BigInt(OMEGA_ZONE_CHAIN_ID);
    return (
      hasLocalKey &&
      sameOwner &&
      notExpiring &&
      matchingAuthorization &&
      limitsCoverDarkpool(key.limits) &&
      scopesCoverDarkpool(key.scopes)
    );
  });
}

function clearLocalAccessKeys(
  signer: ZoneTransactionSigner,
  account: Address,
) {
  const accessKeys = getAccessKeys(signer);
  if (!accessKeys.length) return;
  setAccessKeys(
    signer,
    accessKeys.filter((key) => {
      const sameOwner = key.access.toLowerCase() === account.toLowerCase();
      return !(sameOwner && key.keyPair != null);
    }),
  );
}

function markAccessKeyAuthorizationUsed(
  signer: ZoneTransactionSigner,
  accessKey: StoredTempoAccessKey,
) {
  if (!accessKey.address) return;
  const accessKeys = getAccessKeys(signer);
  if (!accessKeys.length) return;
  setAccessKeys(
    signer,
    accessKeys.map((key) =>
      key.address?.toLowerCase() === accessKey.address?.toLowerCase()
        ? { ...key, keyAuthorization: undefined }
        : key,
    ),
  );
}

async function ensureDarkpoolAccessKey(
  signer: ZoneTransactionSigner,
  account: Address,
) {
  const existing = findDarkpoolAccessKey(signer, account);
  if (existing) return existing;

  clearLocalAccessKeys(signer, account);
  await signer.request({
    method: "wallet_authorizeAccessKey",
    params: [accessKeyRequest()],
  });

  const next = findDarkpoolAccessKey(signer, account);
  if (!next) {
    throw new Error("Tempo Wallet did not return a usable Omega Zone access key.");
  }
  return next;
}

async function signTempoAccessKeyTransaction(
  signer: ZoneTransactionSigner,
  accessKey: StoredTempoAccessKey,
  transaction: TempoAccessKeyTransaction,
) {
  if (signer.signTempoTransaction) {
    return signer.signTempoTransaction(transaction);
  }
  if (!accessKey.keyPair) {
    throw new Error("Tempo Wallet access key is missing local signing material.");
  }

  const accessKeyAccount = TempoAccount.fromWebCryptoP256(accessKey.keyPair, {
    access: transaction.account,
    internal_version: "v2",
  });

  return accessKeyAccount.signTransaction(
    {
      type: "tempo",
      chainId: transaction.chainId,
      nonce: transaction.nonce,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      calls: [
        {
          to: transaction.to,
          data: transaction.data,
        },
      ],
      gas: transaction.gas,
      keyAuthorization: transaction.keyAuthorization as never,
    } as never,
    { serializer: TempoTransaction.serialize as never },
  );
}

export async function signAndSendPrivateZoneContractWrite({
  authToken,
  signer,
  account,
  request,
}: {
  authToken: Hex;
  signer: ZoneTransactionSigner;
  account: Address;
  request: ZoneContractWriteRequest;
}): Promise<Hex> {
  const data = encodeFunctionData({
    abi: request.abi as Abi,
    functionName: request.functionName,
    args: request.args as readonly unknown[] | undefined,
  });
  const transaction = {
    from: account,
    to: request.address,
    data,
    value: request.value,
  };
  const estimatedGas = await privateZoneEstimateGas(authToken, transaction);
  const accessKey = await ensureDarkpoolAccessKey(signer, account);
  const defaults = await (
    signer.getZoneTransactionDefaults ?? getZoneTransactionDefaults
  )(account);
  const gas =
    estimatedGas +
    (estimatedGas * GAS_ESTIMATE_BUFFER_BPS) / BigInt(10_000) +
    GAS_ESTIMATE_FIXED_BUFFER +
    (accessKey.keyAuthorization
      ? ACCESS_KEY_AUTHORIZATION_GAS_OVERHEAD
      : BigInt(0));
  const serializedTransaction = await signTempoAccessKeyTransaction(
    signer,
    accessKey,
    {
      account,
      to: request.address,
      data,
      gas,
      ...defaults,
      keyAuthorization: accessKey.keyAuthorization,
    },
  );
  markAccessKeyAuthorizationUsed(signer, accessKey);
  return sendPrivateZoneRawTransaction(authToken, serializedTransaction as Hex);
}

export async function readPrivateZonePathUsdBalance(
  authToken: Hex,
  account: Address,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  return readPrivateZoneTokenBalance(
    authToken,
    account,
    OMEGA_ZONE_ADDRESSES.pathUsd,
    options,
  );
}

export async function readPrivateZoneOalphaBalance(
  authToken: Hex,
  account: Address,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  return readPrivateZoneTokenBalance(
    authToken,
    account,
    OMEGA_ZONE_ADDRESSES.oalpha,
    options,
  );
}

export async function readPrivateZoneTokenBalance(
  authToken: Hex,
  account: Address,
  token: Address,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  const data = encodeFunctionData({
    abi: TIP20_PARSED_ABI,
    functionName: "balanceOf",
    args: [account],
  });
  const result = await privateZoneEthCall(
    authToken,
    {
      from: account,
      to: token,
      data,
    },
    options,
  );
  return decodeFunctionResult({
    abi: TIP20_PARSED_ABI,
    functionName: "balanceOf",
    data: result,
  }) as bigint;
}

export async function readPrivateTokenAllowance(
  authToken: Hex,
  account: Address,
  token: Address,
  spender: Address,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  const data = encodeFunctionData({
    abi: TIP20_PARSED_ABI,
    functionName: "allowance",
    args: [account, spender],
  });
  const result = await privateZoneEthCall(
    authToken,
    {
      from: account,
      to: token,
      data,
    },
    options,
  );
  return decodeFunctionResult({
    abi: TIP20_PARSED_ABI,
    functionName: "allowance",
    data: result,
  }) as bigint;
}

export async function readPrivateDarkpoolBalance(
  authToken: Hex,
  account: Address,
  token: Address = OMEGA_ZONE_ADDRESSES.pathUsd,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  const data = encodeFunctionData({
    abi: DARKPOOL_PARSED_ABI,
    functionName: "balanceOf",
    args: [account, token],
  });
  const result = await privateZoneEthCall(
    authToken,
    {
      from: account,
      to: OMEGA_ZONE_ADDRESSES.darkpool,
      data,
    },
    options,
  );
  return decodeFunctionResult({
    abi: DARKPOOL_PARSED_ABI,
    functionName: "balanceOf",
    data: result,
  }) as bigint;
}

export interface PriceLevel {
  price: bigint;
  quantity: bigint;
}

export async function readPrivateBestBid(
  authToken: Hex,
  account: Address,
  base: Address,
  options?: ZoneRpcFetchOptions,
): Promise<PriceLevel> {
  return readPrivatePriceLevel(authToken, account, base, "bestBid", options);
}

export async function readPrivateBestAsk(
  authToken: Hex,
  account: Address,
  base: Address,
  options?: ZoneRpcFetchOptions,
): Promise<PriceLevel> {
  return readPrivatePriceLevel(authToken, account, base, "bestAsk", options);
}

async function readPrivatePriceLevel(
  authToken: Hex,
  account: Address,
  base: Address,
  functionName: "bestBid" | "bestAsk",
  options?: ZoneRpcFetchOptions,
): Promise<PriceLevel> {
  const data = encodeFunctionData({
    abi: DARKPOOL_PARSED_ABI,
    functionName,
    args: [base],
  });
  const result = await privateZoneEthCall(
    authToken,
    {
      from: account,
      to: OMEGA_ZONE_ADDRESSES.darkpool,
      data,
    },
    options,
  );
  const [price, quantity] = decodeFunctionResult({
    abi: DARKPOOL_PARSED_ABI,
    functionName,
    data: result,
  }) as readonly [bigint, bigint];
  return { price, quantity };
}

export async function publicRpcFetch<T>(
  { method, params = [], id = 1 }: ZoneRpcRequest,
  { rpcUrl = browserPublicRpcUrl() }: ZoneRpcFetchOptions = {},
): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new ZoneRpcHttpError(response.status, "public");
  }

  const payload = (await response.json()) as {
    result?: T;
    error?: { message?: string; code?: number };
  };
  if (payload.error) {
    throw new Error(
      payload.error.message ??
        `Public zone RPC failed with code ${payload.error.code ?? "unknown"}.`,
    );
  }
  return payload.result as T;
}

export const callPublicZoneRpc = publicRpcFetch;

function browserPublicRpcUrl(): string {
  return typeof window === "undefined"
    ? zonePublicRpcUrl()
    : OMEGA_ZONE_RPC_PROXY_URLS.public;
}

export interface MarketToken {
  address: Address;
  symbol: string;
  decimals: number;
}

export interface MarketPair {
  base: Address;
  quote: Address;
}

export type AllowedMarketAction =
  | "marketBuy"
  | "marketSell"
  | "limitBid"
  | "limitAsk";

export interface MarketEntry {
  pair: string;
  base: MarketToken;
  quote: MarketToken;
  minOrderAmount: string;
  priceUnit: string;
  allowedActions: readonly AllowedMarketAction[];
}

export interface MarketConfigResponse {
  darkpool: Address;
  markets: readonly MarketEntry[];
}

export interface OrderLevel {
  price: string;
  quantity: string;
}

export interface TopOfBookResponse {
  pair: string;
  base: Address;
  quote: Address;
  bid: OrderLevel | null;
  ask: OrderLevel | null;
  midpoint: string | null;
  spread: string | null;
  asOfBlock: Hex;
}

export interface ZonePageEnvelope<T> {
  items: readonly T[];
  nextCursor?: string;
}

export type ZoneOrderSide = "bid" | "ask";
export type ZoneOrderStatus =
  | "open"
  | "partiallyFilled"
  | "filled"
  | "cancelled";

export interface ZoneOrder {
  orderId: string;
  side: ZoneOrderSide;
  status: ZoneOrderStatus;
  baseToken: Address;
  quoteToken: Address;
  amount: string;
  remaining: string;
  filled: string;
  price: string;
  createdAtBlock: Hex;
  updatedAtBlock: Hex;
  createdTxHash: Hex;
  cancelTxHash?: Hex;
}

export type ZoneFillRole = "maker" | "taker";

export interface ZoneFill {
  orderId?: string;
  role: ZoneFillRole;
  baseToken: Address;
  quoteToken: Address;
  amountFilled: string;
  price: string;
  blockNumber: Hex;
  txHash: Hex;
}

export type ZoneTransferDirection = "in" | "out";

export interface ZoneTransfer {
  token: Address;
  counterparty: Address;
  amount: string;
  direction: ZoneTransferDirection;
  blockNumber: Hex;
  txHash: Hex;
  logIndex: number;
}

export type ZoneWithdrawalStatusValue =
  | "pending"
  | "batched"
  | "submitted"
  | "processed"
  | "failed"
  | "bounced";

export interface ZoneWithdrawalStatus {
  withdrawalIndex: string;
  zoneTxHash: Hex;
  status: ZoneWithdrawalStatusValue;
  token: Address;
  amount: string;
  to: Address;
  fallbackRecipient: Address;
  memo: Hex;
  zoneBlockNumber: Hex;
  withdrawalBatchIndex?: string;
  portalSlot?: string;
  l1SubmitBatchTxHash?: Hex;
  l1ProcessWithdrawalTxHash?: Hex;
  callbackSuccess?: boolean;
  error?: string;
}

export type ZoneBatchStatus =
  | "pending"
  | "sealed"
  | "submitted"
  | "verified"
  | "settled"
  | "failed";

export interface ZoneBatchSummary {
  batchNumber: string;
  zoneBlockFrom?: Hex;
  zoneBlockTo?: Hex;
  tempoBlockNumber: Hex;
  root: Hex;
  prevBlockHash: Hex;
  nextBlockHash: Hex;
  status: ZoneBatchStatus;
  sealedAt?: string;
  settledAt?: string;
  orderCount: number;
  fillCount: number;
  aggregatePairs: readonly string[];
  aggregateVolume: readonly { token: Address; amount: string }[] | Readonly<Record<string, string>>;
  settlementTxHash?: Hex;
  proofRef?: string;
}

export interface ZoneBatchListResponse {
  batches: readonly ZoneBatchSummary[];
  nextCursor?: string;
}

export interface ZoneMidpointSample {
  timestamp: Hex;
  midpoint: string;
}

export interface ZoneMidpointHistoryResponse {
  pair: string;
  base: Address;
  quote: Address;
  interval: string;
  samples: readonly ZoneMidpointSample[];
  nextCursor?: string;
  history: {
    enabled: boolean;
    reason?: string;
  };
}

export interface ZonePaginationParams {
  cursor?: string;
  limit?: number;
}

export function toBatchNumberHex(batchNumber: number | bigint | Hex): Hex {
  return toRpcQuantity(batchNumber);
}

function assertOwnerScopedAccount({
  authenticatedAccount,
  requestedAccount,
}: {
  authenticatedAccount: Address;
  requestedAccount?: Address;
}): Address {
  if (
    requestedAccount &&
    requestedAccount.toLowerCase() !== authenticatedAccount.toLowerCase()
  ) {
    throw new Error(
      "Omega Zone RPC: requested account does not match the authenticated account.",
    );
  }
  return requestedAccount ?? authenticatedAccount;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) (out as Record<string, unknown>)[key] = entry;
  }
  return out;
}

export async function getZoneMarketConfig(
  authToken: Hex,
  options?: ZoneRpcFetchOptions,
): Promise<MarketConfigResponse> {
  return privateRpcFetch<MarketConfigResponse>(
    authToken,
    {
      method: "zone_getMarketConfig",
      params: [],
    },
    options,
  );
}

export async function getZoneTopOfBook(
  authToken: Hex,
  pair: MarketPair,
  options?: ZoneRpcFetchOptions,
): Promise<TopOfBookResponse> {
  return privateRpcFetch<TopOfBookResponse>(
    authToken,
    {
      method: "zone_getTopOfBook",
      params: [{ base: pair.base, quote: pair.quote }],
    },
    options,
  );
}

/** Public (no-auth) top-of-book. The zone serves zone_getTopOfBook on the
 *  public RPC with an anonymous AuthContext, so the trade surface can show the
 *  live midpoint / best bid+ask without a connected wallet. */
export async function getZonePublicTopOfBook(
  pair: MarketPair,
  options?: ZoneRpcFetchOptions,
): Promise<TopOfBookResponse> {
  return publicRpcFetch<TopOfBookResponse>(
    {
      method: "zone_getTopOfBook",
      params: [{ base: pair.base, quote: pair.quote }],
    },
    options,
  );
}

export interface ZoneMyOrdersParams extends ZonePaginationParams {
  account?: Address;
  pair?: string;
  status?: ZoneOrderStatus;
}

export async function getZoneMyOrders(
  authToken: Hex,
  authenticatedAccount: Address,
  params: ZoneMyOrdersParams = {},
  options?: ZoneRpcFetchOptions,
): Promise<ZonePageEnvelope<ZoneOrder>> {
  const account = assertOwnerScopedAccount({
    authenticatedAccount,
    requestedAccount: params.account,
  });
  return privateRpcFetch<ZonePageEnvelope<ZoneOrder>>(
    authToken,
    {
      method: "zone_getMyOrders",
      params: [
        stripUndefined({
          account,
          pair: params.pair,
          status: params.status,
          cursor: params.cursor,
          limit: params.limit,
        }),
      ],
    },
    options,
  );
}

export interface ZoneMyFillsParams extends ZonePaginationParams {
  account?: Address;
  pair?: string;
  status?: ZoneOrderStatus;
}

export async function getZoneMyFills(
  authToken: Hex,
  authenticatedAccount: Address,
  params: ZoneMyFillsParams = {},
  options?: ZoneRpcFetchOptions,
): Promise<ZonePageEnvelope<ZoneFill>> {
  const account = assertOwnerScopedAccount({
    authenticatedAccount,
    requestedAccount: params.account,
  });
  return privateRpcFetch<ZonePageEnvelope<ZoneFill>>(
    authToken,
    {
      method: "zone_getMyFills",
      params: [
        stripUndefined({
          account,
          pair: params.pair,
          status: params.status,
          cursor: params.cursor,
          limit: params.limit,
        }),
      ],
    },
    options,
  );
}

export interface ZoneMyTransfersParams extends ZonePaginationParams {
  account?: Address;
}

export async function getZoneMyTransfers(
  authToken: Hex,
  authenticatedAccount: Address,
  params: ZoneMyTransfersParams = {},
  options?: ZoneRpcFetchOptions,
): Promise<ZonePageEnvelope<ZoneTransfer>> {
  const account = assertOwnerScopedAccount({
    authenticatedAccount,
    requestedAccount: params.account,
  });
  return privateRpcFetch<ZonePageEnvelope<ZoneTransfer>>(
    authToken,
    {
      method: "zone_getMyTransfers",
      params: [
        stripUndefined({
          account,
          cursor: params.cursor,
          limit: params.limit,
        }),
      ],
    },
    options,
  );
}

export async function getZoneOrder(
  authToken: Hex,
  orderId: number | bigint | Hex,
  options?: ZoneRpcFetchOptions,
): Promise<ZoneOrder> {
  return privateRpcFetch<ZoneOrder>(
    authToken,
    {
      method: "zone_getOrder",
      params: [toRpcQuantity(orderId)],
    },
    options,
  );
}

export async function getZoneWithdrawalStatus(
  authToken: Hex,
  txHashOrWithdrawalIndex: Hex | string,
  options?: ZoneRpcFetchOptions,
): Promise<ZoneWithdrawalStatus> {
  return privateRpcFetch<ZoneWithdrawalStatus>(
    authToken,
    {
      method: "zone_getWithdrawalStatus",
      params: [txHashOrWithdrawalIndex],
    },
    options,
  );
}

export async function listZoneBatches(
  params: ZonePaginationParams = {},
  options?: ZoneRpcFetchOptions,
): Promise<ZoneBatchListResponse> {
  const payload = stripUndefined({
    cursor: params.cursor,
    limit: params.limit,
  });
  const rpcParams = Object.keys(payload).length === 0 ? [] : [payload];
  return publicRpcFetch<ZoneBatchListResponse>(
    {
      method: "zone_listBatches",
      params: rpcParams,
    },
    options,
  );
}

export async function getZoneBatch(
  batchNumber: number | bigint | Hex,
  options?: ZoneRpcFetchOptions,
): Promise<ZoneBatchSummary | null> {
  return publicRpcFetch<ZoneBatchSummary | null>(
    {
      method: "zone_getBatch",
      params: [toBatchNumberHex(batchNumber)],
    },
    options,
  );
}

export async function searchZoneBatch(
  query: string,
  options?: ZoneRpcFetchOptions,
): Promise<ZoneBatchSummary | null> {
  return publicRpcFetch<ZoneBatchSummary | null>(
    {
      method: "zone_searchBatch",
      params: [query],
    },
    options,
  );
}

export interface ZoneMidpointHistoryParams extends ZonePaginationParams {
  base: Address;
  quote: Address;
  interval?: string;
}

export async function getZoneMidpointHistory(
  authToken: Hex,
  params: ZoneMidpointHistoryParams,
  options?: ZoneRpcFetchOptions,
): Promise<ZoneMidpointHistoryResponse> {
  const rpcParams: unknown[] = [
    { base: params.base, quote: params.quote },
    params.interval ?? "1m",
  ];
  if (params.cursor !== undefined) {
    rpcParams.push(params.limit ?? 500, params.cursor);
  } else if (params.limit !== undefined) {
    rpcParams.push(params.limit);
  }
  return privateRpcFetch<ZoneMidpointHistoryResponse>(
    authToken,
    {
      method: "zone_getMidpointHistory",
      params: rpcParams,
    },
    options,
  );
}

/** Public (no-auth) midpoint history — drives the limit-mode chart enable
 *  without a wallet. */
export async function getZonePublicMidpointHistory(
  params: ZoneMidpointHistoryParams,
  options?: ZoneRpcFetchOptions,
): Promise<ZoneMidpointHistoryResponse> {
  const rpcParams: unknown[] = [
    { base: params.base, quote: params.quote },
    params.interval ?? "1m",
  ];
  if (params.cursor !== undefined) {
    rpcParams.push(params.limit ?? 500, params.cursor);
  } else if (params.limit !== undefined) {
    rpcParams.push(params.limit);
  }
  return publicRpcFetch<ZoneMidpointHistoryResponse>(
    {
      method: "zone_getMidpointHistory",
      params: rpcParams,
    },
    options,
  );
}
