import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="glass">Glass</Badge>
    </div>
  ),
};

export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="success">
        <Badge.Dot />
        Online
      </Badge>
      <Badge variant="destructive">
        <Badge.Dot />
        Offline
      </Badge>
      <Badge variant="outline">
        <Badge.Dot />
        Idle
      </Badge>
    </div>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant — toggle Transparency toolbar to Reduced to verify fallback.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="glass">Glass label</Badge>
      <Badge variant="glass">
        <Badge.Dot />
        With dot
      </Badge>
    </div>
  ),
};
