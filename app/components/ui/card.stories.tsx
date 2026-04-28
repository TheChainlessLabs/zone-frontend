import type { Meta, StoryObj } from "@storybook/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Settlement status</CardTitle>
        <CardDescription>Next batch in ~4s.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your order will be matched at midpoint and settle on-chain.
        </p>
      </CardContent>
      <CardFooter>
        <Button>View receipt</Button>
      </CardFooter>
    </Card>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant uses the surface-scale .glass utility (24px blur). Toggle the Transparency toolbar to Reduced to see the muted fallback.",
      },
    },
  },
  render: () => (
    <Card variant="glass" className="w-80">
      <CardHeader>
        <CardTitle>Order form</CardTitle>
        <CardDescription>Glass surface · over MidpointTape.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Glass is reserved for the order form, modals, sheets, and settlement
          status per the brand visual identity.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card className="w-72">
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>Standard surface.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="glass" className="w-72">
        <CardHeader>
          <CardTitle>Glass</CardTitle>
          <CardDescription>Liquid-glass surface.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
};
