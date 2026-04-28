"use client";

/**
 * /portfolio — production trader dashboard.
 *
 * The user's personal financial dashboard: total value, positions,
 * fills, transfers, and onchain deposit/withdrawal log.
 *
 * Privacy contract (omega-docs#5 PRD): only the connected user's own
 * state ever lands on this page — no counterparty IDs, no global feed.
 *
 * Layout: the "blended" shape (variant 11) — frame, hero chart,
 * dual-column with sticky summary. Mobile lifts the summary card
 * above the lists so the quick-glance signal stays visible right
 * after the chart instead of being buried under positions.
 *
 * State coverage (driven by `?state=`):
 *   default · empty · loading · error · skeleton · disconnected.
 */

import * as React from "react";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import { DepositModal } from "@/components/modals/deposit-modal";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { portfolioFixtures, usePageState } from "@/lib/fixtures";

import Variant11Blended from "./preview/_variants/variant-11-blended";

export default function PortfolioPage() {
  const state = usePageState();
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  // Disconnected short-circuits — the page is auth-gated.
  if (state === "disconnected") {
    return (
      <AppShell route="/portfolio" auth>
        <DisconnectedState
          title="Portfolio is private."
          description="Connect a wallet to see your balances, positions, and history."
          onAction={() => {}}
        />
      </AppShell>
    );
  }

  const fixture =
    state === "default" || state === "empty"
      ? portfolioFixtures[state]
      : portfolioFixtures.default;
  const isLoading = state === "loading" || state === "skeleton";
  const isError = state === "error";
  const errorMessage =
    portfolioFixtures.error.error?.message ?? "Portfolio unavailable.";

  return (
    <AppShell route="/portfolio" auth>
      <PageLayout width="wide">
        {isError ? <ErrorBand message={errorMessage} /> : null}

        {isLoading || isError ? (
          <PortfolioSkeleton
            onDeposit={() => setDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
          />
        ) : (
          <Variant11Blended
            fixture={fixture}
            onDeposit={() => setDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
          />
        )}
      </PageLayout>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        state="idle"
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        state="idle"
      />
    </AppShell>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Loading / error skeleton — mirrors variant 11's shape so the page         */
/*  doesn't reflow when data resolves.                                        */
/* ────────────────────────────────────────────────────────────────────────── */

function PortfolioSkeleton({
  onDeposit,
  onWithdraw,
}: {
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <section
        aria-label="Portfolio overview"
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="h-5 w-56" />
        </div>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <SkeletonBar className="h-12 w-48 md:h-16 md:w-64" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      </section>

      <Card className="flex flex-col gap-4 p-4 md:p-6">
        <SkeletonBar className="h-[160px] w-full md:h-[220px]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SkeletonBar className="h-8 w-64 rounded-full" />
          <div className="flex gap-2">
            <Button size="sm" onClick={onDeposit}>
              <Icon.Wallet aria-hidden />
              Deposit
            </Button>
            <Button size="sm" variant="outline" onClick={onWithdraw}>
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.6fr_1fr]">
        <aside className="flex flex-col gap-4 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <Card variant="glass" className="flex flex-col gap-4 p-5 md:p-6">
            <SkeletonBar className="h-3 w-16" />
            <div className="flex flex-col gap-2">
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-2 w-full rounded-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-full" />
            </div>
            <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4">
              <SkeletonBar className="h-24 w-24 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-full" />
              </div>
            </div>
          </Card>
        </aside>

        <div className="flex flex-col gap-6 lg:order-1">
          {[
            { title: "Open positions", rows: 3 },
            { title: "Recent fills", rows: 3 },
            { title: "Transfers", rows: 3 },
          ].map(({ title, rows }) => (
            <Card key={title} className="flex flex-col gap-4 p-5 md:p-6">
              <h2 className="text-base font-medium">{title}</h2>
              <ul className="flex flex-col">
                {Array.from({ length: rows }).map((_, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-t border-[var(--border)] py-3 first:border-t-0"
                  >
                    <SkeletonBar className="h-3 w-24" />
                    <SkeletonBar className="h-3 w-16" />
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-3 animate-pulse rounded-sm bg-[var(--muted)]",
        className,
      )}
    />
  );
}

function ErrorBand({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-[var(--destructive)] md:items-center"
    >
      <div className="flex items-start gap-2 text-xs md:items-center">
        <Icon.Warning size={14} aria-hidden className="mt-0.5 shrink-0 md:mt-0" />
        <span className="leading-relaxed">{message}</span>
      </div>
      <Button variant="destructive" size="sm" onClick={() => {}}>
        Retry
      </Button>
    </div>
  );
}
