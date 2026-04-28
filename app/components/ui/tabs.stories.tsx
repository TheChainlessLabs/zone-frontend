import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="orders" className="w-96">
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="fills">Fills</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
      </TabsList>
      <TabsContent value="orders" className="text-sm text-muted-foreground">
        Open orders show here.
      </TabsContent>
      <TabsContent value="fills" className="text-sm text-muted-foreground">
        Recent fills show here.
      </TabsContent>
      <TabsContent value="balances" className="text-sm text-muted-foreground">
        Balances show here.
      </TabsContent>
    </Tabs>
  ),
};

export const Glass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Glass variant on TabsList propagates to TabsTrigger via context. Toggle Transparency toolbar to Reduced to see fallback.",
      },
    },
  },
  render: () => (
    <Tabs defaultValue="buy" className="w-96">
      <TabsList variant="glass">
        <TabsTrigger value="buy">Buy</TabsTrigger>
        <TabsTrigger value="sell">Sell</TabsTrigger>
      </TabsList>
      <TabsContent value="buy" className="text-sm text-muted-foreground">
        Buy form.
      </TabsContent>
      <TabsContent value="sell" className="text-sm text-muted-foreground">
        Sell form.
      </TabsContent>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="orders" className="w-96">
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="fills" disabled>
          Fills
        </TabsTrigger>
      </TabsList>
      <TabsContent value="orders" className="text-sm text-muted-foreground">
        Disabled tab variant.
      </TabsContent>
    </Tabs>
  ),
};
