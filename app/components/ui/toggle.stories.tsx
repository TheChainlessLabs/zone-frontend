import type { Meta, StoryObj } from "@storybook/react";

import { Toggle } from "./toggle";
import { Icon } from "@/lib/icons";

const meta: Meta<typeof Toggle> = {
  title: "Primitives/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle aria-label="Default toggle">Default</Toggle>
      <Toggle variant="outline" aria-label="Outline toggle">
        Outline
      </Toggle>
      <Toggle variant="glass" aria-label="Glass toggle">
        Glass
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle size="sm" aria-label="Small">
        SM
      </Toggle>
      <Toggle size="default" aria-label="Default">
        MD
      </Toggle>
      <Toggle size="lg" aria-label="Large">
        LG
      </Toggle>
      <Toggle size="default" aria-label="Theme">
        <Icon.Theme.Dark />
      </Toggle>
    </div>
  ),
};

export const Pressed: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle defaultPressed aria-label="Default pressed">
        On
      </Toggle>
      <Toggle variant="outline" defaultPressed aria-label="Outline pressed">
        On
      </Toggle>
      <Toggle variant="glass" defaultPressed aria-label="Glass pressed">
        On
      </Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle disabled>Default</Toggle>
      <Toggle variant="outline" disabled>
        Outline
      </Toggle>
      <Toggle variant="glass" disabled>
        Glass
      </Toggle>
    </div>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant — flip the Transparency toolbar control to Reduced to see the .glass-pill fallback.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle variant="glass" aria-label="Off">
        Off
      </Toggle>
      <Toggle variant="glass" defaultPressed aria-label="On">
        On
      </Toggle>
    </div>
  ),
};
