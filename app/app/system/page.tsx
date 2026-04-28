"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Check,
  Copy,
  Lock,
  LogOut,
  Plus,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/Section";
import { SectionNav } from "@/components/SectionNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OmegaMark } from "@/components/OmegaMark";
import { MidpointTape } from "@/components/MidpointTape";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogClose,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { type LucideIcon } from "lucide-react";
import { Icon } from "@/lib/icons";

const SECTIONS = [
  { id: "foundation", number: "01", label: "Foundation" },
  { id: "buttons", number: "02", label: "Buttons" },
  { id: "inputs", number: "03", label: "Inputs" },
  { id: "cards", number: "04", label: "Cards" },
  { id: "tabs", number: "05", label: "Tabs" },
  { id: "toggle", number: "06", label: "Toggle" },
  { id: "dialog", number: "07", label: "Dialog" },
  { id: "dropdown", number: "08", label: "Dropdown" },
  { id: "tooltip", number: "09", label: "Tooltip" },
  { id: "sheet", number: "10", label: "Sheet" },
  { id: "toast", number: "11", label: "Toast" },
  { id: "separator", number: "12", label: "Separator" },
  { id: "icons", number: "13", label: "Icons" },
  { id: "glass-variants", number: "14", label: "Glass" },
] as const;

// Semantic-name → Lucide source-name map, used in the /system Icons section
// to surface the underlying glyph next to the brand alias. Kept colocated with
// the showcase rather than in lib/icons.tsx, since it's a documentation
// concern — not part of the public icon API.
type IconEntry = { name: string; source: string; Component: LucideIcon };

function isLucideIcon(value: unknown): value is LucideIcon {
  // Lucide components are React forwardRef exotic components — objects with a
  // render fn — or plain function components. Either way, they expose
  // displayName / $$typeof. The nested-group sentinel is "no displayName and
  // is a plain object with string keys mapping to Lucide components".
  return (
    typeof value === "function" ||
    (typeof value === "object" && value !== null && "$$typeof" in value)
  );
}

const ICON_ENTRIES: IconEntry[] = (() => {
  const entries: IconEntry[] = [];
  for (const [key, value] of Object.entries(Icon)) {
    if (isLucideIcon(value)) {
      const Comp = value as LucideIcon;
      entries.push({ name: key, source: Comp.displayName ?? key, Component: Comp });
    } else {
      for (const [sub, Comp] of Object.entries(value as Record<string, LucideIcon>)) {
        entries.push({
          name: `${key}.${sub}`,
          source: Comp.displayName ?? sub,
          Component: Comp,
        });
      }
    }
  }
  return entries;
})();

const ICON_SIZE_VARIANTS = [12, 14, 16, 20, 24, 32] as const;

const ICON_COLOR_CONTEXTS: Array<{ label: string; className: string }> = [
  { label: "default", className: "text-[var(--foreground)]" },
  { label: "success", className: "text-[var(--success)]" },
  { label: "destructive", className: "text-[var(--destructive)]" },
  { label: "muted", className: "text-[var(--muted-foreground)]" },
];

export default function SystemShowcase() {
  return (
    <TooltipProvider delayDuration={150}>
      <main id="top" className="relative min-h-screen pb-32">
        <SectionNav items={[...SECTIONS]} />
        <Hero />

        <Section
          id="foundation"
          number="01"
          label="Foundation"
          title={
            <>
              Primitives in service of{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                a single voice.
              </span>
            </>
          }
          description={
            <>
              This page is the in-app design-system showcase: every shadcn primitive
              wired to Omega&rsquo;s tokens, in one scrollable surface.{" "}
              <span className="font-serif text-[var(--foreground)]">
                Complementary to Storybook
              </span>{" "}
              (not yet wired) — reach for /system when you want a fast visual sweep,
              reach for Storybook when you need isolated states and visual regression.
            </>
          }
        >
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col gap-4">
              <ColumnLabel>Source of truth</ColumnLabel>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                Type, motion, glass, and radius rules live in{" "}
                <a
                  href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/visual-identity.md"
                  className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
                >
                  omega-docs/03-brand/visual-identity.md
                </a>
                . Tokens are exported as CSS variables in{" "}
                <code className="font-mono text-xs text-[var(--foreground)]">
                  app/globals.css
                </code>{" "}
                and re-exposed to Tailwind through the{" "}
                <code className="font-mono text-xs text-[var(--foreground)]">
                  @theme inline
                </code>{" "}
                block. Any primitive on this page resolves through that chain.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <ColumnLabel>Class-merge helper</ColumnLabel>
              <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-4 font-mono text-[11px] leading-relaxed text-[var(--foreground)]">
                <code>{`// app/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}</code>
              </pre>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                Every primitive here calls <code className="font-mono text-[var(--foreground)]">cn()</code>{" "}
                to merge variant classes with caller overrides — duplicates collapse,
                later wins.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="buttons"
          number="02"
          label="Buttons"
          title={
            <>
              Six variants.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Four sizes.
              </span>
            </>
          }
          description={
            <>
              Default for the primary action; secondary, outline, ghost for support;
              destructive for danger; link for inline navigation.{" "}
              <span className="font-serif text-[var(--foreground)]">
                Disabled state ships with each.
              </span>
            </>
          }
        >
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {(["default", "destructive", "outline", "secondary", "ghost", "link"] as const).map(
              (variant) => (
                <ButtonRow key={variant} variant={variant} />
              )
            )}
          </div>
        </Section>

        <Section
          id="inputs"
          number="03"
          label="Inputs"
          title={
            <>
              Quiet input chrome.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Errors carry meaning, not noise.
              </span>
            </>
          }
          description={
            <>
              Label and Input pair as a unit. The focus ring is a single hairline.
              The error state writes one factual line —{" "}
              <span className="font-serif text-[var(--foreground)]">no exclamation, no apology.</span>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
            <FormRow label="Default">
              <Label htmlFor="sys-input-default">Wallet address</Label>
              <Input id="sys-input-default" placeholder="0x…" />
            </FormRow>
            <FormRow label="Focused (autofocus)">
              <Label htmlFor="sys-input-focused">Order size</Label>
              <Input
                id="sys-input-focused"
                placeholder="10,000.00"
                defaultValue="10,000.00"
                autoFocus
              />
            </FormRow>
            <FormRow label="Disabled">
              <Label htmlFor="sys-input-disabled">Slippage</Label>
              <Input id="sys-input-disabled" defaultValue="0.10%" disabled />
            </FormRow>
            <FormRow label="With error">
              <Label htmlFor="sys-input-error">Amount</Label>
              <Input
                id="sys-input-error"
                defaultValue="20,000.00"
                aria-invalid="true"
                className="border-[var(--destructive)] focus-visible:ring-[var(--destructive)]"
              />
              <span className="text-xs text-[var(--destructive)]">
                Insufficient balance. Available: 1,250.00 USDC.
              </span>
            </FormRow>
          </div>
        </Section>

        <Section
          id="cards"
          number="04"
          label="Cards"
          title={
            <>
              The default surface.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Header, content, footer.
              </span>
            </>
          }
          description={
            <>
              Cards are the workhorse container — neutral border, neutral fill, soft
              shadow.{" "}
              <span className="font-serif text-[var(--foreground)]">Glass is reserved</span>{" "}
              for the order form and settlement; cards stay solid.
            </>
          }
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed">
                  A bare card. One container, default tokens, soft shadow. Use it
                  when content brings its own structure.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Settlement status</CardTitle>
                <CardDescription>
                  Batch sealed at midpoint. Awaiting L1 attestation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-center justify-between font-tabular">
                    <span className="text-[var(--muted-foreground)]">Tx</span>
                    <span className="font-mono">0xa513…C853</span>
                  </li>
                  <li className="flex items-center justify-between font-tabular">
                    <span className="text-[var(--muted-foreground)]">Batch</span>
                    <span className="font-mono">#48,201</span>
                  </li>
                  <li className="flex items-center justify-between font-tabular">
                    <span className="text-[var(--muted-foreground)]">Mid</span>
                    <span className="font-mono">0.9213</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" size="sm">
                  Copy hash
                </Button>
                <Button size="sm">
                  View on L1
                  <ArrowRight />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section
          id="tabs"
          number="05"
          label="Tabs"
          title={
            <>
              Pill tabs.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Active surface lifts.
              </span>
            </>
          }
          description={
            <>
              The shadcn primitive ships with the muted track and a raised active
              tile.{" "}
              <span className="font-serif text-[var(--foreground)]">No animation</span>{" "}
              by default — motion lands later in M2 / M5.
            </>
          }
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <ColumnLabel>Two-up · order side</ColumnLabel>
              <Tabs defaultValue="buy" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
                <TabsContent value="buy">
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                    Buy panel — receive USDC at midpoint.
                  </p>
                </TabsContent>
                <TabsContent value="sell">
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                    Sell panel — pay USDC, receive EURC.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex flex-col gap-4">
              <ColumnLabel>Three-up · venue</ColumnLabel>
              <Tabs defaultValue="omega" className="w-full">
                <TabsList className="grid w-full max-w-sm grid-cols-3">
                  <TabsTrigger value="omega">Omega</TabsTrigger>
                  <TabsTrigger value="solver">Solver</TabsTrigger>
                  <TabsTrigger value="external">External</TabsTrigger>
                </TabsList>
                <TabsContent value="omega">
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                    Internal CLOB. Match at midpoint, attested.
                  </p>
                </TabsContent>
                <TabsContent value="solver">
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                    Bonded solver fills the residual.
                  </p>
                </TabsContent>
                <TabsContent value="external">
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                    Routed to aggregator. Slippage budget applies.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Section>

        <Section
          id="toggle"
          number="06"
          label="Toggle"
          title={
            <>
              Single-state switch.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Pressed lights up.
              </span>
            </>
          }
          description={
            <>
              Toggle is the binary control for view-state — alignment, density,{" "}
              <span className="font-serif text-[var(--foreground)]">privacy mode.</span>{" "}
              Pair it with an icon; never use it as a form input (use a checkbox).
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-4">
            <Toggle aria-label="Align left">
              <AlignLeft />
            </Toggle>
            <Toggle aria-label="Align center" defaultPressed>
              <AlignCenter />
            </Toggle>
            <Toggle aria-label="Align right" disabled>
              <AlignRight />
            </Toggle>
          </div>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Off · on · disabled, left to right.
          </p>
        </Section>

        <Section
          id="dialog"
          number="07"
          label="Dialog"
          title={
            <>
              Modal moments.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Confirm and move on.
              </span>
            </>
          }
          description={
            <>
              Dialog is for confirmation and short input — destructive actions,
              wallet disconnect, single-step forms.{" "}
              <span className="font-serif text-[var(--foreground)]">Don&rsquo;t nest dialogs.</span>{" "}
              Don&rsquo;t use dialog for navigation.
            </>
          }
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel order #48,201?</DialogTitle>
                <DialogDescription>
                  This order is queued for the next batch. Cancelling now releases
                  your reserved balance.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Keep order</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive">Cancel order</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section
          id="dropdown"
          number="08"
          label="Dropdown"
          title={
            <>
              Compact menu.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Header, separator, items.
              </span>
            </>
          }
          description={
            <>
              Dropdown menu is for actions tied to a row or a header — copy, edit,
              disconnect.{" "}
              <span className="font-serif text-[var(--foreground)]">Three to seven items;</span>{" "}
              if it grows past that, it&rsquo;s navigation, not a menu.
            </>
          }
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Signed in · 0xa513…C853</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy />
                Copy address
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[var(--destructive)] focus:text-[var(--destructive)]">
                <LogOut />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section
          id="tooltip"
          number="09"
          label="Tooltip"
          title={
            <>
              Hover hint.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                One short line.
              </span>
            </>
          }
          description={
            <>
              Tooltips clarify icons and abbreviations.{" "}
              <span className="font-serif text-[var(--foreground)]">Never essential information</span>{" "}
              — keyboard users and touch users skip them entirely.
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Lock">
                  <Lock />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Privacy mode · top</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Add">
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New order · right</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Delete">
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Cancel order · bottom</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section
          id="sheet"
          number="10"
          label="Sheet"
          title={
            <>
              Mobile drawer.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Tactile, draggable.
              </span>
            </>
          }
          description={
            <>
              Sheet uses{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">vaul</code>{" "}
              for native-feel mobile drawers — drag to dismiss, snap behaviour,
              background scaling.{" "}
              <span className="font-serif text-[var(--foreground)]">
                The only place spring motion is allowed
              </span>{" "}
              per the brand motion ladder.
            </>
          }
        >
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Order details</DrawerTitle>
                <DrawerDescription>
                  Submitted · matched at midpoint · awaiting batch seal.
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-2 text-sm">
                <ul className="flex flex-col gap-2 font-tabular">
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Sell</span>
                    <span className="font-mono">10,000.00 USDC</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Receive</span>
                    <span className="font-mono">9,213.40 EURC</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Mid</span>
                    <span className="font-mono">0.9213</span>
                  </li>
                </ul>
              </div>
              <DrawerFooter>
                <Button>
                  Confirm
                  <Check />
                </Button>
                <DrawerClose asChild>
                  <Button variant="ghost">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Section>

        <Section
          id="toast"
          number="11"
          label="Toast"
          title={
            <>
              Transient feedback.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Acknowledge, don&rsquo;t celebrate.
              </span>
            </>
          }
          description={
            <>
              Toasts use{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">sonner</code>{" "}
              and resolve through the popover tokens. One factual sentence —{" "}
              <span className="font-serif text-[var(--foreground)]">no exclamation marks,</span>{" "}
              no emoji. Errors include what failed and what to do next.
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Order matched at midpoint 0.9213", {
                  description: "Batch #48,201 · awaiting L1 attestation.",
                })
              }
            >
              Trigger success
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.error("Insufficient balance", {
                  description: "Available: 1,250.00 USDC. Reduce size and retry.",
                })
              }
            >
              Trigger error
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast("Awaiting signature", {
                  description: "Approve in your wallet to submit the order.",
                })
              }
            >
              Trigger info
            </Button>
          </div>
        </Section>

        <Section
          id="separator"
          number="12"
          label="Separator"
          title={
            <>
              Hairline divider.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Horizontal or vertical.
              </span>
            </>
          }
          description={
            <>
              Separator is one pixel of border colour.{" "}
              <span className="font-serif text-[var(--foreground)]">Use it sparingly</span>{" "}
              — whitespace usually does the job. Vertical variant needs a parent
              with a defined height.
            </>
          }
        >
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <ColumnLabel>Horizontal · between text blocks</ColumnLabel>
              <p className="text-sm leading-relaxed text-[var(--foreground)]">
                Match at midpoint. Internal liquidity matched first, attested by the
                TEE.
              </p>
              <Separator />
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                Residual is routed to a bonded solver, then to external aggregators
                if needed.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <ColumnLabel>Vertical · between inline items</ColumnLabel>
              <div className="flex h-8 items-center gap-4 text-sm">
                <span className="font-mono">USDC/EURC</span>
                <Separator orientation="vertical" />
                <span className="font-tabular text-[var(--muted-foreground)]">
                  0.9213 +0.42%
                </span>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="icons"
          number="13"
          label="Icons"
          title={
            <>
              Semantic over visual.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Lucide is the anchor.
              </span>
            </>
          }
          description={
            <>
              Components reference{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">Icon.Buy</code>,{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">Icon.Settled</code>,{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">Icon.Proof</code>{" "}
              — never the underlying Lucide glyph. The brand lexicon (
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/naming.md"
                className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
              >
                omega-docs/03-brand/naming.md
              </a>
              ) drives the alias names; the map in{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">app/lib/icons.tsx</code>{" "}
              is the only place{" "}
              <span className="font-serif text-[var(--foreground)]">lucide-react</span> is imported.
              When the brand picks a different glyph for a semantic, swap it once there.
            </>
          }
        >
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <ColumnLabel>Aliases · 24px</ColumnLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {ICON_ENTRIES.map((entry) => {
                  const I = entry.Component;
                  return (
                    <div
                      key={entry.name}
                      className="flex flex-col items-start gap-3 rounded-[var(--radius-md)] bg-[var(--muted)] p-4"
                    >
                      <I size={24} aria-hidden />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--foreground)]">
                          {entry.name}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                          {entry.source}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <ColumnLabel>Sizes · 12 · 14 · 16 · 20 · 24 · 32</ColumnLabel>
              <div className="flex flex-wrap items-end gap-6">
                {ICON_SIZE_VARIANTS.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Icon.Settled size={size} aria-hidden />
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      {size}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <ColumnLabel>Color contexts</ColumnLabel>
              <div className="flex flex-wrap items-end gap-6">
                {ICON_COLOR_CONTEXTS.map((ctx) => (
                  <div key={ctx.label} className="flex flex-col items-center gap-2">
                    <span className={ctx.className}>
                      <Icon.Settled size={24} aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      {ctx.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="glass-variants"
          number="14"
          label="Glass"
          title={
            <>
              The same primitives,{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                in glass.
              </span>
            </>
          }
          description={
            <>
              Glass is rare and purposeful — reserved for the order form, modals,
              sheets, settlement status, and small selection controls (
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/visual-identity.md"
                className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
              >
                omega-docs/03-brand/visual-identity.md
              </a>
              ). Tables, charts, navbar, body background stay solid.{" "}
              <span className="font-serif text-[var(--foreground)]">
                Solid on the left, glass on the right
              </span>
              — the glass column refracts a real-data substrate so the material
              reads honestly. Both fall back to a solid muted surface for
              <code className="ml-1 font-mono text-xs text-[var(--foreground)]">
                prefers-reduced-transparency
              </code>{" "}
              and missing{" "}
              <code className="font-mono text-xs text-[var(--foreground)]">
                backdrop-filter
              </code>{" "}
              support.
            </>
          }
        >
          <div className="flex flex-col divide-y divide-[var(--border)]">
            <GlassRow label="Button">
              <Button variant="default">Submit order</Button>
              <GlassWell>
                <Button variant="glass">Submit order</Button>
              </GlassWell>
            </GlassRow>

            <GlassRow label="Input">
              <Input placeholder="Search market…" className="max-w-xs" />
              <GlassWell>
                <Input
                  variant="glass"
                  placeholder="Search market…"
                  className="max-w-xs"
                />
              </GlassWell>
            </GlassRow>

            <GlassRow label="Tabs">
              <Tabs defaultValue="buy" className="w-full max-w-xs">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
              </Tabs>
              <GlassWell>
                <Tabs defaultValue="buy" className="w-full max-w-xs">
                  <TabsList variant="glass" className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                </Tabs>
              </GlassWell>
            </GlassRow>

            <GlassRow label="Toggle">
              <Toggle aria-label="Privacy mode · solid" defaultPressed>
                <Lock />
              </Toggle>
              <GlassWell>
                <Toggle
                  variant="glass"
                  aria-label="Privacy mode · glass"
                  defaultPressed
                >
                  <Lock />
                </Toggle>
              </GlassWell>
            </GlassRow>

            <GlassRow label="Chip">
              <div className="flex flex-wrap items-center gap-2">
                <Chip active>USDC/EURC</Chip>
                <Chip>USDC/USDT</Chip>
                <Chip>USDT/EURC</Chip>
              </div>
              <GlassWell>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip variant="glass" active>
                    USDC/EURC
                  </Chip>
                  <Chip variant="glass">USDC/USDT</Chip>
                  <Chip variant="glass">USDT/EURC</Chip>
                </div>
              </GlassWell>
            </GlassRow>

            <GlassRow label="Card">
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Settlement status</CardTitle>
                  <CardDescription className="text-xs">
                    Batch sealed · awaiting L1 attestation.
                  </CardDescription>
                </CardHeader>
              </Card>
              <GlassWell>
                <Card variant="glass" className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">Settlement status</CardTitle>
                    <CardDescription className="text-xs">
                      Batch sealed · awaiting L1 attestation.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </GlassWell>
            </GlassRow>
          </div>
        </Section>

        <footer className="border-t border-[var(--border)] py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 text-xs text-[var(--muted-foreground)] md:px-8">
            <div className="font-mono uppercase tracking-[0.18em]">
              Omega Markets · Design System v1
            </div>
            <p>
              Anchored to{" "}
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/visual-identity.md"
                className="underline underline-offset-4 hover:text-[var(--foreground)]"
              >
                omega-docs/03-brand/visual-identity.md
              </a>
              . Tracked under the{" "}
              <a
                href="https://github.com/TheChainlessLabs/omega-interface/milestones"
                className="underline underline-offset-4 hover:text-[var(--foreground)]"
              >
                design-V2 milestone
              </a>
              .
            </p>
          </div>
        </footer>
      </main>
    </TooltipProvider>
  );
}

function Hero() {
  return (
    <header className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 py-24 md:py-32">
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
          aria-hidden
        >
          <OmegaMark size={40} />
        </motion.div>
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--muted-foreground)]">
          Design System · v1
        </span>
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          Design <span className="font-serif text-[var(--muted-foreground)]">System</span>
        </h1>
        <p className="max-w-xl font-serif text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
          Primitives, tokens, and the rules that hold them together.
        </p>
      </motion.div>
    </header>
  );
}

function ColumnLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <ColumnLabel>{label}</ColumnLabel>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

const VARIANT_DESCRIPTIONS: Record<
  "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
  string
> = {
  default: "Primary action · one per surface",
  destructive: "Danger · cancel, withdraw, disconnect",
  outline: "Secondary action · same row as primary",
  secondary: "Quiet alternative · in-card actions",
  ghost: "Tertiary · toolbar, dense menus",
  link: "Inline navigation · within copy",
};

function GlassRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 py-6 md:grid-cols-[12rem_1fr_1fr]">
      <div className="flex flex-col gap-1">
        <ColumnLabel>{label}</ColumnLabel>
        <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          solid · glass
        </span>
      </div>
      {/* Solid column. Wrapped in a same-shape well so the comparison is
          honest geometry rather than visual sleight-of-hand. */}
      <div className="flex min-h-[7rem] flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 p-4">
        {Array.isArray(children)
          ? (children as ReactNode[])[0]
          : children}
      </div>
      {/* Glass column. The MidpointTape substrate gives the material real
          data to refract — see omega-docs/03-brand/visual-identity.md. */}
      {Array.isArray(children) ? (children as ReactNode[])[1] : null}
    </div>
  );
}

function GlassWell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[7rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
      <MidpointTape />
      <div className="relative flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}

function ButtonRow({
  variant,
}: {
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 py-6 md:grid-cols-[12rem_1fr]">
      <div className="flex flex-col gap-1">
        <ColumnLabel>{variant}</ColumnLabel>
        <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          {VARIANT_DESCRIPTIONS[variant]}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant} size="default">
            Default
          </Button>
          <Button variant={variant} size="lg">
            Large
          </Button>
          <Button variant={variant} size="icon" aria-label="Add">
            <Plus />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 opacity-100">
          <Button variant={variant} size="sm" disabled>
            Small
          </Button>
          <Button variant={variant} size="default" disabled>
            Default
          </Button>
          <Button variant={variant} size="lg" disabled>
            Large
          </Button>
          <Button variant={variant} size="icon" disabled aria-label="Add disabled">
            <Plus />
          </Button>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            disabled
          </span>
        </div>
      </div>
    </div>
  );
}
