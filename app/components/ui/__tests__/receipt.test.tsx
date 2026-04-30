import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  renderFillDrilldownReceipt,
  renderOrderPreviewReceipt,
  renderSettlementRecordReceipt,
} from "@/components/ui/receipt.stories";

afterEach(cleanup);

it("matches the snapshot for each receipt story scenario", () => {
  const { container: orderPreview } = render(renderOrderPreviewReceipt());
  expect(orderPreview.firstChild).toMatchSnapshot("order-preview");
  cleanup();

  const { container: settlementRecord } = render(
    renderSettlementRecordReceipt(),
  );
  expect(settlementRecord.firstChild).toMatchSnapshot("settlement-record");
  cleanup();

  const { container: fillDrilldown } = render(renderFillDrilldownReceipt());
  expect(fillDrilldown.firstChild).toMatchSnapshot("fill-drilldown");
});
