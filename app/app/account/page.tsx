"use client";

/**
 * /account — minimal account surface (M3.5 wireframe, closes #146).
 *
 * Per the PRD (omega-docs#5 Q4) the v0 surface is intentionally narrow:
 * connected wallet info, gas preference, theme, sign out. No public
 * lookup at v0; that ships in v1+. The page is auth-gated — disconnected
 * viewers see the standard DisconnectedState.
 *
 * The data is wallet-state-driven. The address comes from
 * `useWalletState()` so it matches the navbar pill when the mock flow
 * is in `connected`. The fixture is the fallback for `?walletState=`
 * reviewers that haven't run through the connect flow.
 */

import * as React from "react";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout, PageSection } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { accountFixtures } from "@/lib/fixtures";
import {
  truncateAddress,
  useWalletState,
} from "@/components/shell/WalletStateProvider";

const ETHERSCAN_BASE = "https://etherscan.io/address/";
const GAS_STORAGE_KEY = "omega:gas-preference";

type GasPref = "fast" | "normal" | "slow";

const GAS_OPTIONS: ReadonlyArray<{
  value: GasPref;
  label: string;
  hint: string;
}> = [
  { value: "fast", label: "Fast", hint: "Confirms within ~1 block. Higher tip." },
  {
    value: "normal",
    label: "Normal",
    hint: "Confirms within ~3 blocks. Default for most flows.",
  },
  {
    value: "slow",
    label: "Slow",
    hint: "Confirms within ~10 blocks. Lowest tip.",
  },
];

export default function AccountPage() {
  const wallet = useWalletState();

  if (wallet.state === "disconnected" || wallet.state === "connecting") {
    return (
      <AppShell route="/account" auth>
        <DisconnectedState
          title="Account is private."
          description="Connect a wallet to view and update your account."
          onAction={() => {}}
        />
      </AppShell>
    );
  }

  const fixture = accountFixtures.default;
  // wallet.address is set whenever the state is connected / wrong-network /
  // no-nft-pass; fall back to the fixture address for `?walletState=`
  // overrides that haven't run through the connect flow. The fixture
  // address is `0x${string} | null` — coerce to a guaranteed string here.
  const address: string =
    wallet.address ?? fixture.address ?? "0x0000000000000000000000000000000000000000";
  const chainName = wallet.chainName ?? "Ethereum";
  const truncated = truncateAddress(address);

  return (
    <AppShell route="/account" auth>
      <PageLayout
        width="default"
        title="Account"
        description="Wallet, preferences, session."
      >
        <PageSection title="Connected wallet">
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Address
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
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Chain" value={chainName} />
              <Field
                label="Connector"
                value={wallet.connector ?? "Browser wallet"}
              />
              <Field
                label="NFT pass"
                value={fixture.hasNftPass ? "Held" : "Not held"}
                tone={fixture.hasNftPass ? "success" : "muted"}
              />
            </div>
          </Card>
        </PageSection>

        <PageSection title="Gas preference">
          <GasPreferencePicker />
        </PageSection>

        <PageSection title="Theme">
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

        <PageSection title="Session">
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Sign out of this wallet on this device.</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                Onchain balances are unaffected. Reconnect any time.
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
/*  Sections                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function GasPreferencePicker() {
  const [pref, setPref] = React.useState<GasPref>("normal");
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(GAS_STORAGE_KEY);
    if (raw === "fast" || raw === "normal" || raw === "slow") {
      setPref(raw);
    }
  }, []);

  const onSelect = React.useCallback((next: GasPref) => {
    setPref(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GAS_STORAGE_KEY, next);
    }
  }, []);

  return (
    <Card
      className="flex flex-col gap-3 p-5 md:p-6"
      role="radiogroup"
      aria-label="Gas preference"
    >
      {GAS_OPTIONS.map((opt) => {
        const active = opt.value === pref;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex items-start justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors",
              active
                ? "border-[var(--foreground)] bg-[var(--muted)]/40"
                : "border-[var(--border)] hover:bg-[var(--muted)]/20",
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {opt.hint}
              </span>
            </div>
            <span
              aria-hidden
              className={cn(
                "mt-1 inline-block h-3 w-3 shrink-0 rounded-full border",
                active
                  ? "border-[var(--foreground)] bg-[var(--foreground)]"
                  : "border-[var(--muted-foreground)]/40",
              )}
            />
          </button>
        );
      })}
    </Card>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "muted";
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </Label>
      <span
        className={cn(
          "text-sm",
          tone === "success" && "text-[var(--success)]",
          tone === "muted" && "text-[var(--muted-foreground)]",
        )}
      >
        {value}
      </span>
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
