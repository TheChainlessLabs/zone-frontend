"use client";

import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Status } from "./status";
import { Icon } from "@/lib/icons";

/**
 * Form — mirrors the live demo from /system section 17 so Storybook is the
 * canonical primitive surface and the system page is the higher-level
 * marketing layout.
 */
const meta: Meta = {
  title: "Primitives/Form",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj;

// Schema kept inline so the snippet shown in the showcase is the literal
// source of the live form.
const formDemoSchema = z.object({
  wallet: z
    .string()
    .min(1, "Wallet required. Connect or paste a 0x address.")
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid wallet address. Use a 0x-prefixed 40-char hex address."
    ),
  amount: z
    .string()
    .min(1, "Amount required. Enter a positive number.")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: "Invalid amount. Use a positive number.",
    }),
  memo: z
    .string()
    .max(64, "Memo too long. Keep it under 64 characters.")
    .optional(),
});
type FormDemoSchema = z.infer<typeof formDemoSchema>;

function LiveDemo() {
  const [submitted, setSubmitted] = React.useState<null | "ok">(null);
  const form = useForm<FormDemoSchema>({
    resolver: zodResolver(formDemoSchema),
    defaultValues: { wallet: "", amount: "", memo: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });
  const submitting = form.formState.isSubmitting;

  return (
    <div className="w-[420px] rounded-md border border-border bg-muted/30 p-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            // eslint-disable-next-line no-console
            console.log("Form submitted:", values);
            await new Promise((r) => setTimeout(r, 400));
            setSubmitted("ok");
            setTimeout(() => {
              setSubmitted(null);
              form.reset();
            }, 1500);
          })}
          className="flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="wallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Wallet address</FormLabel>
                <FormControl>
                  <Input placeholder="0x…" {...field} />
                </FormControl>
                <FormDescription>
                  EOA on the Omega-supported chain.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Amount</FormLabel>
                <FormControl>
                  <Input placeholder="10,000.00" {...field} />
                </FormControl>
                <FormDescription>
                  Settled at midpoint in the next batch.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memo</FormLabel>
                <FormControl>
                  <Input placeholder="Optional · max 64 chars" {...field} />
                </FormControl>
                <FormDescription>
                  Visible in your fill history. Not seen by counterparties.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
            {submitting ? <Status state="submitting" /> : null}
            {submitted === "ok" ? <Status state="settled" /> : null}
          </div>
        </form>
      </Form>
    </div>
  );
}

export const Live: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Live demo. Try submit-empty to surface errors. Errors render with Icon.Failed and a soft enter motion. Required indicator is the Linear-style accent dot.",
      },
    },
  },
  render: () => <LiveDemo />,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Static state matrix — pristine, focused, with-description, with-error, disabled.",
      },
    },
  },
  render: () => (
    <div className="grid w-[420px] grid-cols-1 gap-6 rounded-md border border-border bg-muted/30 p-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="form-pristine">Wallet address</Label>
        <Input id="form-pristine" placeholder="0x…" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="form-focused">Amount</Label>
        <Input
          id="form-focused"
          placeholder="10,000.00"
          defaultValue="10,000.00"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="form-described">Memo</Label>
        <Input id="form-described" placeholder="Optional" />
        <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          Visible in your fill history. Not seen by counterparties.
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="form-error"
          className="inline-flex items-center gap-1.5 text-[var(--destructive)]"
        >
          <span>Wallet address</span>
          <span
            aria-hidden
            className="inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--destructive)]"
          />
        </Label>
        <Input
          id="form-error"
          defaultValue="0x42"
          aria-invalid
          className="border-[var(--destructive)] focus-visible:ring-[var(--destructive)]"
        />
        <span className="inline-flex items-start gap-1.5 text-xs leading-relaxed text-[var(--destructive)]">
          <Icon.Failed size={12} aria-hidden className="mt-0.5 shrink-0" />
          <span>
            Invalid wallet address. Use a 0x-prefixed 40-char hex address.
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="form-disabled">Slippage</Label>
        <Input id="form-disabled" defaultValue="0.10%" disabled />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Submitting
        </span>
        <div className="flex items-center gap-3">
          <Button disabled>Submitting…</Button>
          <Status state="submitting" />
        </div>
      </div>
    </div>
  ),
};
