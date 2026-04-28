import type { Meta, StoryObj } from "@storybook/react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./sheet";
import { Button } from "./button";

/**
 * Sheet — vaul drawer primitive. Tagged as Sheet in the brand lexicon
 * (mobile sheets, settings panes), backed by `vaul`. Story title scopes
 * under Primitives/Sheet to match the file name.
 */
const meta: Meta<typeof Drawer> = {
  title: "Primitives/Sheet",
  component: Drawer,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[300px] items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order details</DrawerTitle>
            <DrawerDescription>
              1,000.00 USDC at midpoint, settle in next batch.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Confirm</Button>
            <Button variant="outline">Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};

export const Open: Story = {
  render: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Receipt</DrawerTitle>
            <DrawerDescription>Settled · proof posted to L1.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Done</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};
