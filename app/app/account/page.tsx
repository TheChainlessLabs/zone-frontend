"use client";

/**
 * /account — email-led identity, theme, and session.
 *
 * v0 auth is email-first with a server-managed pre-generated trading
 * address. The page reflects that model directly: lead with the user's
 * email, then the trading address used inside the closed alpha.
 */

import * as React from "react";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout, PageSection } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/lib/icons";
import { accountFixtures } from "@/lib/fixtures";
import {
  truncateAddress,
  useWalletState,
} from "@/components/shell/WalletStateProvider";

const ETHERSCAN_BASE = "https://etherscan.io/address/";

export default function AccountPage() {
  const wallet = useWalletState();

  if (
    wallet.state !== "connected" &&
    wallet.state !== "wrong-network" &&
    wallet.state !== "no-nft-pass"
  ) {
    return (
      <AppShell route="/account" auth>
        <DisconnectedState
          title="Account is private."
          description="Sign up with email to view and update your account."
          onAction={() => {}}
        />
      </AppShell>
    );
  }

  const fixture = accountFixtures.default;
  const address: string =
    wallet.address ?? fixture.address ?? "0x0000000000000000000000000000000000000000";
  const email = wallet.email ?? fixture.email;
  const chainName = wallet.chainName ?? "Ethereum";
  const truncated = truncateAddress(address);
  const sessionStartedAt = fixture.sessionStartedAt;

  return (
    <AppShell route="/account" auth>
      <PageLayout
        width="default"
        title="Account"
        description="Identity, theme, session."
      >
        <PageSection title={<MonoSectionTitle>Account</MonoSectionTitle>}>
          <Card variant="glass" className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Email
              </span>
              <span className="text-base">{email}</span>
            </div>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Trading address (server-managed)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm">{truncated}</span>
                <CopyButton value={address} label="Copy address" />
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={`${ETHERSCAN_BASE}${address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="View on Etherscan"
                  >
                    <Icon.External className="h-3.5 w-3.5" aria-hidden />
                    Etherscan
                  </a>
                </Button>
              </div>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                This address holds your seeded testnet balance during the closed
                alpha. You don&apos;t manage its keys.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Closed testnet · Private alpha
              </span>
              {sessionStartedAt ? (
                <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                  Connected since {formatSessionStart(sessionStartedAt)}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Chain" value={chainName} />
              <Field
                label="Connector"
                value={wallet.connector ?? "Browser wallet"}
              />
            </div>
          </Card>
        </PageSection>

        <PageSection title={<MonoSectionTitle>Theme</MonoSectionTitle>}>
          <Card className="flex items-center justify-between gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Appearance</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                Follows your system setting unless overridden.
              </span>
            </div>
            <ThemeToggle />
          </Card>
        </PageSection>

        <PageSection title={<MonoSectionTitle>Session</MonoSectionTitle>}>
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Sign out of this device.</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                Your seeded balance and order history remain - sign back in with
                your email any time.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => wallet.disconnect()}
              className="min-h-[44px] self-start md:min-h-0"
            >
              <Icon.Disconnect className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </Button>
          </Card>
        </PageSection>
      </PageLayout>
    </AppShell>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Section title — mono uppercase tracked, matches eyebrow register on data  */
/*  surfaces. Page title (PageLayout `title`) stays sans for brand chrome.    */
/* ────────────────────────────────────────────────────────────────────────── */

function MonoSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tiny presentational helpers                                               */
/* ────────────────────────────────────────────────────────────────────────── */

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </Label>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onCopy}
      aria-label={label}
      className="h-7 px-2"
    >
      {copied ? (
        <Icon.Match className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden />
      ) : (
        <Icon.Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

/** Format `2026-04-27T09:00:00Z` → `Apr 27, 2026 · 09:00 UTC`. */
function formatSessionStart(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mon = months[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mon} ${day}, ${year} · ${hh}:${mm} UTC`;
}
