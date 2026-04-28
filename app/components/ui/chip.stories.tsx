import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Chip } from "./chip";

const meta: Meta<typeof Chip> = {
  title: "Primitives/Chip",
  component: Chip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip>All</Chip>
      <Chip active>USDC</Chip>
      <Chip>USDT</Chip>
      <Chip variant="glass">Glass</Chip>
      <Chip variant="glass" active>
        Glass on
      </Chip>
    </div>
  ),
};

function ChipGroup() {
  const [active, setActive] = React.useState("USDC");
  const opts = ["All", "USDC", "USDT", "EURC"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {opts.map((o) => (
        <Chip key={o} active={active === o} onClick={() => setActive(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

export const Interactive: Story = {
  render: () => <ChipGroup />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip disabled>Disabled</Chip>
      <Chip disabled active>
        Disabled on
      </Chip>
      <Chip variant="glass" disabled>
        Glass disabled
      </Chip>
    </div>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant — toggle Transparency in the toolbar to see fallback.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip variant="glass">Off</Chip>
      <Chip variant="glass" active>
        Active
      </Chip>
    </div>
  ),
};
