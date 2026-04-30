"use client";

/**
 * /trade — M3.2 wireframe.
 *
 * Action-first execution surface (omega-docs/03-brand/visual-identity.md).
 * Two modes:
 *   • Market — narrow centred 480px column; order form is the only surface.
 *   • Limit  — wide 1280px split (form left, chart + your fills right on lg+).
 *
 * Brand stance: no chart in Market mode; no public order book; no global
 * trade tape; user-fills-only timeline. Pairs are stablecoin/crypto BASE/QUOTE
 * tickers (omega-docs/03-brand/naming.md), never fiat.
 *
 * State coverage (all 7 from PRD, omega-docs#5):
 *   default · empty · loading · error · skeleton · disconnected · wrong-network
 * Reachable via `?state=…`. Wallet branches additionally reachable via
 * `?walletState=…` through AppShell's guard layer.
 */

import * as React from "react";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import { Animate } from "@/components/ui/animate";
import { Icon } from "@/lib/icons";
import {
  ChartPlaceholder,
  OrderForm,
  PairSwitcher,
  YourFills,
  type OrderMode,
} from "@/components/trade";
import {
  DEFAULT_PAIR,
  LAUNCH_PAIRS,
  tradeFixtures,
  usePageState,
  type LaunchPair,
} from "@/lib/fixtures";
import type { MarketPair } from "@/lib/fixtures/types";

export default function TradePage() {
  return (
    <AppShell route="/trade" auth>
      <TradeSurface />
    </AppShell>
  );
}

function TradeSurface() {
  const state = usePageState("default");
  const fixture = tradeFixtures[state] ?? tradeFixtures.default;

  // Active pair lives in local state; PairSwitcher updates it. Default tracks
  // the fixture's pair so review shots stay deterministic for the canonical
  // demo path (USDC/EURC).
  const [pair, setPair] = React.useState<MarketPair>(fixture.pair);
  const [mode, setMode] = React.useState<OrderMode>("market");

  const launchPair: LaunchPair =
    LAUNCH_PAIRS.find((p) => p.pair === pair) ?? DEFAULT_PAIR;

  // Page-state-driven gate surfaces. Wallet-state-driven gates live in
  // AppShell — both paths must render cleanly for review.
  if (state === "disconnected") {
    return (
      <PageLayout width="narrow" bare>
        <DisconnectedState
          title="Sign up to trade"
          description="Omega is read-only until you sign in with email. We'll send a magic link to activate your account."
          onAction={() => {}}
        />
      </PageLayout>
    );
  }

  if (state === "wrong-network") {
    return (
      <PageLayout width="narrow" bare>
        <DisconnectedState
          title="Unsupported network"
          description="Switch to Ethereum mainnet to access trading."
          actionLabel="Switch network"
          icon={Icon.Warning}
          onAction={() => {}}
        />
      </PageLayout>
    );
  }

  const isLoading = state === "loading" || state === "skeleton";
  const errorMessage =
    state === "error" ? fixture.error?.message : undefined;
  const fillsEmptyMessage =
    state === "empty"
      ? "No fills yet. Your matches will appear here."
      : undefined;
  const midpoint =
    state === "loading" || state === "skeleton" || state === "error"
      ? ""
      : fixture.midpoint;

  // Order form (shared between Market + Limit) — exact same surface, only
  // the outer width + the chart/fills siblings change.
  const orderFormBlock = (
    <div className="flex flex-col gap-4">
      <PairSwitcher value={pair} onChange={setPair} midpoint={midpoint} />
      <OrderForm
        pair={launchPair}
        mode={mode}
        onModeChange={setMode}
        midpoint={midpoint}
        loading={isLoading}
        errorMessage={errorMessage}
        onSubmit={() => {}}
      />
    </div>
  );

  // Limit-mode-only side block — chart placeholder + your fills.
  const limitSideBlock = (
    <Animate variant="enter" className="flex flex-col gap-4">
      <ChartPlaceholder pair={launchPair} midpoint={midpoint} />
      <YourFills
        fills={state === "default" ? fixture.recentFills : []}
        loading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={fillsEmptyMessage}
      />
    </Animate>
  );

  return (
    <>
      {mode === "market" ? (
        <PageLayout width="narrow" bare>
          {orderFormBlock}
        </PageLayout>
      ) : (
        <PageLayout width="wide" bare>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[480px_1fr] lg:gap-8">
            <div>{orderFormBlock}</div>
            <div>{limitSideBlock}</div>
          </div>
        </PageLayout>
      )}

    </>
  );
}
