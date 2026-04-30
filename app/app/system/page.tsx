"use client";

import { motion, MotionConfig } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Lock,
  LogOut,
  Plus,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Section } from "@/components/Section";
import { SectionNav } from "@/components/SectionNav";
import { ReviewNav } from "@/components/ReviewNav";
import { OmegaMark } from "@/components/OmegaMark";
import { MidpointTape } from "@/components/MidpointTape";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Animate, AnimatePresence } from "@/components/ui/animate";
import { Badge } from "@/components/ui/badge";
import { Status, type StatusState } from "@/components/ui/status";
import { type LucideIcon } from "lucide-react";
import { Icon } from "@/lib/icons";
import { DisconnectedState } from "@/components/DisconnectedState";
import { NotFoundContents } from "@/components/NotFoundContents";
import {
  ConnectWalletModal,
  DepositModal,
  EmailSignupModal,
  OrderConfirmationModal,
  WithdrawModal,
  type ConnectWalletState,
  type DepositState,
  type EmailSignupState,
  type OrderConfirmationState,
  type WithdrawState,
} from "@/components/modals";

// Section ordering follows a deliberate narrative:
//   - Foundation sets the rules.
//   - Buttons, Inputs, Form: form-y inputs together.
//   - Cards, Glass: surfaces together.
//   - Tabs, Dropdown, Tooltip: navigation/context.
//   - Dialog, Sheet/Drawer: modal moments.
//   - Toggle, Toast, Status: feedback / binary state.
//   - Separator, Icons, Motion: utilities last.
//   - Modals: M3.6 production modals composing the M2 primitives.
//   - Conventions closes the loop with class/token reference.
const SECTIONS = [
  { id: "foundation", number: "01", label: "Foundation" },
  { id: "buttons", number: "02", label: "Buttons" },
  { id: "inputs", number: "03", label: "Inputs" },
  { id: "form", number: "04", label: "Form" },
  { id: "cards", number: "05", label: "Cards" },
  { id: "glass-variants", number: "06", label: "Glass" },
  { id: "tabs", number: "07", label: "Tabs" },
  { id: "dropdown", number: "08", label: "Dropdown" },
  { id: "tooltip", number: "09", label: "Tooltip" },
  { id: "dialog", number: "10", label: "Dialog" },
  { id: "sheet", number: "11", label: "Sheet" },
  { id: "toggle", number: "12", label: "Toggle" },
  { id: "toast", number: "13", label: "Toast" },
  { id: "status", number: "14", label: "Status" },
  { id: "separator", number: "15", label: "Separator" },
  { id: "icons", number: "16", label: "Icons" },
  { id: "motion", number: "17", label: "Motion" },
  { id: "empty-states", number: "18", label: "Empty + 404" },
  { id: "modals", number: "19", label: "Modals" },
  { id: "conventions", number: "20", label: "Conventions" },
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
        <ReviewNav />
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
              — reach for /system when you want a fast visual sweep, reach for
              Storybook (<InlineCode>pnpm storybook</InlineCode>) when you need
              isolated states and visual regression.
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
                <InlineCode>app/globals.css</InlineCode> and re-exposed to
                Tailwind through the <InlineCode>@theme inline</InlineCode>{" "}
                block. Any primitive on this page resolves through that chain.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <ColumnLabel>Class-merge helper</ColumnLabel>
              <CodeBlock
                code={`// app/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}
              />
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                Every primitive here calls <InlineCode>cn()</InlineCode> to merge
                variant classes with caller overrides — duplicates collapse,
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
          id="form"
          number="04"
          label="Form"
          title={
            <>
              react-hook-form + zod.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Errors carry what-next.
              </span>
            </>
          }
          description={
            <>
              Form is the shadcn primitive — composed Label, Input, Description,
              Message — wired to <InlineCode>react-hook-form</InlineCode> and{" "}
              <InlineCode>zod</InlineCode>. Microcopy follows{" "}
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/messaging.md"
                className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
              >
                omega-docs/03-brand/messaging.md
              </a>{" "}
              — error format{" "}
              <span className="font-serif text-[var(--foreground)]">
                [What happened.] [What to do next.]
              </span>
              . Validation defaults: validate on submit, re-validate on blur per
              field after the first attempt.
            </>
          }
        >
          <FormShowcase />
        </Section>

        <Section
          id="cards"
          number="05"
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
          id="glass-variants"
          number="06"
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
              reads honestly. Both fall back to a solid muted surface for{" "}
              <InlineCode>prefers-reduced-transparency</InlineCode> and missing{" "}
              <InlineCode>backdrop-filter</InlineCode> support.
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

        <Section
          id="tabs"
          number="07"
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
          id="dialog"
          number="10"
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
          id="sheet"
          number="11"
          label="Sheet · Drawer"
          title={
            <>
              Side panel + mobile drawer.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Two primitives, two contexts.
              </span>
            </>
          }
          description={
            <>
              <span className="font-serif text-[var(--foreground)]">Sheet</span>{" "}
              is the desktop side panel — Radix Dialog with side-slide variants,
              max 480 px wide, slides from left/right/top/bottom. Used for
              settings, filters, secondary navigation.{" "}
              <span className="font-serif text-[var(--foreground)]">Drawer</span>{" "}
              is the mobile bottom drawer — vaul-based, drag-to-dismiss, spring
              snap. Used in a phone-shaped frame so the demo reads at the actual
              dimensions a user holds.
            </>
          }
        >
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Sheet — desktop side panel */}
            <div className="flex flex-col gap-3">
              <SubsectionLabel>Sheet · desktop side panel</SubsectionLabel>
              <div className="flex flex-wrap gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Right</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Refine the order book by side, size, venue, and status.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Left</Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Pairs</SheetTitle>
                      <SheetDescription>
                        Switch between the five launch pairs.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Bottom</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Bottom panel</SheetTitle>
                      <SheetDescription>
                        Anchored to the bottom edge — full-width on desktop, capped on tall viewports.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                Constrained to <InlineCode>max-w-[480px]</InlineCode> on
                left/right; full-width on top/bottom. Soft-surface treatment
                (no hard hairline border).
              </p>
            </div>

            {/* Drawer — mobile bottom, in a phone frame */}
            <div className="flex flex-col gap-3">
              <SubsectionLabel>Drawer · mobile bottom (375 × 667)</SubsectionLabel>
              <div className="flex justify-center overflow-x-auto">
                <PhoneFrame>
                  <DrawerInPhone />
                </PhoneFrame>
              </div>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                vaul-based · drag-to-dismiss · spring snap. Shown inside an
                iPhone-shaped frame so the demo reads at actual mobile width.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="toggle"
          number="12"
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
          id="toast"
          number="13"
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
              Toasts use <InlineCode>sonner</InlineCode> and resolve through the
              popover tokens. One factual sentence —{" "}
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
          id="status"
          number="14"
          label="Status"
          title={
            <>
              Brand-lexicon{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                in a pill.
              </span>
            </>
          }
          description={
            <>
              Status is the brand-aware composition of Badge + Icon. The 10
              canonical states map directly to{" "}
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/messaging.md"
                className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
              >
                omega-docs/03-brand/messaging.md
              </a>{" "}
              · Status labels.{" "}
              <span className="font-serif text-[var(--foreground)]">
                Reach for Status, not Badge,
              </span>{" "}
              when the label is one of the canonical lifecycle / connection
              states.
            </>
          }
        >
          <StatusShowcase />
        </Section>

        <Section
          id="separator"
          number="15"
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
          number="16"
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
              Components reference <InlineCode>Icon.Buy</InlineCode>,{" "}
              <InlineCode>Icon.Settled</InlineCode>,{" "}
              <InlineCode>Icon.Proof</InlineCode> — never the underlying Lucide
              glyph. The brand lexicon (
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/naming.md"
                className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
              >
                omega-docs/03-brand/naming.md
              </a>
              ) drives the alias names; the map in{" "}
              <InlineCode>app/lib/icons.tsx</InlineCode> is the only place{" "}
              <span className="font-serif text-[var(--foreground)]">lucide-react</span>{" "}
              is imported. When the brand picks a different glyph for a
              semantic, swap it once there.
            </>
          }
        >
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <SubsectionLabel>Aliases · 24px</SubsectionLabel>
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
              <SubsectionLabel>Sizes · 12 · 14 · 16 · 20 · 24 · 32</SubsectionLabel>
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
              <SubsectionLabel>Color contexts</SubsectionLabel>
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
          id="motion"
          number="17"
          label="Motion"
          title={
            <>
              Five variants.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                One ladder.
              </span>
            </>
          }
          description={
            <>
              Motion lives behind one primitive —{" "}
              <InlineCode>{`<Animate variant="…">`}</InlineCode>. The ladder is
              locked to{" "}
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand/visual-identity.md"
                className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
              >
                omega-docs/03-brand/visual-identity.md
              </a>
              .{" "}
              <span className="font-serif text-[var(--foreground)]">
                Reduced motion is a first-class path
              </span>
              — toggle the simulator to preview it.
            </>
          }
        >
          <MotionShowcase />
        </Section>

        <Section
          id="empty-states"
          number="18"
          label="Empty + 404"
          title={
            <>
              When the surface has{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                nothing to say.
              </span>
            </>
          }
          description={
            <>
              The 404 route and the auth-gated <InlineCode>DisconnectedState</InlineCode>{" "}
              share one voice rule:{" "}
              <span className="font-serif text-[var(--foreground)]">
                what happened, then what to do next.
              </span>{" "}
              Two short sentences, period-terminated. No emoji, no marketing
              fluff. The 404 page lives at <InlineCode>/not-found</InlineCode> and
              auto-renders for any unknown route — preview it here.
            </>
          }
        >
          <EmptyStatesShowcase />
        </Section>

        <Section
          id="modals"
          number="19"
          label="Modals · production"
          title={
            <>
              Four production modals.{" "}
              <span className="font-serif text-[var(--muted-foreground)]">
                Every state, picker-driven.
              </span>
            </>
          }
          description={
            <>
              The M3.6 modal set —{" "}
              <span className="font-serif text-[var(--foreground)]">
                Connect, Deposit, Withdraw, Order
              </span>{" "}
              — composed from the M2 primitives. Pick a state below to walk the
              modal through its lifecycle. Desktop renders a centered Dialog;
              mobile (≤ 768&nbsp;px) renders the vaul Drawer automatically. M3.1
              shell owns the live state machine; here the state is a prop for
              review.
            </>
          }
        >
          <ModalsShowcase />
        </Section>

        <Conventions />

        <footer className="border-t border-[var(--border)] py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 text-xs text-[var(--muted-foreground)] md:px-8">
            <div className="font-mono uppercase tracking-[0.18em]">
              Omega Markets · Design System v1
            </div>
            <p className="leading-relaxed">
              Anchored to{" "}
              <a
                href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand"
                className="underline underline-offset-4 hover:text-[var(--foreground)]"
              >
                omega-docs/03-brand
              </a>
              . Run isolated states locally with{" "}
              <InlineCode>pnpm storybook</InlineCode> — every primitive on this
              page has a matching <InlineCode>*.stories.tsx</InlineCode>.
              Tracked under the{" "}
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
          className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
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

// Subsection label — the consistent <h3> heading used inside every section's
// inner groups (Aliases / Sizes / Color contexts in Icons, Sheet / Drawer in
// the modal section, etc). Same visual recipe as ColumnLabel but rendered as
// a heading element so the page outline reads correctly to AT.
function SubsectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
      {children}
    </h3>
  );
}

// Inline code — single-token references like Icon.Buy, --background, cn().
// Uses the soft `bg-muted/50` + small horizontal padding recipe so the token
// reads as a chip without dominating the surrounding sentence.
function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-[var(--muted)]/50 px-1 font-mono text-xs text-[var(--foreground)]">
      {children}
    </code>
  );
}

// Code block — multi-line snippet with copy-to-clipboard affordance. Uses the
// same `pop` motion tap feedback as the Swatch component so the copy gesture
// reads identically across the page.
function CodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="absolute right-2 top-2 z-10 inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]/85 px-2 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] opacity-0 backdrop-blur-sm transition-opacity hover:text-[var(--foreground)] focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? (
          <>
            <Icon.Confirm size={11} className="text-[var(--success)]" aria-hidden />
            copied
          </>
        ) : (
          <>
            <Icon.Copy size={11} aria-hidden />
            copy
          </>
        )}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--foreground)]">
        <code>{code}</code>
      </pre>
    </div>
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

function MotionShowcase() {
  // The simulator wraps the demo blocks in <MotionConfig reducedMotion="always">
  // so designers reviewing the page can flip into reduced-motion without
  // touching their OS preference. The hook inside <Animate> reads from this
  // context, so the toggle is real — not a visual fake.
  const [simulateReduced, setSimulateReduced] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <ColumnLabel>API</ColumnLabel>
        <CodeBlock
          code={`import { Animate, AnimatePresence } from "@/components/ui/animate";

<Animate variant="enter" delay={0.1}>
  <Card>…</Card>
</Animate>

<AnimatePresence>
  {open && <Animate variant="exit" key="x">…</Animate>}
</AnimatePresence>`}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 self-start rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-xs">
        <input
          type="checkbox"
          checked={simulateReduced}
          onChange={(e) => setSimulateReduced(e.target.checked)}
          className="accent-[var(--foreground)]"
        />
        <span className="font-mono uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Simulate prefers-reduced-motion
        </span>
      </label>

      <MotionConfig reducedMotion={simulateReduced ? "always" : "user"}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <MotionDemoCard label="enter · 200ms ease-out">
            <EnterExitDemo />
          </MotionDemoCard>
          <MotionDemoCard label="exit · 150ms ease-in">
            <EnterExitDemo flavor="exit" />
          </MotionDemoCard>
          <MotionDemoCard label="expand · 250ms ease-out">
            <ExpandDemo />
          </MotionDemoCard>
          <MotionDemoCard label="pop · 100ms ease-out">
            <PopDemo />
          </MotionDemoCard>
          <MotionDemoCard label="drawer · spring (360/32/0.9)" full>
            <DrawerDemo />
          </MotionDemoCard>
        </div>
      </MotionConfig>
    </div>
  );
}

function MotionDemoCard({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/40 p-5 ${full ? "md:col-span-2" : ""}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--foreground)]">
        {label}
      </span>
      <div className="flex min-h-[7rem] items-center justify-center rounded-[var(--radius-md)] bg-[var(--background)] p-4">
        {children}
      </div>
    </div>
  );
}

function EnterExitDemo({ flavor = "enter" }: { flavor?: "enter" | "exit" }) {
  const [shown, setShown] = useState(true);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Button variant="outline" size="sm" onClick={() => setShown((s) => !s)}>
        {shown ? "Hide" : "Show"}
      </Button>
      <div className="flex h-16 w-full items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          {shown && (
            <Animate
              key={flavor}
              variant={flavor}
              className="flex h-12 w-40 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)]"
            >
              {flavor}
            </Animate>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExpandDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="self-start"
      >
        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open ? "Collapse" : "Expand"}
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <Animate variant="expand" key="panel">
            <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 text-xs leading-relaxed text-[var(--muted-foreground)]">
              Match at midpoint. Internal liquidity is matched first inside the
              TEE; the residual routes to a bonded solver, then to external
              aggregators if needed.
            </p>
          </Animate>
        )}
      </AnimatePresence>
    </div>
  );
}

function PopDemo() {
  return (
    <Animate variant="pop">
      <Button>Press me</Button>
    </Animate>
  );
}

function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer · spring</DrawerTitle>
          <DrawerDescription>
            Vaul carries the spring physics natively. The{" "}
            <InlineCode>drawer</InlineCode> variant is the JS counterpart for
            non-vaul surfaces.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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

const STATUS_ROWS: ReadonlyArray<{ state: StatusState; description: string }> = [
  { state: "pending", description: "Order accepted, queued for the next batch." },
  { state: "submitting", description: "Order in flight to the gateway. Pre-signature." },
  { state: "awaiting-signature", description: "EIP-712 prompt is open in the wallet." },
  { state: "matched", description: "Filled at midpoint inside the TEE-attested CLOB." },
  { state: "settled", description: "Batch sealed and confirmed onchain on L1." },
  { state: "proven", description: "Settlement carries an SP1 / TEE proof, verifiable." },
  { state: "cancelled", description: "User-cancelled before the batch sealed." },
  { state: "failed", description: "Match or settle failed. Error copy carries what-next." },
  { state: "connected", description: "Wallet connected on the expected chain." },
  { state: "wrong-network", description: "Wallet is on a chain Omega doesn't support." },
] as const;

function StatusShowcase() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <SubsectionLabel>States · 10 canonical</SubsectionLabel>
        <div className="grid grid-cols-1 divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30">
          {STATUS_ROWS.map(({ state, description }) => (
            <div
              key={state}
              className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-[10rem_10rem_1fr]"
            >
              <Status state={state} />
              <code className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--foreground)]">
                {state}
              </code>
              <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                {description}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SubsectionLabel>Glass · for order form & sheets</SubsectionLabel>
        <GlassWell>
          <div className="flex flex-wrap items-center gap-2">
            <Status state="awaiting-signature" glass />
            <Status state="matched" glass />
            <Status state="settled" glass />
            <Status state="connected" glass />
            <Status state="wrong-network" glass />
          </div>
        </GlassWell>
      </div>

      <div className="flex flex-col gap-4">
        <SubsectionLabel>Live transition · pending → matched → settled</SubsectionLabel>
        <StatusTransitionDemo />
      </div>

      <div className="flex flex-col gap-4">
        <SubsectionLabel>Badge · generic primitive (no warning yet — tokens)</SubsectionLabel>
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 p-4">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">
            <Badge.Dot />
            With dot
          </Badge>
        </div>
        <GlassWell>
          <Badge variant="glass">Glass</Badge>
        </GlassWell>
      </div>

      <div className="flex flex-col gap-3">
        <ColumnLabel>API</ColumnLabel>
        <CodeBlock
          code={`<Status state="settled" />
<Status state="matched" glass />
<Badge variant="success">Live</Badge>`}
        />
      </div>
    </div>
  );
}

function StatusTransitionDemo() {
  const SEQUENCE: StatusState[] = ["pending", "matched", "settled"];
  const [step, setStep] = useState(0);

  // Auto-advance every 1.6s so the page does the demo for you, but expose
  // a button so reviewers can trigger transitions manually.
  useEffect(() => {
    const t = setTimeout(() => setStep((s) => (s + 1) % SEQUENCE.length), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const state = SEQUENCE[step]!;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 p-6">
      <Status state={state} />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setStep((s) => (s + 1) % SEQUENCE.length)}
      >
        Advance
        <ArrowRight />
      </Button>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {SEQUENCE.map((s, i) => (i === step ? `[${s}]` : s)).join(" · ")}
      </span>
    </div>
  );
}

// --- Form showcase --------------------------------------------------------

// Schema lives at module scope so the snippet shown in the demo is the
// literal source the live form uses. Error messages follow the brand
// microcopy pattern: [What happened.] [What to do next.] — see
// omega-docs/03-brand/messaging.md.
const formDemoSchema = z.object({
  wallet: z
    .string()
    .min(1, "Wallet required. Connect or paste a 0x address.")
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid wallet address. Use a 0x-prefixed 40-char hex address."
    ),
  amount: z
    .string()
    .min(1, "Amount required. Enter a positive number.")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: "Invalid amount. Use a positive number.",
    }),
  memo: z
    .string()
    .max(64, "Memo too long. Keep it under 64 characters.")
    .optional(),
});
type FormDemoSchema = z.infer<typeof formDemoSchema>;

const FORM_DEMO_SNIPPET = `import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormDescription,
  FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/,
    "Invalid wallet address. Use a 0x-prefixed 40-char hex address."),
  amount: z.string().refine((v) => Number(v) > 0,
    "Invalid amount. Use a positive number."),
  memo: z.string().max(64).optional(),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { wallet: "", amount: "", memo: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="amount" render={({ field }) => (
      <FormItem>
        <FormLabel required>Amount</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormDescription>Settled in the next batch.</FormDescription>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>`;

function FormShowcase() {
  const [submitted, setSubmitted] = useState<null | "ok">(null);
  const form = useForm<FormDemoSchema>({
    resolver: zodResolver(formDemoSchema),
    defaultValues: { wallet: "", amount: "", memo: "" },
    // Documenting the brand defaults — these are also the react-hook-form
    // defaults, kept explicit so consumers don't have to read the source.
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const submitting = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Live demo */}
        <div className="flex flex-col gap-4">
          <SubsectionLabel>Live demo · pristine → error → submit</SubsectionLabel>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  // The form doesn't actually submit anywhere in the
                  // showcase — log + transient settled status, then reset.
                  // eslint-disable-next-line no-console
                  console.log("Form submitted:", values);
                  await new Promise((r) => setTimeout(r, 400));
                  setSubmitted("ok");
                  setTimeout(() => {
                    setSubmitted(null);
                    form.reset();
                  }, 1500);
                })}
                className="flex flex-col gap-5"
              >
                <FormField
                  control={form.control}
                  name="wallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Wallet address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x…" {...field} />
                      </FormControl>
                      <FormDescription>
                        EOA on the Omega-supported chain.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="10,000.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Settled at midpoint in the next batch.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional · max 64 chars"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Visible in your fill history. Not seen by counterparties.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit"}
                  </Button>
                  {submitting ? <Status state="submitting" /> : null}
                  {submitted === "ok" ? <Status state="settled" /> : null}
                </div>
              </form>
            </Form>
          </div>
          <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            Try submit-empty to surface errors. Errors render with{" "}
            <InlineCode>Icon.Failed</InlineCode> and a soft enter motion. The
            required indicator on the label is the Linear-style accent dot,
            not an asterisk.
          </p>
        </div>

        {/* Static state matrix — pristine, focused, error, description, disabled */}
        <div className="flex flex-col gap-4">
          <SubsectionLabel>States · static</SubsectionLabel>
          <div className="grid grid-cols-1 gap-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 p-6">
            <FormStateExample label="Pristine">
              <Label htmlFor="form-pristine">Wallet address</Label>
              <Input id="form-pristine" placeholder="0x…" />
            </FormStateExample>
            <FormStateExample label="Focused">
              <Label htmlFor="form-focused">Amount</Label>
              <Input
                id="form-focused"
                placeholder="10,000.00"
                defaultValue="10,000.00"
              />
            </FormStateExample>
            <FormStateExample label="With description">
              <Label htmlFor="form-described">Memo</Label>
              <Input id="form-described" placeholder="Optional" />
              <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                Visible in your fill history. Not seen by counterparties.
              </span>
            </FormStateExample>
            <FormStateExample label="With error">
              <Label
                htmlFor="form-error"
                className="inline-flex items-center gap-1.5 text-[var(--destructive)]"
              >
                <span>Wallet address</span>
                <span
                  aria-hidden
                  className="inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--destructive)]"
                />
              </Label>
              <Input
                id="form-error"
                defaultValue="0x42"
                aria-invalid="true"
                className="border-[var(--destructive)] focus-visible:ring-[var(--destructive)]"
              />
              <span className="inline-flex items-start gap-1.5 text-xs leading-relaxed text-[var(--destructive)]">
                <Icon.Failed size={12} aria-hidden className="mt-0.5 shrink-0" />
                <span>
                  Invalid wallet address. Use a 0x-prefixed 40-char hex address.
                </span>
              </span>
            </FormStateExample>
            <FormStateExample label="Disabled">
              <Label htmlFor="form-disabled">Slippage</Label>
              <Input id="form-disabled" defaultValue="0.10%" disabled />
            </FormStateExample>
            <FormStateExample label="Submitting">
              <div className="flex items-center gap-3">
                <Button disabled>Submitting…</Button>
                <Status state="submitting" />
              </div>
            </FormStateExample>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SubsectionLabel>API · schema + Form</SubsectionLabel>
        <CodeBlock code={FORM_DEMO_SNIPPET} />
        <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          Validation defaults: <InlineCode>mode: &quot;onSubmit&quot;</InlineCode>{" "}
          + <InlineCode>reValidateMode: &quot;onBlur&quot;</InlineCode>. First
          submit decides per-field whether errors stick; after that, each field
          re-validates on blur. Override at the{" "}
          <InlineCode>useForm()</InlineCode> call site if a surface needs
          different timing.
        </p>
      </div>
    </div>
  );
}

function FormStateExample({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </div>
  );
}

/* —— Section 18 · Conventions ——————————————————————————————————————————
   Final reference section — the engineer-facing close-out. Every other
   section demonstrates a primitive; this one consolidates the cross-cutting
   rules (utility classes, CSS tokens, import paths, doc anchors) in one
   place so a contributor lands on /system, scrolls once, and has every
   handle they need to start composing the UI without a second tab.
*/

const UTILITY_CLASSES: Array<{ name: string; description: ReactNode }> = [
  {
    name: ".glass",
    description:
      "Liquid-glass surface (24px blur). Order form, modals, sheets, settlement status. Falls back to solid muted under prefers-reduced-transparency.",
  },
  {
    name: ".glass-pill",
    description:
      "Tighter-blur (16px) glass for component-scale chrome — pills, chips, ticker badges. Same fallback path as .glass.",
  },
  {
    name: ".surface-soft",
    description:
      "Diffuse drop + faint inner ring. Use on compact menus (DropdownMenu, Tooltip, Popover) instead of a hard 1px hairline.",
  },
  {
    name: ".font-tabular",
    description:
      "font-variant-numeric: tabular-nums. Lock to numeric columns so digits don't dance.",
  },
  {
    name: ".font-serif",
    description:
      "Source Serif 4 italic. Editorial moments only — hero ledes, section ledes, naming italic specimen. Never on data or labels.",
  },
];

const COLOR_TOKENS: Array<{ name: string; description: string }> = [
  { name: "--background", description: "Page surface — zinc-950 / zinc-50." },
  { name: "--foreground", description: "Primary text — zinc-50 / zinc-950." },
  { name: "--muted", description: "Quiet panels, disabled chrome — zinc-900 / zinc-100." },
  { name: "--muted-foreground", description: "Quiet text, captions — zinc-400 / zinc-500." },
  { name: "--card / --popover", description: "Card / popover surface (= --background in v1)." },
  { name: "--primary / --primary-foreground", description: "Primary action button fill + label." },
  { name: "--secondary / --secondary-foreground", description: "Secondary action button fill + label." },
  { name: "--accent / --accent-foreground", description: "Hover/active accent — same family as --secondary." },
  { name: "--border / --input", description: "Hairlines + input border. zinc-800 / zinc-200." },
  { name: "--ring", description: "Focus ring colour — zinc-300 / zinc-950." },
  { name: "--success", description: "Confirmations, proof-verified, buy side. emerald." },
  { name: "--destructive", description: "Errors, danger, sell side. red." },
  { name: "--glass-fill / --glass-edge / --glass-highlight", description: "Glass material RGBA stops." },
];

const FONT_TOKENS: Array<{ name: string; description: string }> = [
  { name: "--font-sans", description: "Geist Sans — body, headings, labels." },
  { name: "--font-mono", description: "Geist Mono — data plane, numerics, captions, tags." },
  { name: "--font-serif", description: "Source Serif 4 italic — editorial moments only." },
];

const RADIUS_TOKENS: Array<{ name: string; description: string }> = [
  { name: "--radius-sm", description: "6px — chips, micro-pills." },
  { name: "--radius-md", description: "10px — buttons, inputs, code blocks." },
  { name: "--radius-lg", description: "14px — cards, sheets, larger surfaces." },
  { name: "--radius-xl", description: "20px — order form, settlement, hero specimen-pieces." },
  { name: "--radius-2xl", description: "24px — outermost framing on /brand showcase wells (legacy carve-out)." },
  { name: "--radius-full", description: "9999px — circular controls." },
];

const MOTION_TOKENS: Array<{ name: string; description: string }> = [
  { name: "--duration-press", description: "100ms — tap feedback, pop variant." },
  { name: "--duration-small", description: "150ms — exit, dismissal." },
  { name: "--duration-medium", description: "200ms — enter, default." },
  { name: "--duration-large", description: "250ms — expand, accordion." },
  { name: "--ease-out", description: "cubic-bezier(0.16, 1, 0.3, 1) — entrances." },
  { name: "--ease-in", description: "cubic-bezier(0.7, 0, 1, 0.5) — dismissals." },
  { name: "--ease-inout", description: "cubic-bezier(0.4, 0, 0.2, 1) — symmetric transitions." },
  { name: "--shadow-soft", description: "Diffuse drop — used by .surface-soft, soft-shadow buttons." },
  { name: "--surface-edge", description: "Inner-ring tint — paired with --shadow-soft on soft surfaces." },
];

const IMPORT_PATHS: Array<{ path: string; description: ReactNode }> = [
  {
    path: '@/components/ui/<name>',
    description: (
      <>
        Every primitive — Button, Input, Card, Tabs, Toggle, Dialog,
        DropdownMenu, Tooltip, Sheet, Drawer, Toast (sonner), Separator,
        Chip, Badge, Status, Form, Animate. Each ships beside a{" "}
        <InlineCode>*.stories.tsx</InlineCode>.
      </>
    ),
  },
  {
    path: '@/lib/icons',
    description: (
      <>
        The <InlineCode>Icon</InlineCode> alias map — semantic names over
        Lucide. Components import from here, never from{" "}
        <InlineCode>lucide-react</InlineCode>.
      </>
    ),
  },
  {
    path: '@/lib/utils',
    description: (
      <>
        The <InlineCode>cn()</InlineCode> class-merge helper —
        clsx + tailwind-merge, last-wins.
      </>
    ),
  },
  {
    path: '@/components/ui/animate',
    description: (
      <>
        <InlineCode>{"<Animate variant=\"…\">"}</InlineCode> + re-exported{" "}
        <InlineCode>AnimatePresence</InlineCode>. The only sanctioned motion
        entry-point in design-V2.
      </>
    ),
  },
];

const WHERE_LIVES: Array<{ name: string; what: ReactNode }> = [
  {
    name: "Brand rules",
    what: (
      <>
        Type, motion, glass, palette, voice, naming —{" "}
        <a
          href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand"
          className="font-mono text-xs text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--muted-foreground)]"
        >
          omega-docs/03-brand
        </a>
        . Upstream source of truth.
      </>
    ),
  },
  {
    name: "Tokens",
    what: (
      <>
        Generated CSS variables —{" "}
        <InlineCode>app/_generated/tokens.css</InlineCode> from{" "}
        <InlineCode>omega-docs/03-brand/assets/tokens.json</InlineCode> via{" "}
        <InlineCode>scripts/sync-tokens.mjs</InlineCode>. Don&rsquo;t hand-edit
        the generated file.
      </>
    ),
  },
  {
    name: "Primitives",
    what: (
      <>
        Implementation —{" "}
        <InlineCode>app/components/ui/&lt;name&gt;.tsx</InlineCode>. Each
        primitive ships with a co-located{" "}
        <InlineCode>&lt;name&gt;.stories.tsx</InlineCode>.
      </>
    ),
  },
  {
    name: "Brand showcase",
    what: (
      <>
        <InlineCode>/brand</InlineCode> — palette, typography, material, voice,
        naming. Taste calls live there.
      </>
    ),
  },
  {
    name: "Design system showcase",
    what: (
      <>
        <InlineCode>/system</InlineCode> (this page) — every primitive in
        context, plus this Conventions reference.
      </>
    ),
  },
  {
    name: "Storybook",
    what: (
      <>
        <InlineCode>pnpm storybook</InlineCode> — isolated states, controls
        addon, future visual-regression baseline (M2.6).
      </>
    ),
  },
];

function Conventions() {
  return (
    <Section
      id="conventions"
      number="19"
      label="Conventions"
      title={
        <>
          The handles for{" "}
          <span className="font-serif text-[var(--muted-foreground)]">
            composing the UI.
          </span>
        </>
      }
      description={
        <>
          Class utilities, CSS tokens, import paths, and where each layer of
          the system lives.{" "}
          <span className="font-serif text-[var(--foreground)]">
            One screen, every reference.
          </span>{" "}
          Bookmark this section.
        </>
      }
    >
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <SubsectionLabel>Class utilities</SubsectionLabel>
          <ReferenceTable
            rows={UTILITY_CLASSES.map((u) => ({
              key: u.name,
              name: u.name,
              description: u.description,
            }))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubsectionLabel>Color tokens</SubsectionLabel>
          <ReferenceTable
            rows={COLOR_TOKENS.map((t) => ({
              key: t.name,
              name: t.name,
              description: t.description,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SubsectionLabel>Font tokens</SubsectionLabel>
            <ReferenceTable
              rows={FONT_TOKENS.map((t) => ({
                key: t.name,
                name: t.name,
                description: t.description,
              }))}
            />
          </div>
          <div className="flex flex-col gap-4">
            <SubsectionLabel>Radius tokens</SubsectionLabel>
            <ReferenceTable
              rows={RADIUS_TOKENS.map((t) => ({
                key: t.name,
                name: t.name,
                description: t.description,
              }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubsectionLabel>Motion + surface tokens</SubsectionLabel>
          <ReferenceTable
            rows={MOTION_TOKENS.map((t) => ({
              key: t.name,
              name: t.name,
              description: t.description,
            }))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubsectionLabel>Import paths</SubsectionLabel>
          <ReferenceTable
            rows={IMPORT_PATHS.map((p) => ({
              key: p.path,
              name: p.path,
              description: p.description,
            }))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubsectionLabel>What lives where</SubsectionLabel>
          <ReferenceTable
            rows={WHERE_LIVES.map((w) => ({
              key: w.name,
              name: w.name,
              description: w.what,
            }))}
          />
        </div>
      </div>
    </Section>
  );
}

function ReferenceTable({
  rows,
}: {
  rows: Array<{ key: string; name: string; description: ReactNode }>;
}) {
  return (
    <div className="flex flex-col divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-1 items-baseline gap-2 px-4 py-3 md:grid-cols-[16rem_1fr] md:gap-6"
        >
          <code className="font-mono text-[11px] text-[var(--foreground)]">
            {row.name}
          </code>
          <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            {row.description}
          </span>
        </div>
      ))}
    </div>
  );
}

/* —— Phone-shaped frame for showing mobile primitives at actual width —— */

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[40px] border-[10px] border-[#0a0a0a] bg-[var(--background)] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)]"
      style={{ width: 375, height: 667 }}
      aria-label="Mobile preview frame"
    >
      {/* notch */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#0a0a0a]" />
      {/* status bar */}
      <div className="pointer-events-none absolute inset-x-0 top-1 z-20 flex items-center justify-between px-6 font-mono text-[10px] tabular-nums text-[var(--foreground)]">
        <span>9:41</span>
        <span>━━━</span>
      </div>
      <div className="relative h-full w-full overflow-hidden">{children}</div>
    </div>
  );
}

function DrawerInPhone() {
  return (
    <div className="flex h-full flex-col items-center justify-end gap-4 bg-gradient-to-b from-[var(--background)] to-[var(--muted)] p-6">
      <div className="flex w-full flex-col gap-3 pb-6 pt-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Mobile preview
        </span>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Tap the button to open the bottom drawer. Drag the handle to dismiss.
        </p>
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="default" className="w-full">
            View order details
          </Button>
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
            <Button>Confirm</Button>
            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* —— Empty + 404 states (M3.7) —— */

function PreviewFrame({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <SubsectionLabel>{caption}</SubsectionLabel>
      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 p-6">
        {children}
      </div>
    </div>
  );
}

function EmptyStatesShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <PreviewFrame caption="404 — /not-found">
        <NotFoundContents />
      </PreviewFrame>
      <PreviewFrame caption="DisconnectedState — default">
        <DisconnectedState onAction={() => toast("Sign up (preview)")} />
      </PreviewFrame>
      <PreviewFrame caption="DisconnectedState — wrong network">
        <DisconnectedState
          title="Unsupported network"
          description="Switch to Ethereum to continue."
          actionLabel="Switch network"
          icon={Icon.Warning}
          onAction={() => toast("Switch network (preview)")}
        />
      </PreviewFrame>
      <PreviewFrame caption="DisconnectedState — no alpha pass">
        <DisconnectedState
          title="Phase-4 alpha pass required"
          description="Connect a wallet that holds the alpha pass NFT."
          actionLabel="Learn more"
          icon={Icon.Info}
          onAction={() => toast("Learn more (preview)")}
        />
      </PreviewFrame>
    </div>
  );
}

/* —— Modals showcase (M3.6) ——————————————————————————————————————————————
 * One block per M3.6 modal. Each block exposes a state picker (Tabs · glass)
 * so the reviewer can cycle through every state without depending on the
 * M3.1 shell wiring. Modals open via a Button trigger; the picked state is
 * passed straight into the modal as a prop.
 * ------------------------------------------------------------------------ */

const CONNECT_STATES: ConnectWalletState[] = [
  "idle",
  "connecting",
  "connected",
  "failed",
  "no-nft-pass",
];
const DEPOSIT_STATES: DepositState[] = [
  "idle",
  "approving",
  "depositing",
  "pending",
  "success",
  "failed",
];
const WITHDRAW_STATES: WithdrawState[] = [
  "idle",
  "signing",
  "pending",
  "success",
  "failed",
];
const ORDER_STATES: OrderConfirmationState[] = [
  "idle",
  "signing",
  "submitting",
  "failed",
];
const EMAIL_SIGNUP_STATES: EmailSignupState[] = [
  "idle",
  "submitting",
  "sent",
  "expired",
  "invalid",
  "already-claimed",
  "not-on-allowlist",
];

function ModalsShowcase() {
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <EmailSignupModalDemo />
      <ConnectModalDemo />
      <DepositModalDemo />
      <WithdrawModalDemo />
      <OrderModalDemo />
    </div>
  );
}

function ModalDemoCard({
  title,
  snippet,
  states,
  current,
  onState,
  children,
}: {
  title: string;
  snippet: string;
  states: readonly string[];
  current: string;
  onState: (state: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
      <div className="flex items-center justify-between">
        <SubsectionLabel>{title}</SubsectionLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          [{current}]
        </span>
      </div>
      <Tabs value={current} onValueChange={onState}>
        <TabsList variant="glass" className="flex-wrap">
          {states.map((s) => (
            <TabsTrigger key={s} value={s} className="text-[11px]">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
      <CodeBlock code={snippet} />
    </div>
  );
}
function EmailSignupModalDemo() {
  const [state, setState] = useState<EmailSignupState>("idle");
  const [open, setOpen] = useState(false);

  return (
    <ModalDemoCard
      title="Email signup (v0)"
      current={state}
      states={EMAIL_SIGNUP_STATES}
      onState={(s) => setState(s as EmailSignupState)}
      snippet={`<EmailSignupModal\n  open\n  state="${state}"\n  email="alpha@omegamarkets.com"\n  onClose={close}\n/>`}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Email signup modal
      </Button>
      <EmailSignupModal
        open={open}
        state={state}
        email="alpha@omegamarkets.com"
        onClose={() => setOpen(false)}
        onSubmit={() => setState("sent")}
      />
    </ModalDemoCard>
  );
}

function ConnectModalDemo() {
  const [state, setState] = useState<ConnectWalletState>("idle");
  const [open, setOpen] = useState(false);

  return (
    <ModalDemoCard
      title="Connect wallet"
      current={state}
      states={CONNECT_STATES}
      onState={(s) => setState(s as ConnectWalletState)}
      snippet={`<ConnectWalletModal\n  open\n  state="${state}"\n  onClose={close}\n/>`}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Connect modal
      </Button>
      <ConnectWalletModal
        open={open}
        state={state}
        activeConnector="MetaMask"
        onClose={() => setOpen(false)}
        onSelectConnector={() => setState("connecting")}
        onRetry={() => setState("connecting")}
      />
    </ModalDemoCard>
  );
}

function DepositModalDemo() {
  const [state, setState] = useState<DepositState>("idle");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("1000.00");

  return (
    <ModalDemoCard
      title="Deposit"
      current={state}
      states={DEPOSIT_STATES}
      onState={(s) => setState(s as DepositState)}
      snippet={`<DepositModal\n  open\n  state="${state}"\n  token="USDC"\n  permitSigned={${state !== "idle" && state !== "approving"}}\n  onClose={close}\n/>`}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Deposit modal
      </Button>
      <DepositModal
        open={open}
        state={state}
        token="USDC"
        amount={amount}
        permitSigned={state !== "idle" && state !== "approving"}
        onAmountChange={setAmount}
        onClose={() => setOpen(false)}
        onSignPermit={() => setState("approving")}
        onSignDeposit={() => setState("depositing")}
        onRetry={() => setState("depositing")}
      />
    </ModalDemoCard>
  );
}

function WithdrawModalDemo() {
  const [state, setState] = useState<WithdrawState>("idle");
  const [open, setOpen] = useState(false);

  return (
    <ModalDemoCard
      title="Withdraw"
      current={state}
      states={WITHDRAW_STATES}
      onState={(s) => setState(s as WithdrawState)}
      snippet={`<WithdrawModal\n  open\n  state="${state}"\n  token="USDC"\n  onSubmit={submit}\n  onClose={close}\n/>`}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Withdraw modal
      </Button>
      <WithdrawModal
        open={open}
        state={state}
        token="USDC"
        onClose={() => setOpen(false)}
        onSubmit={() => setState("signing")}
        onRetry={() => setState("signing")}
      />
    </ModalDemoCard>
  );
}

function OrderModalDemo() {
  const [state, setState] = useState<OrderConfirmationState>("idle");
  const [open, setOpen] = useState(false);

  return (
    <ModalDemoCard
      title="Order confirmation"
      current={state}
      states={ORDER_STATES}
      onState={(s) => setState(s as OrderConfirmationState)}
      snippet={`<OrderConfirmationModal\n  open\n  state="${state}"\n  side="buy"\n  pair="USDC/EURC"\n  mode="limit"\n  amount="10,000.00"\n  price="0.9213"\n  midpoint="0.9213"\n  onClose={close}\n/>`}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Order modal
      </Button>
      <OrderConfirmationModal
        open={open}
        state={state}
        side="buy"
        pair="USDC/EURC"
        mode="limit"
        amount="10,000.00"
        price="0.9213"
        midpoint="0.9213"
        onClose={() => setOpen(false)}
        onConfirm={() => setState("signing")}
        onRetry={() => setState("signing")}
      />
    </ModalDemoCard>
  );
}
