"use client";

/**
 * PortfolioDrilldownSheet — receipt-format side-sheet / drawer (M4.17).
 *
 * Replaces the M4.15 inline accordion on `/portfolio`. Whole-row clicks
 * pop a Sheet on desktop (right-anchored, ~480px wide) or a Drawer on
 * mobile (full-height bottom sheet) carrying a Receipt. Three receipt
 * variants — one per row type (open position / fill / transfer).
 *
 * This file pairs the responsive shell with the per-row receipt content
 * because the content is tightly coupled to portfolio fixture shapes;
 * the reusable primitives are `Sheet`, `Drawer`, and `Receipt`.
 *
 * Synthesis helpers (batch numbers, proof hashes, stage timestamps) are
 * deterministic and fixture-only — M6 will replace them with backend-
 * sourced values.
 */

import * as React from "react";

import { CopyButton } from "@/app/batches/_components/copy-button";
import { EtherscanTxLink } from "@/app/batches/_components/etherscan-link";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import type {
  DepositFixture,
  FillFixture,
  OrderFixture,
  WithdrawalFixture,
} from "@/lib/fixtures";

// TODO: replace with @/components/ui/receipt once M4.16 merges.
import { Receipt } from "./_receipt-local";
import { formatTime, MonoNum, parseNum } from "@/app/portfolio/preview/_variants/_shared";

const PILL = "font-mono text-[10px] uppercase tracking-[0.18em]";
const ETHERSCAN_TX_BASE = "https://etherscan.io/tx";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Public payload — discriminated union, one per row type                     */
/* ────────────────────────────────────────────────────────────────────────── */

export type PortfolioDrilldownPayload =
  | { kind: "order"; order: OrderFixture }
  | { kind: "fill"; fill: FillFixture }
  | { kind: "deposit"; deposit: DepositFixture }
  | { kind: "withdrawal"; withdrawal: WithdrawalFixture };

export interface PortfolioDrilldownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: PortfolioDrilldownPayload | null;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Synthesis helpers — fixture-only, deterministic                            */
/* ────────────────────────────────────────────────────────────────────────── */

function batchNumberFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return 4800 + (Math.abs(hash) % 200);
}

function synthHash(seed: string, prefix = "0x"): `0x${string}` {
  let hash = BigInt(0);
  for (let i = 0; i < seed.length; i++) {
    hash = hash * BigInt(131) + BigInt(seed.charCodeAt(i));
  }
  const base = hash.toString(16).padStart(8, "0");
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += base.slice(i % base.length).padStart(8, "0");
  }
  return `${prefix}${out.slice(0, 64)}` as `0x${string}`;
}

function offsetIso(iso: string, offsetSec: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t + offsetSec * 1000).toISOString();
}

function sideTone(side: "buy" | "sell"): string {
  return side === "buy"
    ? "text-[var(--success)]"
    : "text-[var(--destructive)]";
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Title + body resolution per payload                                        */
/* ────────────────────────────────────────────────────────────────────────── */

function titleFor(payload: PortfolioDrilldownPayload): string {
  switch (payload.kind) {
    case "order":
      return `OPEN ORDER ${payload.order.id}`;
    case "fill":
      return `FILL ${payload.fill.id}`;
    case "deposit":
      return `DEPOSIT ${payload.deposit.id}`;
    case "withdrawal":
      return `WITHDRAWAL ${payload.withdrawal.id}`;
  }
}

function descriptionFor(payload: PortfolioDrilldownPayload): string {
  switch (payload.kind) {
    case "order":
      return `${payload.order.pair} · ${payload.order.side} ${payload.order.type}`;
    case "fill":
      return `${payload.fill.pair} · ${payload.fill.side}`;
    case "deposit":
      return `${payload.deposit.token} deposit`;
    case "withdrawal":
      return `${payload.withdrawal.token} withdrawal`;
  }
}

function ReceiptBody({
  payload,
}: {
  payload: PortfolioDrilldownPayload;
}) {
  switch (payload.kind) {
    case "order":
      return <OrderReceipt order={payload.order} />;
    case "fill":
      return <FillReceipt fill={payload.fill} />;
    case "deposit":
      return <DepositReceipt deposit={payload.deposit} />;
    case "withdrawal":
      return <WithdrawalReceipt withdrawal={payload.withdrawal} />;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Responsive shell                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export function PortfolioDrilldownSheet({
  open,
  onOpenChange,
  payload,
}: PortfolioDrilldownSheetProps) {
  const isDesktop = useIsDesktop();
  // Cache the last non-null payload so the close transition still has
  // something to render while `open` flips false. Clearing immediately
  // would yield a blank flash of the sheet body during the slide-out.
  const lastPayloadRef = React.useRef<PortfolioDrilldownPayload | null>(null);
  if (payload) lastPayloadRef.current = payload;
  const active = payload ?? lastPayloadRef.current;

  if (!active) return null;

  const title = titleFor(active);
  const description = descriptionFor(active);
  const ariaLabel = `${title.toLowerCase()} receipt`;

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          aria-label={ariaLabel}
          className="glass border-l border-[var(--border)] bg-background/0 p-0"
        >
          <div className="flex h-full flex-col gap-3 overflow-y-auto px-6 pb-8 pt-6">
            <SheetHeader className="text-left">
              <SheetTitle className="font-mono text-sm uppercase tracking-[0.18em]">
                {title}
              </SheetTitle>
              <SheetDescription className="font-mono text-xs">
                {description}
              </SheetDescription>
            </SheetHeader>
            <ReceiptBody payload={active} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        aria-label={ariaLabel}
        className="glass h-[100dvh] max-h-[100dvh] rounded-t-[var(--radius-xl)] bg-background/0 pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-mono text-sm uppercase tracking-[0.18em]">
            {title}
          </DrawerTitle>
          <DrawerDescription className="font-mono text-xs">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <ReceiptBody payload={active} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Receipt — open position                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function OrderReceipt({ order }: { order: OrderFixture }) {
  const batchNum = batchNumberFor(order.id);
  const failed = order.status === "failed";
  const cancelled = order.status === "cancelled";

  const signed = !cancelled;
  const queued =
    order.status === "pending" ||
    order.status === "matched" ||
    order.status === "settled" ||
    failed;
  const matched =
    order.status === "matched" || order.status === "settled" || failed;
  const settled = order.status === "settled";

  const filledNum = parseNum(order.amount) * (order.filledPercent / 100);
  const remainingNum = parseNum(order.amount) - filledNum;

  return (
    <Receipt bare>
      <Receipt.Header label={`OPEN ORDER ${order.id}`} />

      <Receipt.Metadata>
        <Receipt.Row label="Pair" value={order.pair} />
        <Receipt.Row
          label="Side"
          value={
            <span className={cn(PILL, sideTone(order.side))}>
              {order.side}
            </span>
          }
        />
        <Receipt.Row
          label="Type"
          value={order.type}
          muted
        />
        <Receipt.Row
          label="Submitted"
          value={formatTime(order.submittedAt)}
          muted
        />
        <Receipt.Row label="Limit" value={order.price} />
      </Receipt.Metadata>

      <Receipt.Actions aria-label="Order lifecycle">
        <Receipt.Action
          index={1}
          label="Sign"
          payload={signed ? formatTime(offsetIso(order.submittedAt, -2)) : null}
          state={signed ? "reached" : "future"}
        />
        <Receipt.Action
          index={2}
          label="Queue"
          payload={queued ? formatTime(order.submittedAt) : null}
          state={queued ? "reached" : "future"}
        />
        <Receipt.Action
          index={3}
          label="Match"
          payload={
            matched ? formatTime(offsetIso(order.submittedAt, 90)) : null
          }
          state={matched ? "reached" : "future"}
        />
        <Receipt.Action
          index={4}
          label="Settle"
          payload={
            settled
              ? formatTime(offsetIso(order.submittedAt, 750))
              : failed
                ? "reverted"
                : null
          }
          state={settled ? "reached" : failed ? "failed" : "future"}
        />
      </Receipt.Actions>

      {failed ? (
        <Receipt.Note>
          Settlement reverted on L1. Fills remain valid offchain — no action
          required.
        </Receipt.Note>
      ) : null}

      <Receipt.Totals>
        <Receipt.Total label="Size" value={order.amount} />
        <Receipt.Total
          label="Filled"
          value={`${filledNum.toFixed(4)} (${order.filledPercent}%)`}
        />
        <Receipt.Total
          label="Remaining"
          value={remainingNum.toFixed(4)}
          emphasis
        />
      </Receipt.Totals>

      <ReceiptOrderIdRow id={order.id} batchNum={batchNum} />
    </Receipt>
  );
}

function ReceiptOrderIdRow({
  id,
  batchNum,
}: {
  id: string;
  batchNum: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[var(--border)] pt-3 text-xs">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
          Order ID
        </span>
        <MonoNum>{id}</MonoNum>
        <CopyButton value={id} label="Copy order ID" />
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
          Batch
        </span>
        <MonoNum className="text-[var(--muted-foreground)]">
          #{batchNum}
        </MonoNum>
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Receipt — recent fill                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function FillReceipt({ fill }: { fill: FillFixture }) {
  const batchNum = batchNumberFor(fill.id);
  const proofHash = synthHash(`${fill.id}-proof`);
  const notional = parseNum(fill.amount) * parseNum(fill.price);
  const fee = notional * 0.0005;
  const net = notional - fee;

  const proven = fill.status === "proven" || fill.status === "settled";
  const settled = fill.status === "settled";

  return (
    <Receipt bare>
      <Receipt.Header label={`FILL ${fill.id}`} />

      <Receipt.Metadata>
        <Receipt.Row label="Pair" value={fill.pair} />
        <Receipt.Row
          label="Side"
          value={
            <span className={cn(PILL, sideTone(fill.side))}>{fill.side}</span>
          }
        />
        <Receipt.Row label="Amount" value={fill.amount} />
        <Receipt.Row label="Price" value={fill.price} />
        <Receipt.Row
          label="Matched at"
          value={formatTime(fill.matchedAt)}
          muted
        />
        <Receipt.Row
          label="Batch"
          value={`#${batchNum}`}
          muted
        />
      </Receipt.Metadata>

      <Receipt.Actions aria-label="Fill lifecycle">
        <Receipt.Action
          index={1}
          label="Queued"
          payload={formatTime(offsetIso(fill.matchedAt, -45))}
          state="reached"
        />
        <Receipt.Action
          index={2}
          label="Sealed"
          payload={formatTime(fill.matchedAt)}
          state="reached"
        />
        <Receipt.Action
          index={3}
          label="Proven"
          payload={
            proven ? formatTime(offsetIso(fill.matchedAt, 240)) : null
          }
          state={proven ? "reached" : "future"}
        />
        <Receipt.Action
          index={4}
          label="Settled"
          payload={
            settled ? formatTime(offsetIso(fill.matchedAt, 720)) : null
          }
          state={settled ? "reached" : "future"}
        />
      </Receipt.Actions>

      <Receipt.Totals>
        <Receipt.Total label="Notional" value={notional.toFixed(4)} />
        <Receipt.Total label="Fee" value={fee.toFixed(4)} />
        <Receipt.Total
          label="Net"
          value={net.toFixed(4)}
          emphasis
        />
      </Receipt.Totals>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[var(--border)] pt-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
            Proof
          </span>
          <EtherscanTxLink hash={proofHash} />
          <CopyButton value={proofHash} label="Copy proof hash" />
        </span>
      </div>

      {fill.txHash ? (
        <Receipt.Footer href={`${ETHERSCAN_TX_BASE}/${fill.txHash}`}>
          View on Etherscan
        </Receipt.Footer>
      ) : null}
    </Receipt>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Receipt — deposit                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function DepositReceipt({ deposit }: { deposit: DepositFixture }) {
  const failed = deposit.status === "failed";
  const completed = deposit.status === "settled";
  const completedIso = completed ? offsetIso(deposit.initiatedAt, 90) : null;

  return (
    <Receipt bare>
      <Receipt.Header label={`DEPOSIT ${deposit.id}`} />

      <Receipt.Metadata>
        <Receipt.Row label="Token" value={deposit.token} />
        <Receipt.Row label="Amount" value={deposit.amount} />
        <Receipt.Row
          label="Initiated"
          value={formatTime(deposit.initiatedAt)}
          muted
        />
        <Receipt.Row
          label="Completed"
          value={completedIso ? formatTime(completedIso) : "—"}
          muted
        />
      </Receipt.Metadata>

      <Receipt.Actions aria-label="Deposit lifecycle">
        <Receipt.Action
          index={1}
          label="Initiated"
          payload={formatTime(deposit.initiatedAt)}
          state="reached"
        />
        <Receipt.Action
          index={2}
          label="Confirmed"
          payload={
            !failed && (deposit.status === "settled" || deposit.status === "pending")
              ? formatTime(offsetIso(deposit.initiatedAt, 60))
              : failed
                ? "reverted"
                : null
          }
          state={
            failed
              ? "failed"
              : deposit.status === "settled" || deposit.status === "pending"
                ? "reached"
                : "future"
          }
        />
        <Receipt.Action
          index={3}
          label="Credited"
          payload={completedIso ? formatTime(completedIso) : null}
          state={completed ? "reached" : "future"}
        />
      </Receipt.Actions>

      {failed ? (
        <Receipt.Note>
          Deposit reverted on L1. Funds returned to the source address.
        </Receipt.Note>
      ) : null}

      <Receipt.Totals>
        <Receipt.Total label="Amount" value={deposit.amount} emphasis />
        <Receipt.Total label="Network fee" value="—" />
      </Receipt.Totals>

      <Receipt.Footer href={`${ETHERSCAN_TX_BASE}/${deposit.txHash}`}>
        View on Etherscan
      </Receipt.Footer>
    </Receipt>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Receipt — withdrawal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function WithdrawalReceipt({
  withdrawal,
}: {
  withdrawal: WithdrawalFixture;
}) {
  const failed = withdrawal.status === "failed";
  const completed = withdrawal.status === "settled";
  const completedIso = completed
    ? offsetIso(withdrawal.initiatedAt, 720)
    : null;

  const signed = withdrawal.status !== "awaiting-signature";
  const queued =
    withdrawal.status === "pending" ||
    withdrawal.status === "settled" ||
    failed;
  const sealed = queued;
  const anchored = completed || failed;

  return (
    <Receipt bare>
      <Receipt.Header label={`WITHDRAWAL ${withdrawal.id}`} />

      <Receipt.Metadata>
        <Receipt.Row label="Token" value={withdrawal.token} />
        <Receipt.Row label="Amount" value={withdrawal.amount} />
        <Receipt.Row
          label="Initiated"
          value={formatTime(withdrawal.initiatedAt)}
          muted
        />
        <Receipt.Row
          label="Completed"
          value={completedIso ? formatTime(completedIso) : "—"}
          muted
        />
      </Receipt.Metadata>

      <Receipt.Actions aria-label="Withdrawal lifecycle">
        <Receipt.Action
          index={1}
          label="Initiated"
          payload={
            signed ? formatTime(offsetIso(withdrawal.initiatedAt, -3)) : null
          }
          state={signed ? "reached" : "future"}
        />
        <Receipt.Action
          index={2}
          label="Sealed"
          payload={sealed ? formatTime(withdrawal.initiatedAt) : null}
          state={sealed ? "reached" : "future"}
        />
        <Receipt.Action
          index={3}
          label="Anchored"
          payload={
            anchored
              ? completedIso
                ? formatTime(completedIso)
                : "reverted"
              : null
          }
          state={
            failed ? "failed" : anchored ? "reached" : "future"
          }
        />
        <Receipt.Action
          index={4}
          label="Withdrawn"
          payload={completedIso ? formatTime(completedIso) : null}
          state={completed ? "reached" : "future"}
        />
      </Receipt.Actions>

      {failed ? (
        <Receipt.Note>
          Withdrawal reverted on L1. Balance restored to the omega ledger.
        </Receipt.Note>
      ) : null}

      <Receipt.Totals>
        <Receipt.Total
          label="Amount"
          value={withdrawal.amount}
          emphasis
        />
        <Receipt.Total label="Network fee" value="—" />
      </Receipt.Totals>

      {withdrawal.txHash ? (
        <Receipt.Footer
          href={`${ETHERSCAN_TX_BASE}/${withdrawal.txHash}`}
        >
          View on Etherscan
        </Receipt.Footer>
      ) : null}
    </Receipt>
  );
}
