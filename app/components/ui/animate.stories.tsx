import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Animate, AnimatePresence } from "./animate";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

/**
 * Animate — five brand-locked motion variants. Toggle the Motion toolbar
 * control to Reduced to inspect the prefers-reduced-motion path: enter/exit
 * drop translation, expand snaps instantly, pop is a no-op, drawer falls
 * back to a 100ms linear ease-out slide.
 */
const meta: Meta<typeof Animate> = {
  title: "Primitives/Animate",
  component: Animate,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Animate>;

function Replay({ children }: { children: (k: number) => React.ReactNode }) {
  const [k, setK] = React.useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => setK((v) => v + 1)}>
        Replay
      </Button>
      {children(k)}
    </div>
  );
}

export const Enter: Story = {
  render: () => (
    <Replay>
      {(k) => (
        <Animate key={k} variant="enter">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Order received</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              200ms ease-out, slides up + fades in.
            </CardContent>
          </Card>
        </Animate>
      )}
    </Replay>
  ),
};

export const Exit: Story = {
  render: () => {
    function Demo() {
      const [show, setShow] = React.useState(true);
      return (
        <div className="flex flex-col items-center gap-3">
          <Button variant="outline" onClick={() => setShow((v) => !v)}>
            Toggle
          </Button>
          <AnimatePresence>
            {show ? (
              <Animate key="exit" variant="exit">
                <Card className="w-72">
                  <CardHeader>
                    <CardTitle>Cancelled</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    150ms ease-in, fades + slides down.
                  </CardContent>
                </Card>
              </Animate>
            ) : null}
          </AnimatePresence>
        </div>
      );
    }
    return <Demo />;
  },
};

export const Expand: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = React.useState(false);
      return (
        <div className="flex w-72 flex-col items-stretch gap-3">
          <Button variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? "Collapse" : "Expand"}
          </Button>
          <AnimatePresence>
            {open ? (
              <Animate key="expand" variant="expand">
                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  250ms ease-out, grid-row trick. Composite-friendly.
                </div>
              </Animate>
            ) : null}
          </AnimatePresence>
        </div>
      );
    }
    return <Demo />;
  },
};

export const Pop: Story = {
  render: () => (
    <Animate variant="pop">
      <Button>Press me</Button>
    </Animate>
  ),
};

export const Drawer: Story = {
  render: () => {
    function Demo() {
      const [show, setShow] = React.useState(false);
      return (
        <div className="relative flex h-72 w-72 flex-col items-center justify-end overflow-hidden rounded-md border border-border bg-muted/30 p-2">
          <Button variant="outline" onClick={() => setShow((v) => !v)}>
            {show ? "Close" : "Open drawer"}
          </Button>
          <AnimatePresence>
            {show ? (
              <Animate
                key="drawer"
                variant="drawer"
                className="absolute inset-x-0 bottom-0 rounded-t-md border-t border-border bg-background p-4 text-sm"
              >
                Spring drawer · stiffness 360, damping 32, mass 0.9.
              </Animate>
            ) : null}
          </AnimatePresence>
        </div>
      );
    }
    return <Demo />;
  },
};
