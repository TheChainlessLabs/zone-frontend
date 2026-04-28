import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { configureAxe } from "vitest-axe";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Status, STATE_SPECS, type StatusState } from "@/components/ui/status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

afterEach(cleanup);

// Component-level a11y harness.
//
//   - `color-contrast` is disabled because jsdom does not compute CSS, so
//     axe cannot evaluate contrast reliably here. Real-browser contrast is
//     audited during M7 production hardening — see `_a11y.md`.
//   - `region` is disabled because it flags rendered children that aren't
//     wrapped in a landmark (`<main>`, `<header>`, etc). These tests render
//     primitives in isolation; landmark structure is the page author's
//     responsibility, not a primitive's.
const axeForPrimitives = configureAxe({
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
  },
});

async function expectNoViolations(container: HTMLElement) {
  const results = await axeForPrimitives(container);
  expect(results.violations).toEqual([]);
}

// --- Button ----------------------------------------------------------------

it("Button — no a11y violations across variants", async () => {
  const { container } = render(
    <div>
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="glass">Glass</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Open menu">
        <svg aria-hidden="true" width="16" height="16" />
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
  await expectNoViolations(container);
});

// --- Input + Label ---------------------------------------------------------

it("Input + Label — no a11y violations across variants", async () => {
  const { container } = render(
    <div>
      <div>
        <Label htmlFor="i-default">Default</Label>
        <Input id="i-default" placeholder="Default" />
      </div>
      <div>
        <Label htmlFor="i-glass">Glass</Label>
        <Input id="i-glass" variant="glass" placeholder="Glass" />
      </div>
      <div>
        <Label htmlFor="i-disabled">Disabled</Label>
        <Input id="i-disabled" disabled placeholder="Disabled" />
      </div>
    </div>
  );
  await expectNoViolations(container);
});

// --- Card ------------------------------------------------------------------

it("Card — no a11y violations across variants", async () => {
  const { container } = render(
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Default card</CardTitle>
          <CardDescription>Brief description.</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Glass card</CardTitle>
          <CardDescription>Brief description.</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    </div>
  );
  await expectNoViolations(container);
});

// --- Separator -------------------------------------------------------------

it("Separator — no a11y violations", async () => {
  const { container } = render(
    <div>
      <p>Above</p>
      <Separator />
      <p>Below</p>
      <Separator orientation="vertical" decorative={false} />
    </div>
  );
  await expectNoViolations(container);
});

// --- Tabs ------------------------------------------------------------------

it("Tabs — no a11y violations across variants", async () => {
  const { container } = render(
    <div>
      <Tabs defaultValue="a">
        <TabsList aria-label="Default tabs">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
        <TabsContent value="b">B content</TabsContent>
      </Tabs>
      <Tabs defaultValue="a">
        <TabsList variant="glass" aria-label="Glass tabs">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
        <TabsContent value="b">B content</TabsContent>
      </Tabs>
    </div>
  );
  await expectNoViolations(container);
});

// --- Toggle ----------------------------------------------------------------

it("Toggle — no a11y violations across variants", async () => {
  const { container } = render(
    <div>
      <Toggle aria-label="Bold default">B</Toggle>
      <Toggle variant="outline" aria-label="Bold outline">
        B
      </Toggle>
      <Toggle variant="glass" aria-label="Bold glass">
        B
      </Toggle>
      <Toggle size="sm" aria-label="Small">
        S
      </Toggle>
      <Toggle size="lg" aria-label="Large">
        L
      </Toggle>
      <Toggle disabled aria-label="Disabled">
        D
      </Toggle>
    </div>
  );
  await expectNoViolations(container);
});

// --- Dialog ----------------------------------------------------------------
// Dialog only paints when open. Using `defaultOpen` avoids needing a click.

it("Dialog — no a11y violations when open", async () => {
  const { container } = render(
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  // Dialog portals to document.body — pass body so axe sees the overlay.
  await expectNoViolations((container.ownerDocument?.body ?? container) as HTMLElement);
});

// --- DropdownMenu ----------------------------------------------------------

it("DropdownMenu — no a11y violations when open", async () => {
  const { container } = render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button>Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  await expectNoViolations((container.ownerDocument?.body ?? container) as HTMLElement);
});

// --- Tooltip ---------------------------------------------------------------

it("Tooltip — no a11y violations on trigger and content", async () => {
  const { container } = render(
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Tip body</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  await expectNoViolations((container.ownerDocument?.body ?? container) as HTMLElement);
});

// --- Sheet (Drawer / vaul) -------------------------------------------------

it("Sheet (Drawer) — no a11y violations on trigger and open content", async () => {
  const { container } = render(
    <Drawer open>
      <DrawerTrigger asChild>
        <Button>Open</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer title</DrawerTitle>
          <DrawerDescription>Drawer description.</DrawerDescription>
        </DrawerHeader>
        <p>Body content</p>
      </DrawerContent>
    </Drawer>
  );
  await expectNoViolations((container.ownerDocument?.body ?? container) as HTMLElement);
});

// --- Chip ------------------------------------------------------------------

it("Chip — no a11y violations across variants and states", async () => {
  const { container } = render(
    <div>
      <Chip>Inactive default</Chip>
      <Chip active>Active default</Chip>
      <Chip variant="glass">Inactive glass</Chip>
      <Chip variant="glass" active>
        Active glass
      </Chip>
      <Chip disabled>Disabled</Chip>
    </div>
  );
  await expectNoViolations(container);
});

// --- Badge -----------------------------------------------------------------

it("Badge — no a11y violations across variants", async () => {
  const { container } = render(
    <div>
      <Badge>Default</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">
        <Badge.Dot />
        Success
      </Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="glass">Glass</Badge>
    </div>
  );
  await expectNoViolations(container);
});

// --- Status ----------------------------------------------------------------

it("Status — no a11y violations across all canonical states", async () => {
  const states = Object.keys(STATE_SPECS) as StatusState[];
  const { container } = render(
    <div role="status" aria-live="polite">
      {states.map((s) => (
        <Status key={s} state={s} />
      ))}
      <Status state="settled" glass />
    </div>
  );
  await expectNoViolations(container);
});

// --- Form ------------------------------------------------------------------

const formSchema = z.object({
  amount: z.string().min(1, "Enter an amount."),
});
type FormSchema = z.infer<typeof formSchema>;

function FormHarness() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Amount</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormDescription>
                Settled in the next batch.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

it("Form — no a11y violations in default render", async () => {
  const { container } = render(<FormHarness />);
  await expectNoViolations(container);
});

// --- Aggregate guard -------------------------------------------------------
// One extra "matrix" render to catch accidental ID collisions or aria
// references that only break when multiple primitives co-exist on the page.

describe("primitive matrix", () => {
  it("co-rendered primitives — no a11y violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order</CardTitle>
              <CardDescription>Place a private order.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="amt">Amount</Label>
              <Input id="amt" placeholder="0.00" />
              <Separator />
              <Tabs defaultValue="buy">
                <TabsList aria-label="Side">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
                <TabsContent value="buy">Buy panel</TabsContent>
                <TabsContent value="sell">Sell panel</TabsContent>
              </Tabs>
              <Toggle aria-label="Hide balance">
                <svg aria-hidden="true" width="16" height="16" />
              </Toggle>
              <Chip active>USDC</Chip>
              <Status state="connected" />
              <Badge variant="success">Live</Badge>
            </CardContent>
            <CardFooter>
              <Tooltip defaultOpen>
                <TooltipTrigger asChild>
                  <Button>Submit</Button>
                </TooltipTrigger>
                <TooltipContent>EIP-712 sign</TooltipContent>
              </Tooltip>
            </CardFooter>
          </Card>
        </div>
      </TooltipProvider>
    );
    await expectNoViolations((container.ownerDocument?.body ?? container) as HTMLElement);
  });
});
