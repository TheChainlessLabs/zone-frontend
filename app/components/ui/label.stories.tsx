import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";
import { Input } from "./input";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => <Label htmlFor="email">Email address</Label>,
};

export const PairedWithInput: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" placeholder="ada@omegamarkets.com" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="email-disabled" className="peer-disabled:opacity-70">
        Email address (peer disabled)
      </Label>
      <Input
        id="email-disabled"
        className="peer"
        placeholder="ada@omegamarkets.com"
        disabled
      />
    </div>
  ),
};
