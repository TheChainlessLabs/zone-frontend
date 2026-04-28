import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import { Toaster } from "./sonner";
import { Button } from "./button";

/**
 * Toast — sonner-backed transient notification surface. Theme follows the
 * Storybook toolbar via `theme="system"` on the Toaster (re-reads the OS /
 * `[data-theme]` setting).
 */
const meta: Meta<typeof Toaster> = {
  title: "Primitives/Toast",
  component: Toaster,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => toast("Order submitted", { description: "Settles in the next batch." })}>
        Show toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={() => toast.success("Match confirmed.")}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.error("Order rejected. Re-sign and retry.")}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.info("Settlement queued.")}>
          Info
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};
