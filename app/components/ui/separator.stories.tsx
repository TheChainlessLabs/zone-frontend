import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <div className="text-sm font-medium leading-none">Settlement</div>
      <p className="text-sm text-muted-foreground">Hard finality on L1.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <span>Match</span>
        <Separator orientation="vertical" />
        <span>Proof</span>
        <Separator orientation="vertical" />
        <span>Settle</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4 text-sm">
      <span>USDC</span>
      <Separator orientation="vertical" />
      <span>USDT</span>
      <Separator orientation="vertical" />
      <span>EURC</span>
    </div>
  ),
};
