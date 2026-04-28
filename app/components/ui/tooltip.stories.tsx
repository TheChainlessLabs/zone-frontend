import type { Meta, StoryObj } from "@storybook/react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "./button";

const meta: Meta<typeof Tooltip> = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={0}>
        <Story />
      </TooltipProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Settles in the next batch.</TooltipContent>
    </Tooltip>
  ),
};

export const Open: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tooltip forced open for inspection.",
      },
    },
  },
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline">Tooltip target</Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        Forced open · positioning preview
      </TooltipContent>
    </Tooltip>
  ),
};
