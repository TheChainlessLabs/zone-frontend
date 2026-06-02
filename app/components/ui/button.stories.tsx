import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Icon } from "@/lib/icons";

/**
 * Button — primary control surface. Glass variant rides the .glass-pill
 * substrate; toggle the toolbar `Transparency` global to inspect the
 * reduced-transparency fallback path.
 */
const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="glass">Glass</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Submit">
        <Icon.Submit />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Icon.Buy /> Buy
      </Button>
      <Button variant="outline">
        <Icon.Wallet /> Tempo wallet
      </Button>
      <Button variant="glass">
        <Icon.Submit /> Place order
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Default</Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="glass" disabled>
        Glass
      </Button>
    </div>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant — verify the reduced-transparency fallback by flipping the Transparency toolbar control to Reduced.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="glass">Glass</Button>
      <Button variant="glass" size="sm">
        Glass small
      </Button>
      <Button variant="glass" size="lg">
        Glass large
      </Button>
      <Button variant="glass" size="icon" aria-label="Settings">
        <Icon.Settings />
      </Button>
    </div>
  ),
};
