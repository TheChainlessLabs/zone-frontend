"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Info, Lock, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { OrderType, Side } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";
import { useWallet } from "@/lib/wallet";
import { useAccountBalances } from "@/lib/hooks/useAccountBalances";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { useOrderSigning } from "@/lib/hooks/useOrderSigning";
import { useMarket } from "@/lib/hooks/useMarket";
import { useNonce } from "@/lib/hooks/useNonce";
import { useToast } from "@/lib/useToast";
import { useSignedOperationQueue } from "@/lib/hooks/useSignedOperationQueue";
import { createOrder } from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { encodePrice, encodeQuantity } from "@/lib/priceUtils";
import { estimatePriceImpact } from "@/lib/priceImpact";
import { devLog, devError, devWarn } from "@/lib/devLog";
import { getFriendlyError } from "@/lib/errorMessages";
import { useNotifications } from "@/lib/useNotifications";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { useConfirmBeforeSubmit } from "@/lib/hooks/useConfirmBeforeSubmit";
import { motion } from "motion/react";
import OrderConfirmationModal, {
  type OrderConfirmationDetails,
} from "@/components/OrderConfirmationModal";

interface OrderFormProps {
  isLoading?: boolean;
  /** Controlled orderType — when omitted the component manages its own state. */
  orderType?: OrderType;
  /** Fires whenever the user toggles between Market (midpoint) and Limit. */
  onOrderTypeChange?: (next: OrderType) => void;
}

export default function OrderForm({
  isLoading,
  orderType: controlledOrderType,
  onOrderTypeChange,
}: OrderFormProps) {
  const [internalOrderType, setInternalOrderType] = useState<OrderType>("midpoint");
  const orderType = controlledOrderType ?? internalOrderType;
  const setOrderType = (next: OrderType) => {
    if (controlledOrderType === undefined) setInternalOrderType(next);
    onOrderTypeChange?.(next);
  };
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("1.0850");
  const [isPending, setIsPending] = useState(false);
  const { accountId } = useWallet();
  const { balances } = useAccountBalances(accountId);
  const { book, midpoint } = useOrderBook();
  const { signMarketOrder, signLimitOrder } = useOrderSigning();
  const { marketId } = useMarket();
  const nonce = useNonce(accountId);
  const { addToast } = useToast();
  const { execute: executeSignedOp, isLocked: isSignedOpLocked } = useSignedOperationQueue();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [confirmBeforeSubmit] = useConfirmBeforeSubmit();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // USDC (token ID 1) is the default quote token
  const quoteBalance = balances.find((b) => b.tokenId === 1);
  const availableBalance = quoteBalance?.available ?? 0;

  const midpointRate = midpoint ?? 0;
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount ? (parsedAmount * 0.00005).toFixed(2) : "0.00";
  const feePercent = "0.005%";
  const estReceive = parsedAmount ? (parsedAmount * midpointRate).toFixed(2) : "0.00";
  const savingsPips = "+0.8";

  // Balance validation
  const amountExceedsBalance = parsedAmount > 0 && parsedAmount > availableBalance;
  const isLargeOrder = parsedAmount > 0 && !amountExceedsBalance && parsedAmount > availableBalance * 0.5;
  // High-stake orders (>50% of balance) always confirm, regardless of preference.
  const requireConfirm = confirmBeforeSubmit || isLargeOrder;

  function handleSubmitClick() {
    if (requireConfirm) {
      setConfirmOpen(true);
      return;
    }
    void handleSubmit();
  }

  const orderDetails: OrderConfirmationDetails = {
    side,
    pair: "EUR/USD",
    type: orderType,
    amount: parsedAmount ? `${parsedAmount.toLocaleString()} EUR` : "—",
    price: orderType === "limit" ? price : midpointRate ? midpointRate.toFixed(4) : "—",
    estReceive,
    fee,
  };

  // Price impact estimation
  const priceImpact = estimatePriceImpact(book, side, parsedAmount);

  // Keyboard shortcuts for trading
  const shortcuts = useMemo(() => [
    { key: "b", handler: () => setSide("buy"), description: "Switch to Buy" },
    { key: "s", handler: () => setSide("sell"), description: "Switch to Sell" },
    { key: "Escape", handler: () => setAmount(""), description: "Clear amount" },
    { key: "1", handler: () => { const val = availableBalance * 0.25; setAmount(val > 0 ? val.toFixed(2) : ""); }, description: "25% of balance" },
    { key: "2", handler: () => { const val = availableBalance * 0.5; setAmount(val > 0 ? val.toFixed(2) : ""); }, description: "50% of balance" },
    { key: "3", handler: () => { const val = availableBalance * 1; setAmount(val > 0 ? val.toFixed(2) : ""); }, description: "MAX balance" },
  ], [availableBalance]);
  useKeyboardShortcuts(shortcuts);

  async function handleSubmit() {
    devLog("order", `handleSubmit() — accountId=${accountId} isPending=${isPending} isReady=${nonce.isReady} amount=${parsedAmount} midpoint=${midpointRate}`);

    if (!accountId) { devWarn("order", "blocked: no accountId"); return; }
    if (isPending) { devWarn("order", "blocked: isPending=true"); return; }
    if (!nonce.isReady) { devWarn("order", "blocked: nonce not ready"); return; }
    if (!parsedAmount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) { devWarn("order", `blocked: invalid amount "${amount}" → ${parsedAmount}`); return; }
    if (amountExceedsBalance) { devWarn("order", "blocked: amount exceeds balance"); return; }
    if (orderType === "midpoint" && !midpointRate) { devWarn("order", "blocked: no midpointRate (needed for midpoint orders)"); return; }

    setIsPending(true);
    const apiSide = side === "buy" ? "Buy" : "Sell";
    const encodedQuantity = BigInt(encodeQuantity(parsedAmount, 6));
    try {
      await executeSignedOp(async () => {
        let signature: string;
        let n: number;
        let kind: "Market" | "Limit";
        let orderPrice: bigint;
        let extension: { max_slippage_bps: number } | null;

        if (orderType === "limit") {
          const parsedPrice = parseFloat(price);
          if (!parsedPrice || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            devWarn("order", `blocked: invalid limit price "${price}" → ${parsedPrice}`);
            return;
          }
          orderPrice = BigInt(encodePrice(parsedPrice));
          devLog("order", `signing limit order: price=${orderPrice} qty=${encodedQuantity} side=${apiSide}`);
          const result = await signLimitOrder({
            marketId,
            price: orderPrice,
            quantity: encodedQuantity,
            side: apiSide,
          });
          signature = result.signature;
          n = result.nonce;
          kind = "Limit";
          extension = null;
        } else {
          orderPrice = BigInt(encodePrice(midpointRate));
          devLog("order", `signing market order: price=${orderPrice} qty=${encodedQuantity} side=${apiSide} slippage=50bps`);
          const result = await signMarketOrder({
            marketId,
            price: orderPrice,
            quantity: encodedQuantity,
            side: apiSide,
            maxSlippageBps: 50,
          });
          signature = result.signature;
          n = result.nonce;
          kind = "Market";
          extension = { max_slippage_bps: 50 };
        }

        devLog("order", `signed with nonce=${n}, submitting to API...`);

        await createOrder({
          market_id: marketId,
          side: apiSide,
          kind,
          price: orderPrice.toString(),
          quantity: encodedQuantity.toString(),
          extension,
          nonce: n,
          signature,
        });
        devLog("order", `order placed successfully`);
        addToast("success", "Order Placed", `${side} order for ${amount} submitted`);
        addNotification("order_placed", "Order Placed", `${side} ${orderType} order for ${amount} EUR submitted`);
        queryClient.invalidateQueries({ queryKey: ["book", marketId] });
        queryClient.invalidateQueries({ queryKey: ["trades", marketId] });
        setAmount("");
      });
    } catch (err) {
      devError("order", `order failed`, err);
      if (err instanceof Error && err.message === "Another signed operation is in progress") {
        addToast("warning", "Please Wait", "Another operation is in progress...");
      } else if (err instanceof ApiError && err.message.includes("nonce")) {
        devWarn("order", `nonce mismatch — resyncing`);
        nonce.resync();
        addToast("error", "Order Failed", getFriendlyError(err.message));
      } else if (err instanceof ApiError && err.status === 400) {
        addToast("error", "Order Failed", getFriendlyError(err.message));
      }
      // Wallet user rejection — silent
    } finally {
      setIsPending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Buy/Sell toggle */}
        <div className="flex gap-1">
          <Skeleton className="flex-1 h-[40px] rounded-md" />
          <Skeleton className="flex-1 h-[40px] rounded-md" />
        </div>

        {/* Amount label + input */}
        <div>
          <Skeleton className="h-[14px] w-[80px] mb-1.5" />
          <Skeleton className="h-[44px] rounded-md" />
        </div>

        {/* Percentage shortcuts */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-[30px] rounded-md" />
          <Skeleton className="flex-1 h-[30px] rounded-md" />
          <Skeleton className="flex-1 h-[30px] rounded-md" />
        </div>

        {/* Order details — row height matches text-body-sm line-height (21px) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="h-px bg-border-subtle" />
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="h-[44px] rounded-md" />

        {/* Privacy notice */}
        <Skeleton className="h-[14px] w-[250px]" />
      </div>
    );
  }

  return (
    <motion.div
      data-testid="order-form-loaded"
      className="flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Buy/Sell toggle */}
      <div className="flex gap-1">
        <button
          data-testid="order-form-buy"
          onClick={() => setSide("buy")}
          className={`flex-1 h-[40px] text-body-sm font-semibold rounded-md transition-fast ${
            side === "buy"
              ? "bg-success text-text-inverse"
              : "bg-bg-elevated text-text-muted hover:text-text-secondary"
          }`}
        >
          Buy
        </button>
        <button
          data-testid="order-form-sell"
          onClick={() => setSide("sell")}
          className={`flex-1 h-[40px] text-body-sm font-semibold rounded-md transition-fast ${
            side === "sell"
              ? "bg-error text-text-inverse"
              : "bg-bg-elevated text-text-muted hover:text-text-secondary"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type tabs. The active LIMIT tab carries a small precision-
          strong underline — the canonical "you are in precision mode now"
          signal. Active MIDPOINT tab stays on calm steel-blue (default). */}
      <div className="flex gap-1 bg-bg-base rounded-md p-1">
        {(["midpoint", "limit"] as const).map((t) => {
          const active = orderType === t;
          const isLimitActive = active && t === "limit";
          return (
            <button
              key={t}
              data-testid={`order-form-order-type-${t}`}
              onClick={() => setOrderType(t)}
              className={`relative flex-1 min-h-[44px] md:min-h-[28px] text-body-sm font-medium rounded-sm transition-fast capitalize ${
                active
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t}
              {isLimitActive && (
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 bottom-[3px] h-[1.5px] w-5 rounded-full"
                  style={{ background: "var(--color-accent-strong)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Amount */}
      <div>
        <label className="text-label-uppercase text-text-muted mb-1.5 block">Amount (EUR)</label>
        <div
          className={`flex items-center h-[44px] bg-bg-base border rounded-md px-4 ${
            side === "sell" ? "border-error/30" : "border-border"
          }`}
        >
          <input
            data-testid="order-form-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-body-sm font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
          />
          <span
            className={`text-body-sm font-medium ml-2 ${
              side === "sell" ? "text-error" : "text-accent"
            }`}
          >
            EUR
          </span>
        </div>
        {amountExceedsBalance && (
          <p className="text-[12px] text-error mt-1">
            Insufficient balance. Available: {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
          </p>
        )}
        {isLargeOrder && (
          <p className="text-[12px] text-warning mt-1">
            This order uses over 50% of your available balance
          </p>
        )}
        {priceImpact.severity === "warning" && (
          <p className="text-[12px] text-warning mt-1 flex items-center gap-1">
            <AlertTriangle size={12} /> This order is ~{priceImpact.impactPercent}% of book depth
          </p>
        )}
        {priceImpact.severity === "critical" && (
          <p className="text-[12px] text-error mt-1 flex items-center gap-1">
            <AlertTriangle size={12} /> High price impact — ~{priceImpact.impactPercent}% of book depth
          </p>
        )}
      </div>

      {/* Percentage shortcuts */}
      <div className="flex gap-2">
        {[
          { label: "25%", factor: 0.25 },
          { label: "50%", factor: 0.5 },
          { label: "MAX", factor: 1 },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => {
              const val = availableBalance * s.factor;
              setAmount(val > 0 ? val.toFixed(2) : "");
            }}
            className="flex-1 min-h-[44px] md:min-h-[30px] text-body-sm font-mono text-text-muted border border-border rounded-md hover:bg-bg-elevated hover:text-text-primary transition-fast"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Price (limit only). The "Limit Price" label is the single
          precision-strong label permitted by the design context — the
          eye reads "this is the precision moment" without the rest of
          the form shifting register. The input gets a precision-strong
          focus ring; everything else stays on the calm steel-blue. */}
      {orderType === "limit" && (
        <div>
          <div className="flex justify-between mb-1.5">
            <label
              className="text-[11px] uppercase tracking-wider font-medium"
              style={{ color: "var(--color-accent-strong)" }}
            >
              Limit Price
            </label>
            <span className="text-[11px] text-text-muted">
              Mid: {midpointRate.toFixed(4)}
            </span>
          </div>
          <div
            className="flex items-center h-[44px] bg-bg-base border rounded-md px-4 transition-fast focus-within:ring-2"
            style={{
              borderColor: "var(--color-border)",
              ["--tw-ring-color" as string]: "var(--color-accent-strong)",
            }}
          >
            <input
              data-testid="order-form-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent text-body-sm font-mono font-tabular outline-none text-text-primary"
            />
            <span className="text-body-sm text-text-muted ml-2">USD</span>
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="flex flex-col gap-2.5 text-body-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Type</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-text-primary capitalize">{orderType}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Fee</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-text-primary font-mono font-tabular">
            ${fee} ({feePercent})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Est. receive</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-text-primary font-mono font-tabular">
            ${estReceive}
          </span>
        </div>

        <div className="h-px bg-border-subtle" />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Est. savings vs Wise</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-success font-mono font-tabular">
            {savingsPips} pips
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        data-testid="order-form-submit"
        onClick={handleSubmitClick}
        disabled={isPending || !accountId || !parsedAmount || amountExceedsBalance}
        className={`h-[44px] w-full rounded-md text-body-sm font-semibold tracking-[0.08em] uppercase text-text-inverse transition-fast disabled:opacity-50 disabled:cursor-not-allowed ${
          side === "buy"
            ? "bg-success hover:bg-success-hover active:bg-success-active"
            : "bg-error hover:bg-error-hover active:bg-error-active"
        }`}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Submitting...
          </span>
        ) : (
          <>
            {side === "buy" ? "Buy" : "Sell"} EUR / USD
            {orderType === "limit" && price ? ` at ${price}` : ""}
          </>
        )}
      </button>

      {/* Privacy notice */}
      <p className="flex items-center gap-1.5 text-[12px] text-text-muted/60">
        <Lock size={12} />
        All orders execute privately at midpoint.{" "}
        <span className="underline cursor-pointer hover:text-text-muted">Learn more</span>
      </p>

      <OrderConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void handleSubmit();
        }}
        orderDetails={orderDetails}
      />
    </motion.div>
  );
}
