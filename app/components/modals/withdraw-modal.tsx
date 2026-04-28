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
import { ModalShell } from "./modal-shell";

/**
 * WithdrawModal — withdraw stablecoins back to an Ethereum L1 address.
 *
 * State machine:
 *   idle    — recipient + amount entry
 *   signing — Sign withdrawal pending
 *   pending — relayer processing
 *   success — withdrawal queued; tx hash link
 *   failed  — wallet rejected or relayer error
 *
 * Uses the M2.10 Form primitive + zod for the recipient address validator.
 * Microcopy follows omega-docs/03-brand/messaging.md "[What happened.]
 * [What to do next.]" — the schema messages are the consumer surface.
 */
export type WithdrawState =
  | "idle"
  | "signing"
  | "pending"
  | "success"
  | "failed";

export type WithdrawToken = "USDC" | "USDT" | "EURC";

const WITHDRAW_TOKENS: WithdrawToken[] = ["USDC", "USDT", "EURC"];

const withdrawSchema = z.object({
  recipient: z
    .string()
    .min(1, "Recipient required. Paste the destination address.")
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid address. Paste a 0x-prefixed Ethereum address."
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
  /** Available balance in the selected token, formatted. */
  available?: string;
  /** Network fee in USD, formatted. */
  networkFeeUsd?: string;
  /** Privacy fee in USD, formatted. Pass empty string to omit. */
  privacyFeeUsd?: string;
  txHash?: string;
  errorMessage?: string;
  onTokenChange?: (token: WithdrawToken) => void;
  onSubmit?: (form: WithdrawForm) => void;
  onRetry?: () => void;
}

export function WithdrawModal({
  open,
  onClose,
  state,
  token = "USDC",
  available = "9,820.00",
  networkFeeUsd = "$0.42",
  privacyFeeUsd = "$0.10",
  txHash = "0x9f…3c4a",
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onTokenChange,
  onSubmit,
  onRetry,
}: WithdrawModalProps) {
  const form = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { recipient: "", amount: "" },
  });

  const amountValue = form.watch("amount");
  const youReceive = React.useMemo(() => {
    const n = Number(amountValue);
    if (Number.isNaN(n) || n <= 0) return "0.00";
    return n.toFixed(2);
  }, [amountValue]);

  const isBusy = state === "signing" || state === "pending";

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) onClose();
      }}
      title="Withdraw"
      description="Withdraw stablecoins to an Ethereum L1 address."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => onSubmit?.(values))}
          className="flex flex-col gap-5"
          noValidate
        >
          {/* Token selector */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
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
                  <FormLabel required className="text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
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
                    disabled={isBusy || state === "success"}
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
                    disabled={isBusy || state === "success"}
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
                <FormLabel required className="text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  Recipient
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0x…"
                    className="font-mono"
                    disabled={isBusy || state === "success"}
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
          <WithdrawStateSurface state={state} txHash={txHash} message={errorMessage} />

          {/* CTA */}
          {state !== "success" ? (
            <Button
              type={state === "failed" ? "button" : "submit"}
              onClick={state === "failed" ? onRetry : undefined}
              disabled={isBusy}
            >
              {state === "failed" ? "Retry" : "Sign withdrawal"}
            </Button>
          ) : (
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          )}
        </form>
      </Form>
    </ModalShell>
  );
}

function WithdrawStateSurface({
  state,
  txHash,
  message,
}: {
  state: WithdrawState;
  txHash: string;
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

  if (state === "success") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
        <Status state="settled" />
        <a
          href={`https://etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {txHash}
          <Icon.External size={12} aria-hidden />
        </a>
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
