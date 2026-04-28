import type { Meta, StoryObj } from "@storybook/react";

import { Status, type StatusState } from "./status";

const meta: Meta<typeof Status> = {
  title: "Primitives/Status",
  component: Status,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Status>;

const ALL_STATES: StatusState[] = [
  "pending",
  "submitting",
  "awaiting-signature",
  "matched",
  "settled",
  "proven",
  "cancelled",
  "failed",
  "connected",
  "wrong-network",
];

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {ALL_STATES.map((s) => (
        <Status key={s} state={s} />
      ))}
    </div>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass override forces the Badge.glass variant. Toggle Transparency toolbar to Reduced for fallback.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {ALL_STATES.map((s) => (
        <Status key={s} state={s} glass />
      ))}
    </div>
  ),
};
