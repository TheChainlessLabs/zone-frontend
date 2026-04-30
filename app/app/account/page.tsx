"use client";

/**
 * /account — minimal account surface (M3.5 wireframe, closes #146).
 *
 * Per the PRD (omega-docs#5 Q4) the v0 surface is intentionally narrow:
 * connected wallet, gas preference, theme, preferences, sign out. No
 * public lookup at v0; that ships in v1+. Auth-gated — disconnected
 * viewers see the standard DisconnectedState.
 *
 * The data is wallet-state-driven. The address comes from
 * `useWalletState()` so it matches the navbar pill when the mock flow
 * is in `connected`. The fixture is the fallback for `?walletState=`
 * reviewers that haven't run through the connect flow.
 *
 * The user's in-exchange routing identity is derived deterministically
 * from the L1 wallet's signature inside the matching engine; it isn't
 * surfaced here because it's internal.
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
import { Toggle } from "@/components/ui/toggle";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { accountFixtures } from "@/lib/fixtures";
import {
  truncateAddress,
  useWalletState,
} from "@/components/shell/WalletStateProvider";

const ETHERSCAN_BASE = "https://etherscan.io/address/";
const GAS_STORAGE_KEY = "omega:gas-preference";
const REDUCE_MOTION_STORAGE_KEY = "omega:pref:reduce-motion";
const ADVANCED_ORDERS_STORAGE_KEY = "omega:pref:advanced-orders";

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
  // overrides that haven't run through the connect flow.
  const address: string =
    wallet.address ?? fixture.address ?? "0x0000000000000000000000000000000000000000";
  const chainName = wallet.chainName ?? "Ethereum";
  const truncated = truncateAddress(address);
  const sessionStartedAt = fixture.sessionStartedAt;

  return (
    <AppShell route="/account" auth>
      <PageLayout
        width="default"
        title="Account"
        description="Wallet, preferences, session."
      >
        <PageSection title={<MonoSectionTitle>Connected wallet</MonoSectionTitle>}>
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
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
              {sessionStartedAt ? (
                <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                  Connected since {formatSessionStart(sessionStartedAt)}
                </span>
              ) : null}
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

        <PageSection title={<MonoSectionTitle>Gas preference</MonoSectionTitle>}>
          <GasPreferencePicker />
        </PageSection>

        <PageSection title={<MonoSectionTitle>Preferences</MonoSectionTitle>}>
          <PreferencesCard fixture={fixture} />
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
/*  Gas preference — segmented control                                        */
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

  const activeHint = GAS_OPTIONS.find((o) => o.value === pref)?.hint ?? "";

  return (
    <Card className="flex flex-col gap-3 p-3 md:p-4">
      <div
        role="radiogroup"
        aria-label="Gas preference"
        className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--muted)]/40 p-1"
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
                "flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <p className="px-1 text-xs text-[var(--muted-foreground)]">{activeHint}</p>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Preferences — toggles                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function PreferencesCard({
  fixture,
}: {
  fixture: { preferences: { reduceMotion: boolean; showAdvancedOrderTypes: boolean } };
}) {
  const [reduceMotion, setReduceMotion] = useStoredToggle(
    REDUCE_MOTION_STORAGE_KEY,
    fixture.preferences.reduceMotion,
  );
  const [advanced, setAdvanced] = useStoredToggle(
    ADVANCED_ORDERS_STORAGE_KEY,
    fixture.preferences.showAdvancedOrderTypes,
  );

  return (
    <Card className="flex flex-col p-5 md:p-6">
      <PreferenceRow
        label="Reduce motion"
        hint="Damp page transitions and microinteractions."
        ariaLabel="Reduce motion"
        value={reduceMotion}
        onChange={setReduceMotion}
      />
      <Separator className="my-4" />
      <PreferenceRow
        label="Show advanced order types"
        hint="Surface stop-limit, IOC, FOK, and post-only on the trade form."
        ariaLabel="Show advanced order types"
        value={advanced}
        onChange={setAdvanced}
      />
    </Card>
  );
}

function PreferenceRow({
  label,
  hint,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  ariaLabel: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{hint}</span>
      </div>
      <Toggle
        variant="outline"
        size="sm"
        pressed={value}
        onPressedChange={onChange}
        aria-label={ariaLabel}
        className="min-h-[32px] shrink-0"
      >
        {value ? "On" : "Off"}
      </Toggle>
    </div>
  );
}

/** Hook: a boolean state persisted to localStorage with the SSR default
 *  preserved until hydration so the markup doesn't flap. */
function useStoredToggle(
  key: string,
  fallback: boolean,
): [boolean, (next: boolean) => void] {
  const [value, setValue] = React.useState(fallback);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(key);
    if (raw === "1" || raw === "0") {
      setValue(raw === "1");
    }
  }, [key]);

  const onChange = React.useCallback(
    (next: boolean) => {
      setValue(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, next ? "1" : "0");
      }
    },
    [key],
  );

  return [value, onChange];
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tiny presentational helpers                                               */
/* ────────────────────────────────────────────────────────────────────────── */

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
      <Label className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
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
