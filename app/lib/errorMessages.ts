const ERROR_MAP: Array<{ pattern: RegExp; friendly: string }> = [
  { pattern: /nonce/i, friendly: "Transaction out of sync. Please try again." },
  { pattern: /insufficient.*balance/i, friendly: "Insufficient balance for this order." },
  { pattern: /invalid.*signature/i, friendly: "Signing failed. Try reconnecting your wallet." },
  { pattern: /account.*not.*found/i, friendly: "Account not found. Please reconnect your wallet." },
  { pattern: /order.*not.*found/i, friendly: "Order not found. It may have already been filled or cancelled." },
  { pattern: /duplicate/i, friendly: "This request is already being processed." },
];

export function getFriendlyError(rawMessage: string): string {
  for (const { pattern, friendly } of ERROR_MAP) {
    if (pattern.test(rawMessage)) return friendly;
  }
  return "Something went wrong. Please try again.";
}
