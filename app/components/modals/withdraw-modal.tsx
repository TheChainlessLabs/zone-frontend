"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { tempoTxUrl } from "@/lib/zone";
import { ModalShell } from "./modal-shell";

/**
 * WithdrawModal — withdraw PATH.USD back to a Tempo L1 address.
 *
 * State machine:
 *   idle    — recipient + amount entry
 *   signing — Sign withdrawal pending
 *   pending — zone outbox processing (L2 tx awaiting receipt)
 *   queued  — L2 confirmed; withdrawal is in a batch awaiting L1 settlement
 *   success — withdrawal processed on L1 (settlement tx link shown)
 *   failed  — wallet rejected or zone RPC error
 *
 * The terminal state for a fresh withdrawal is almost always `queued`: the
 * L2 request lands instantly but L1 settlement only happens once the
 * sequencer posts the containing batch to Tempo, which takes minutes to
 * hours. `success`/Settled is reserved for when `processed` is already
 * reported. The L2 zone tx hash is never linked to the L1 explorer — only
 * `l1SettlementTxHash` is — because the L2 hash does not resolve there.
 *
 * Uses the M2.10 Form primitive + zod for the recipient address validator.
 * Microcopy follows omega-docs/03-brand/messaging.md "[What happened.]
 * [What to do next.]" — the schema messages are the consumer surface.
 */
export type WithdrawState =
  | "idle"
  | "signing"
  | "pending"
  | "queued"
  | "success"
  | "failed";

export type WithdrawToken = "PATH.USD";

const WITHDRAW_TOKENS: WithdrawToken[] = ["PATH.USD"];

const withdrawSchema = z.object({
  recipient: z
    .string()
    .min(1, "Recipient required. Paste the destination address.")
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid address. Paste a 0x-prefixed Tempo address."
    ),
  amount: z
    .string()
    .min(1, "Amount required. Enter how much to withdraw.")
    .refine((v) => Number(v) > 0, "Amount must be greater than zero."),
});

type WithdrawForm = z.infer<typeof withdrawSchema>;

export interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  state: WithdrawState;
  token?: WithdrawToken;
  /** Recipient prefilled whenever a new withdrawal begins. */
  defaultRecipient?: string;
  /** Available balance in the selected token, formatted. */
  available?: string;
  /** Network fee, formatted in zone native USD units. */
  networkFeeUsd?: string;
  /** Privacy fee in USD, formatted. Pass empty string to omit. */
  privacyFeeUsd?: string;
  txHash?: string;
  /** Portal batch index the withdrawal was grouped into, once batched. */
  withdrawalBatchIndex?: string;
  /** L1 settlement tx (processWithdrawal, falling back to submitBatch).
   *  Linked to the Tempo L1 explorer in the `success` state. Null/undefined
   *  until the batch lands on L1. */
  l1SettlementTxHash?: string;
  errorMessage?: string;
  onTokenChange?: (token: WithdrawToken) => void;
  onValuesChange?: (form: WithdrawForm) => void;
  onSubmit?: (form: WithdrawForm) => void;
  onRetry?: () => void;
}

export function WithdrawModal({
  open,
  onClose,
  state,
  token = "PATH.USD",
  defaultRecipient = "",
  available = "9,820.00",
  networkFeeUsd = "—",
  privacyFeeUsd = "$0.10",
  txHash = "0x9f…3c4a",
  withdrawalBatchIndex,
  l1SettlementTxHash,
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onTokenChange,
  onValuesChange,
  onSubmit,
  onRetry,
}: WithdrawModalProps) {
  const form = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { recipient: defaultRecipient, amount: "" },
  });

  const amountValue = form.watch("amount");
  const youReceive = React.useMemo(() => {
    const n = Number(amountValue);
    if (Number.isNaN(n) || n <= 0) return "0.00";
    return n.toFixed(2);
  }, [amountValue]);

  const isBusy = state === "signing" || state === "pending";
  const isTerminal = state === "queued" || state === "success";

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      onValuesChange?.({
        recipient: values.recipient ?? "",
        amount: values.amount ?? "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onValuesChange]);

  React.useEffect(() => {
    if (!open) return;
    form.reset({ recipient: defaultRecipient, amount: "" });
  }, [defaultRecipient, form, open]);

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Withdraw"
      description="Withdraw PATH.USD to a Tempo L1 address."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => onSubmit?.(values))}
          className="flex flex-col gap-5"
          noValidate
        >
          {/* Token selector */}
          <div className="flex flex-col gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Token
            </Label>
            <div className="flex gap-2">
              {WITHDRAW_TOKENS.map((t) => (
                <Chip
                  key={t}
                  active={t === token}
                  onClick={() => onTokenChange?.(t)}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between">
                  <FormLabel required className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                    Amount
                  </FormLabel>
                  <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                    Available · {available} {token}
                  </span>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="font-mono tabular-nums"
                    disabled={isBusy || isTerminal}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      form.setValue("amount", available.replace(/,/g, ""), {
                        shouldValidate: true,
                      })
                    }
                    disabled={isBusy || isTerminal}
                  >
                    Max
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recipient */}
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  Recipient
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0x…"
                    className="font-mono"
                    disabled={isBusy || isTerminal}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fee breakdown + you receive */}
          <dl className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-[var(--muted-foreground)]">Network fee</dt>
              <dd className="font-mono tabular-nums">{networkFeeUsd}</dd>
            </div>
            {privacyFeeUsd ? (
              <div className="flex items-center justify-between">
                <dt className="text-[var(--muted-foreground)]">Privacy fee</dt>
                <dd className="font-mono tabular-nums">{privacyFeeUsd}</dd>
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between border-t border-[var(--border)] pt-1.5">
              <dt className="text-[var(--foreground)]">You receive</dt>
              <dd className="font-mono tabular-nums">
                {youReceive} {token}
              </dd>
            </div>
          </dl>

          {/* State surface */}
          <WithdrawStateSurface
            state={state}
            withdrawalBatchIndex={withdrawalBatchIndex}
            l1SettlementTxHash={l1SettlementTxHash}
            message={errorMessage}
          />

          {/* CTA */}
          {isTerminal ? (
            <Button
              type="button"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Done
            </Button>
          ) : (
            <Button
              type={state === "failed" ? "button" : "submit"}
              onClick={state === "failed" ? onRetry : undefined}
              disabled={isBusy}
              className="min-h-[44px] md:min-h-0"
            >
              {state === "failed" ? "Retry" : "Sign withdrawal"}
            </Button>
          )}
        </form>
      </Form>
    </ModalShell>
  );
}

function WithdrawStateSurface({
  state,
  withdrawalBatchIndex,
  l1SettlementTxHash,
  message,
}: {
  state: WithdrawState;
  withdrawalBatchIndex?: string;
  l1SettlementTxHash?: string;
  message: string;
}) {
  if (state === "idle") return null;

  if (state === "signing") {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="awaiting-signature" />
        <span className="text-xs text-[var(--muted-foreground)]">
          Sign the withdrawal in your wallet.
        </span>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="pending" />
        <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          Processing your withdrawal. We&rsquo;ll release funds once the next
          batch settles.
        </span>
      </div>
    );
  }

  // L2 request confirmed; withdrawal is grouped into a portal batch and is
  // awaiting L1 settlement. This is the normal terminal state — never say
  // "Settled" here, and never link the L2 zone tx hash to the L1 explorer.
  if (state === "queued") {
    return (
      <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <div className="flex items-start gap-3">
          <Status state="pending" label="Awaiting L1 settlement" />
          <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            {withdrawalBatchIndex
              ? `Confirmed on Omega Zone. Settling in batch #${withdrawalBatchIndex} — funds release on Tempo L1 once the batch posts.`
              : "Confirmed on Omega Zone. Funds release on Tempo L1 once the next batch posts."}
          </span>
        </div>
      </div>
    );
  }

  // Withdrawal processed on L1. Link the L1 settlement tx (not the L2 zone
  // hash) to the Tempo L1 explorer — the L2 hash does not resolve there.
  if (state === "success") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="settled" />
        {l1SettlementTxHash ? (
          <a
            href={tempoTxUrl(l1SettlementTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--foreground)] underline-offset-4 hover:underline"
          >
            {l1SettlementTxHash}
            <Icon.External size={12} aria-hidden />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3">
      <Status state="failed" />
      <span className="text-xs leading-relaxed text-[var(--foreground)]">
        {message}
      </span>
    </div>
  );
}
