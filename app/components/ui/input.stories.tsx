import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="amount">Amount</Label>
      <Input id="amount" placeholder="10,000.00" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="default">Default</Label>
        <Input id="default" placeholder="Default surface" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="glass">Glass</Label>
        <Input id="glass" variant="glass" placeholder="Glass surface" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="disabled">Slippage</Label>
      <Input id="disabled" defaultValue="0.10%" disabled />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label
        htmlFor="error"
        className="inline-flex items-center gap-1.5 text-[var(--destructive)]"
      >
        <span>Wallet address</span>
        <span
          aria-hidden
          className="inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--destructive)]"
        />
      </Label>
      <Input
        id="error"
        defaultValue="0x42"
        aria-invalid
        className="border-[var(--destructive)] focus-visible:ring-[var(--destructive)]"
      />
      <span className="text-xs leading-relaxed text-[var(--destructive)]">
        Invalid wallet address. Use a 0x-prefixed 40-char hex address.
      </span>
    </div>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant — toggle the Transparency toolbar control to Reduced to see the .glass-pill fallback to muted.",
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="glass-input">Order amount</Label>
      <Input id="glass-input" variant="glass" placeholder="0.00" />
    </div>
  ),
};
