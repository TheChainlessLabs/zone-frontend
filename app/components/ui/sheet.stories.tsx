import type { Meta, StoryObj } from "@storybook/react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";

/**
 * Sheet — side-anchored panel built on Radix Dialog. For full-width-on-desktop
 * behaviour use Drawer (vaul). Sheet is for desktop side panels — settings,
 * filters, secondary navigation: max 480 px wide on desktop, slides from the
 * specified `side`. Soft-surface treatment per brand spec.
 */
const meta: Meta<typeof Sheet> = {
  title: "Primitives/Sheet",
  component: Sheet,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Sheet>;

function Body() {
  return (
    <SheetHeader>
      <SheetTitle>Side panel</SheetTitle>
      <SheetDescription>
        Anchored to one edge. Max 480 px on desktop, full-width on narrow viewports.
      </SheetDescription>
    </SheetHeader>
  );
}

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open right sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <Body />
        <SheetFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <Body />
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open top sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <Body />
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open bottom sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <Body />
      </SheetContent>
    </Sheet>
  ),
};
