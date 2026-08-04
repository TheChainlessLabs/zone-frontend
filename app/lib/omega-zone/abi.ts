import { parseAbi } from "viem";

export const DARKPOOL_ABI = [
  "event OrderSubmitted(uint128 indexed orderId,address indexed maker,address base,address quote,uint128 amount,uint128 price,bool isBid)",
  "event OrderPlaced(uint128 indexed orderId,address indexed maker,address base,address quote,uint128 amount,uint128 price,bool isBid)",
  "event OrderFilled(uint128 indexed orderId,address indexed maker,address indexed taker,uint128 amountFilled,uint128 price)",
  "event OrderCancelled(uint128 indexed orderId,address indexed maker)",
  "function place(address base,uint128 amount,uint128 price,bool isBid) external returns (uint128 orderId)",
  "function cancel(uint128 orderId) external",
  "function getOrder(uint128 orderId) external view returns (uint128 orderId,address maker,address base,address quote,bool isBid,uint128 price,uint128 quantity)",
  "function deposit(address token,uint128 amount) external",
  "function withdraw(address token,uint128 amount) external",
  "function balanceOf(address user,address token) external view returns (uint128)",
  "function availableBalanceOf(address user,address token) external view returns (uint128)",
  "function pairKey(address base,address quote) external pure returns (bytes32)",
  "function createPair(address base) external returns (bytes32)",
  "function bestBid(address base) external view returns (uint128 price,uint128 quantity)",
  "function bestAsk(address base) external view returns (uint128 price,uint128 quantity)",
  "function MIN_ORDER_AMOUNT() external pure returns (uint128)",
  "function marketBuy(address base,uint128 amount,uint128 maxQuoteIn) external returns (uint128 quoteSpent)",
  "function marketSell(address base,uint128 amount,uint128 minQuoteOut) external returns (uint128 quoteReceived)",
] as const;

export const TIP20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external pure returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner,address spender) external view returns (uint256)",
  "function nonces(address owner) external view returns (uint256)",
  "function DOMAIN_SEPARATOR() external view returns (bytes32)",
  "function approve(address spender,uint256 amount) external returns (bool)",
  "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s) external",
  "function transfer(address to,uint256 amount) external returns (bool)",
  "function transferFrom(address from,address to,uint256 amount) external returns (bool)",
] as const;

export const ZONE_PORTAL_ABI = [
  "struct EncryptedDepositPayload { bytes32 ephemeralPubkeyX; uint8 ephemeralPubkeyYParity; bytes ciphertext; bytes12 nonce; bytes16 tag; }",
  "event DepositMade(bytes32 indexed newCurrentDepositQueueHash,address indexed sender,address token,address to,uint128 netAmount,uint128 fee,bytes32 memo,address bouncebackRecipient,uint64 depositNumber)",
  "event EncryptedDepositMade(bytes32 indexed newCurrentDepositQueueHash,address indexed sender,address token,uint128 netAmount,uint128 fee,uint256 keyIndex,bytes32 ephemeralPubkeyX,uint8 ephemeralPubkeyYParity,bytes ciphertext,bytes12 nonce,bytes16 tag,address bouncebackRecipient,uint64 depositNumber)",
  "event TokenEnabled(address indexed token,string name,string symbol,string currency)",
  "event WithdrawalProcessed(address indexed to,address token,uint128 amount,bool callbackSuccess)",
  "function deposit(address token,address to,uint128 amount,bytes32 memo,address bouncebackRecipient) external returns (bytes32 newCurrentDepositQueueHash)",
  "function depositEncrypted(address token,uint128 amount,uint256 keyIndex,EncryptedDepositPayload encrypted,address bouncebackRecipient) external returns (bytes32 newCurrentDepositQueueHash)",
  "function calculateDepositFee() external view returns (uint128 fee)",
  "function calculateBouncebackFee() external view returns (uint128 fee)",
  "function depositCount() external view returns (uint64)",
  "function lastProcessedDepositNumber() external view returns (uint64)",
  "function isTokenEnabled(address token) external view returns (bool)",
  "function enabledTokenCount() external view returns (uint256)",
  "function enabledTokenAt(uint256 index) external view returns (address)",
  "function zoneId() external view returns (uint32)",
  "function sequencer() external view returns (address)",
  "function sequencerEncryptionKey() external view returns (bytes32 x,uint8 yParity)",
] as const;

export const ZONE_OUTBOX_ABI = [
  "event WithdrawalRequested(uint64 indexed withdrawalIndex,address indexed sender,address token,address to,uint128 amount,uint128 fee,bytes32 memo,uint64 gasLimit,address fallbackRecipient,bytes data,bytes revealTo)",
  "function requestWithdrawal(address token,address to,uint128 amount,bytes32 memo,uint64 gasLimit,address fallbackRecipient,bytes data,bytes revealTo) external",
  "function calculateWithdrawalFee(uint64 gasLimit) external view returns (uint128 fee)",
  "function pendingWithdrawalsCount() external view returns (uint256)",
  "function nextWithdrawalIndex() external view returns (uint64)",
  "function lastBatch() external view returns (bytes32 withdrawalQueueHash,uint64 withdrawalBatchIndex)",
  "function withdrawalBatchIndex() external view returns (uint64)",
] as const;

export const DARKPOOL_PARSED_ABI = parseAbi(DARKPOOL_ABI);
export const TIP20_PARSED_ABI = parseAbi(TIP20_ABI);
export const ZONE_PORTAL_PARSED_ABI = parseAbi(ZONE_PORTAL_ABI);
export const ZONE_OUTBOX_PARSED_ABI = parseAbi(ZONE_OUTBOX_ABI);
