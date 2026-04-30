import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Receipt } from "./receipt";

const meta: Meta<typeof Receipt> = {
  title: "Primitives/Receipt",
  component: Receipt,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Receipt>;

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="w-[420px] max-w-full">{children}</div>;
}

export function renderOrderPreviewReceipt() {
  return (
    <Frame>
      <Receipt>
        <Receipt.Header label="ORDER PREVIEW" />
        <Receipt.Metadata>
          <Receipt.Row label="Pair" value="USDC/EURC" />
          <Receipt.Row label="Side" value="Buy" />
          <Receipt.Row label="Type" value="Limit" />
          <Receipt.Row label="Submitted at" value="2026-04-30 09:12:44 UTC" />
          <Receipt.Row label="Available" value="10,000.00 USDC" />
        </Receipt.Metadata>
        <Receipt.Actions>
          <Receipt.Action number={1} label="Sign" payload="Wallet approval" />
          <Receipt.Action number={2} label="Queue" payload="Next batch" />
          <Receipt.Action number={3} label="Match" payload="Private midpoint" />
          <Receipt.Action number={4} label="Settle" payload="Batch finality" />
        </Receipt.Actions>
        <Receipt.Totals>
          <Receipt.Row label="Amount" value="10,000.00 USDC" />
          <Receipt.Row label="Fee" value="0.50 USDC" />
          <Receipt.Row label="Net" value="9,999.50 USDC" />
        </Receipt.Totals>
        <p className="px-4 pb-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
          Matches privately at midpoint.
        </p>
      </Receipt>
    </Frame>
  );
}

export function renderSettlementRecordReceipt() {
  return (
    <Frame>
      <Receipt
        cta={{
          label: "View transaction",
          href: "https://etherscan.io/tx/0xa26f2dc8ed22d65ad5e5b3acc40295d89c331fd1e79d34b13baa3f6f47b136dc",
        }}
      >
        <Receipt.Header label="SETTLEMENT RECORD" />
        <Receipt.Metadata>
          <Receipt.Row label="Batch" value="#2048" />
          <Receipt.Row label="Pair" value="USDC/EURC" />
          <Receipt.Row
            label="Settlement tx"
            value={{
              display: "0xa26f…36dc",
              full: "0xa26f2dc8ed22d65ad5e5b3acc40295d89c331fd1e79d34b13baa3f6f47b136dc",
              etherscan:
                "https://etherscan.io/tx/0xa26f2dc8ed22d65ad5e5b3acc40295d89c331fd1e79d34b13baa3f6f47b136dc",
            }}
          />
          <Receipt.Row label="Settled at" value="2026-04-30 09:16:12 UTC" />
          <Receipt.Row label="Operator" value="Omega Batch 12" />
        </Receipt.Metadata>
        <Receipt.Actions>
          <Receipt.Action number={1} label="Queued" payload="Batch 2048" />
          <Receipt.Action number={2} label="Matched" payload="Midpoint fill" />
          <Receipt.Action number={3} label="Proved" payload="L2 proof posted" />
          <Receipt.Action number={4} label="Settled" payload="Anchored on L1" />
        </Receipt.Actions>
        <Receipt.Totals>
          <Receipt.Row label="Gross" value="24,500.00 USDC" />
          <Receipt.Row label="Fee" value="1.23 USDC" />
          <Receipt.Row label="Net" value="24,498.77 USDC" />
        </Receipt.Totals>
      </Receipt>
    </Frame>
  );
}

export function renderFillDrilldownReceipt() {
  return (
    <Frame>
      <Receipt
        cta={{
          label: "View transaction",
          href: "https://etherscan.io/tx/0x9b88d4c2b65afcc178a0b2a2b5d1570d305607a82b06c85ca9d4b7dced921234",
        }}
      >
        <Receipt.Header label="FILL DRILLDOWN" />
        <Receipt.Metadata>
          <Receipt.Row label="Fill id" value="F-118-04" />
          <Receipt.Row label="Pair" value="WBTC/USDC" />
          <Receipt.Row label="Counterparty" value="Internal dark pool" />
          <Receipt.Row
            label="Fill tx"
            value={{
              display: "0x9b88…1234",
              full: "0x9b88d4c2b65afcc178a0b2a2b5d1570d305607a82b06c85ca9d4b7dced921234",
              etherscan:
                "https://etherscan.io/tx/0x9b88d4c2b65afcc178a0b2a2b5d1570d305607a82b06c85ca9d4b7dced921234",
            }}
          />
          <Receipt.Row label="Settled at" value="2026-04-30 09:28:03 UTC" />
        </Receipt.Metadata>
        <Receipt.Actions>
          <Receipt.Action number={1} label="Signed" payload="Maker order" />
          <Receipt.Action number={2} label="Matched" payload="0.1500 WBTC" />
          <Receipt.Action number={3} label="Settled" payload="137,250.00 USDC" />
          <Receipt.Action number={4} label="Fee charged" payload="6.86 USDC" failed />
        </Receipt.Actions>
        <Receipt.Totals>
          <Receipt.Row label="Fill size" value="0.1500 WBTC" />
          <Receipt.Row label="Fee" value="6.86 USDC" />
          <Receipt.Row label="Net proceeds" value="137,243.14 USDC" />
        </Receipt.Totals>
      </Receipt>
    </Frame>
  );
}

export const OrderPreview: Story = {
  name: "Order preview",
  render: () => renderOrderPreviewReceipt(),
};

export const SettlementRecord: Story = {
  name: "Settlement record",
  render: () => renderSettlementRecordReceipt(),
};

export const FillDrilldown: Story = {
  name: "Fill drilldown",
  render: () => renderFillDrilldownReceipt(),
};
