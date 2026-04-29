// /account, sectioned rewrite — adds Activity log, Export, Trust + compliance, Operator role.
// Reason: the page is the institutional onboarding surface; today it's a settings page.
// A fund operator must be able to answer "what has this wallet signed, where are the receipts,
// what role am I in, who do I email if it breaks" without leaving /account. Same primitives
// (Card, Field, PageSection, Toggle, Button) — new sections, no new design tokens.
"use client";

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

const ETHERSCAN_ADDR = "https://etherscan.io/address/";
const ETHERSCAN_TX = "https://etherscan.io/tx/";
const TRUST_CENTER_HREF = "/trust"; // M7-owned static page; placeholder until ship.
const STATUS_PAGE_HREF = "https://status.omegamarkets.com";
const DESK_CONTACT = "desk@omegamarkets.com";

const GAS_STORAGE_KEY = "omega:gas-preference";
const REDUCE_MOTION_STORAGE_KEY = "omega:pref:reduce-motion";
const ADVANCED_ORDERS_STORAGE_KEY = "omega:pref:advanced-orders";

type GasPref = "fast" | "normal" | "slow";

const GAS_OPTIONS: ReadonlyArray<{ value: GasPref; label: string; hint: string }> = [
  { value: "fast", label: "Fast", hint: "Confirms within ~1 block. Higher tip." },
  { value: "normal", label: "Normal", hint: "Confirms within ~3 blocks. Default for most flows." },
  { value: "slow", label: "Slow", hint: "Confirms within ~10 blocks. Lowest tip." },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Activity log — fixture shape                                              */
/*  Replace with API in M6: GET /accounts/:wallet/activity?limit=50           */
/* ────────────────────────────────────────────────────────────────────────── */

type ActivityKind =
  | "connect"
  | "sign-permit"
  | "sign-order"
  | "deposit"
  | "withdrawal"
  | "cancel";

type ActivityRow = {
  kind: ActivityKind;
  at: string; // ISO UTC
  detail: string; // human-legible, no marketing
  batchId?: string; // if applicable
  txHash?: string; // L1 if applicable
};

// Fixture mirrors what omega-markets is expected to return for a private-alpha wallet.
const FIXTURE_ACTIVITY: ReadonlyArray<ActivityRow> = [
  {
    kind: "withdrawal",
    at: "2026-04-27T13:51:08Z",
    detail: "1,500.00 USDC to 0x4e1a…0e9f",
    txHash: "0x2c1d000000000000000000000000000000000000000000000000000000004a3b",
  },
  {
    kind: "sign-order",
    at: "2026-04-27T11:18:00Z",
    detail: "BUY 2,500.00 USDC/EURC @ 0.9214 limit",
    batchId: "4820",
  },
  {
    kind: "sign-order",
    at: "2026-04-27T10:42:00Z",
    detail: "SELL 600.00 USDC/EURC @ 0.9213 limit",
    batchId: "4818",
  },
  {
    kind: "deposit",
    at: "2026-04-27T09:15:00Z",
    detail: "30,000.00 USDC from 0xa513…C853",
    txHash: "0x4e1a000000000000000000000000000000000000000000000000000000000e9f",
  },
  {
    kind: "sign-permit",
    at: "2026-04-27T09:14:11Z",
    detail: "ERC-20 permit · USDC · 30,000.00",
  },
  {
    kind: "connect",
    at: "2026-04-27T09:00:00Z",
    detail: "MetaMask · chainId 1 · session opened",
  },
];

export default function AccountMarcusPage() {
  const wallet = useWalletState();

  if (wallet.state === "disconnected" || wallet.state === "connecting") {
    return (
      <AppShell route="/account" auth>
        <DisconnectedState
          title="Account is private."
          description="Connect a wallet to view your operator profile, signed-event log, and audit exports."
          onAction={() => {}}
        />
      </AppShell>
    );
  }

  const fixture = accountFixtures.default;
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
        description="Operator profile, signed-event log, exports, session."
      >
        {/* ─── Operator profile ───────────────────────────────────────── */}
        <PageSection title="Operator profile">
          <Card className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Wallet
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm">{truncated}</span>
                <CopyButton value={address} label="Copy address" />
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={`${ETHERSCAN_ADDR}${address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="View wallet on Etherscan"
                  >
                    <Icon.External className="h-3.5 w-3.5" aria-hidden />
                    Etherscan
                  </a>
                </Button>
              </div>
              {sessionStartedAt ? (
                <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                  Session opened {formatSessionStart(sessionStartedAt)} · UTC
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Chain" value={chainName} />
              <Field
                label="Connector"
                value={resolveConnectorVendor(wallet.connector)}
                hint="Wallet vendor reported by the WalletConnect / EIP-1193 provider."
              />
              <Field
                label="Phase-4 pass"
                value={fixture.hasNftPass ? "Held" : "Not held"}
                tone={fixture.hasNftPass ? "success" : "muted"}
              />
              <Field
                label="Operator role"
                value="Trading principal"
                hint="Single-role v0. Maker/checker delegation lands in v1."
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Desk contact
              </Label>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <a
                  href={`mailto:${DESK_CONTACT}`}
                  className="font-mono underline-offset-4 hover:underline"
                >
                  {DESK_CONTACT}
                </a>
                <span className="text-[var(--muted-foreground)]">·</span>
                <a
                  href={STATUS_PAGE_HREF}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[var(--muted-foreground)] underline-offset-4 hover:underline"
                >
                  status.omegamarkets.com
                </a>
                <span className="text-[var(--muted-foreground)]">·</span>
                <a
                  href={TRUST_CENTER_HREF}
                  className="text-[var(--muted-foreground)] underline-offset-4 hover:underline"
                >
                  Trust center
                </a>
              </div>
            </div>
          </Card>
        </PageSection>

        {/* ─── Activity log ───────────────────────────────────────────── */}
        <PageSection
          title="Activity log"
          description="Signed events from this wallet. UTC. Last 50."
        >
          <ActivityCard rows={FIXTURE_ACTIVITY} />
        </PageSection>

        {/* ─── Exports ────────────────────────────────────────────────── */}
        <PageSection
          title="Exports"
          description="For quarterly reconciliation and vendor-review questionnaires."
        >
          <ExportsCard />
        </PageSection>

        {/* ─── Gas preference ─────────────────────────────────────────── */}
        <PageSection title="Gas preference">
          <GasPreferencePicker />
        </PageSection>

        {/* ─── Preferences ────────────────────────────────────────────── */}
        <PageSection title="Preferences">
          <PreferencesCard fixture={fixture} />
        </PageSection>

        {/* ─── Theme ──────────────────────────────────────────────────── */}
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

        {/* ─── Session ────────────────────────────────────────────────── */}
        <PageSection title="Session">
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Sign out of this wallet on this device.</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                Onchain balances are unaffected. Reconnect any time. This does not revoke
                signed orders still in-flight — cancel open positions on /trade first.
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
/*  Activity log card                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function ActivityCard({ rows }: { rows: ReadonlyArray<ActivityRow> }) {
  const [filter, setFilter] = React.useState<"all" | ActivityKind>("all");

  const visible = React.useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.kind === filter)),
    [filter, rows],
  );

  return (
    <Card className="flex flex-col gap-3 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "connect", "sign-order", "sign-permit", "deposit", "withdrawal", "cancel"] as const).map(
          (k) => {
            const active = k === filter;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                aria-pressed={active}
                className={cn(
                  "rounded-[var(--radius-sm)] border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                {k === "all" ? "All" : kindLabel(k)}
              </button>
            );
          },
        )}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {visible.length} of {rows.length}
        </span>
      </div>

      <Separator />

      {visible.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-[var(--muted-foreground)]">
          No activity matches the filter.
        </p>
      ) : (
        <ul className="flex flex-col" role="list">
          {visible.map((row, idx) => (
            <li key={`${row.at}-${idx}`}>
              <ActivityRowView row={row} />
              {idx < visible.length - 1 ? <Separator /> : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ActivityRowView({ row }: { row: ActivityRow }) {
  return (
    <div className="grid grid-cols-[120px_1fr_auto] items-center gap-3 py-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {kindLabel(row.kind)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-mono text-sm">{row.detail}</span>
        <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
          {formatUtc(row.at)} · UTC
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {row.batchId ? (
          <a
            href={`/batches/${row.batchId}`}
            className="font-mono text-[11px] underline-offset-4 hover:underline"
          >
            Batch #{row.batchId}
          </a>
        ) : null}
        {row.txHash ? (
          <a
            href={`${ETHERSCAN_TX}${row.txHash}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-mono text-[11px] underline-offset-4 hover:underline"
            aria-label={`View ${kindLabel(row.kind)} on Etherscan`}
          >
            {truncateHash(row.txHash)}
            <Icon.External className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Exports card                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

function ExportsCard() {
  const [busy, setBusy] = React.useState<"csv" | "pdf" | null>(null);

  const onExport = React.useCallback((kind: "csv" | "pdf") => {
    setBusy(kind);
    // M6: replace with /accounts/:wallet/exports?format=csv|pdf
    window.setTimeout(() => setBusy(null), 800);
  }, []);

  return (
    <Card className="flex flex-col gap-4 p-5 md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ExportRow
          label="Activity (CSV)"
          hint="Tabular event log: kind, UTC timestamp, detail, batch ID, L1 tx. Header carries wallet, chain, export-as-of."
          busy={busy === "csv"}
          onClick={() => onExport("csv")}
        />
        <ExportRow
          label="Receipts (PDF)"
          hint="Settlement receipts for deposits, withdrawals, and matched fills. One artefact per event with batch root + proof hash."
          busy={busy === "pdf"}
          onClick={() => onExport("pdf")}
        />
      </div>
      <Separator />
      <p className="font-mono text-[11px] text-[var(--muted-foreground)]">
        Exports include a SHA-256 manifest. Hand the manifest to your auditor for tamper-evidence.
      </p>
    </Card>
  );
}

function ExportRow({
  label,
  hint,
  busy,
  onClick,
}: {
  label: string;
  hint: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{hint}</span>
      </div>
      <Button variant="outline" size="sm" onClick={onClick} disabled={busy} className="shrink-0">
        {busy ? (
          <Icon.Match className="h-3.5 w-3.5 animate-pulse" aria-hidden />
        ) : (
          <Icon.Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        {busy ? "Generating…" : "Download"}
      </Button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Existing primitives — preserved verbatim from /account                    */
/* ────────────────────────────────────────────────────────────────────────── */

function GasPreferencePicker() {
  const [pref, setPref] = React.useState<GasPref>("normal");
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(GAS_STORAGE_KEY);
    if (raw === "fast" || raw === "normal" || raw === "slow") setPref(raw);
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
    if (raw === "1" || raw === "0") setValue(raw === "1");
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
/*  Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "success" | "muted";
  hint?: string;
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
      {hint ? (
        <span className="text-[11px] text-[var(--muted-foreground)]">{hint}</span>
      ) : null}
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

function kindLabel(k: ActivityKind): string {
  switch (k) {
    case "connect":
      return "Connect";
    case "sign-permit":
      return "Permit";
    case "sign-order":
      return "Order";
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "cancel":
      return "Cancel";
  }
}

function resolveConnectorVendor(reported: string | null | undefined): string {
  if (!reported || reported === "Browser wallet") return "MetaMask (EIP-1193)";
  return reported;
}

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function formatSessionStart(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mon} ${day}, ${year} · ${hh}:${mm}`;
}
