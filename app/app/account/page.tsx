"use client";

/**
 * /account — Settings surface (kit port).
 *
 * Ported from the design-kit Settings.jsx. Wired to real Tempo wallet
 * state (address, chain, connector, disconnect). The Omega Zone snapshot is
 * filled from the demo fixture (backend unwired) so the surface reads live —
 * never empty Authorize/Pending/Not-connected states. Theme persists to
 * localStorage exactly as ThemeToggle did (brand-theme key, dark default).
 */

import * as React from "react";

import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/lib/icons";
import { accountFixtures } from "@/lib/fixtures";
import type { AccountZoneFixture } from "@/lib/fixtures/types";
import {
  truncateAddress,
  useWalletState,
} from "@/components/shell/WalletStateProvider";
import { tempoAddressUrl } from "@/lib/zone";

/* ─────────────────────────────────────────────── types ─── */

type ThemeMode = "dark" | "light";
type OrderMode = "market" | "limit";
// Product denomination — the live pair is OALPHA/PATH.USD (not the kit's demo
// USDC/EURC roster). ETH/USDC stays as the secondary option.
type DefaultPair = "OALPHA/PATH.USD" | "ETH/USDC";

/* ─────────────────────────────────── micro-primitives ─── */

/** Segmented control — dark/light or two-option selector. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  "aria-label"?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 3,
        borderRadius: "var(--radius-full)",
        background:
          "color-mix(in oklab, var(--muted) 60%, var(--card))",
        border: "1px solid var(--border)",
      }}
    >
      {options.map(([id, label]) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className="press-down"
            style={{
              minWidth: 56,
              height: 28,
              padding: "0 12px",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius-full)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: active
                ? "var(--foreground)"
                : "transparent",
              color: active
                ? "var(--background)"
                : "var(--muted-foreground)",
              transition:
                "color var(--duration-small, 100ms), background var(--duration-small, 100ms)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle switch. */
function SettingsToggle({
  on,
  onChange,
  id,
  "aria-label": ariaLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className="press-down"
      style={{
        width: 42,
        height: 24,
        flexShrink: 0,
        borderRadius: "var(--radius-full)",
        border: "none",
        cursor: "pointer",
        padding: 3,
        background: on ? "var(--success)" : "var(--muted)",
        transition: "background var(--duration-small, 100ms)",
        display: "flex",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--background)",
          transition: "all var(--duration-small, 100ms)",
        }}
      />
    </button>
  );
}

/** A row in a section: label + desc left, control right. */
function Row({
  title,
  desc,
  control,
  first,
  id,
}: {
  title: string;
  desc?: string;
  control: React.ReactNode;
  first?: boolean;
  id?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "16px 0",
        borderTop: first ? "none" : "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          minWidth: 0,
        }}
      >
        <span
          id={id}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--foreground)",
          }}
        >
          {title}
        </span>
        {desc && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              lineHeight: 1.45,
              color: "var(--muted-foreground)",
            }}
          >
            {desc}
          </span>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}

/** Named section with mono-uppercase label. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <h2
        id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </section>
  );
}

/** Ghost action button style — copy / explorer links. */
const ghostActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  height: 32,
  padding: "0 12px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--input)",
  background: "var(--background)",
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--foreground)",
  whiteSpace: "nowrap",
};

/* ─────────────────────────────── CopyButton ─── */

function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }, [address]);

  return (
    <button
      type="button"
      onClick={copy}
      className="press-down"
      style={ghostActionStyle}
      aria-label={copied ? "Address copied" : "Copy address"}
    >
      {copied ? (
        <Icon.Confirm
          size={15}
          style={{ color: "var(--success)" }}
          aria-hidden
        />
      ) : (
        <Icon.Copy size={15} aria-hidden />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─────────────────────────── ZonePanel ─── */

/** Small balance mini-card — mono-uppercase label over a tabular figure. */
function ZoneBalance({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 12,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background:
          "color-mix(in oklab, var(--muted) 35%, var(--card))",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          fontVariantNumeric: "tabular-nums",
          color: "var(--foreground)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Omega Zone status — demo snapshot. Renders the private-RPC session as
 * authorized with PATH.USD / OALPHA balances. Replaces the live private-RPC
 * widget while the backend is unwired so the surface reads live, not empty.
 */
function ZonePanel({ zone }: { zone: AccountZoneFixture }) {
  return (
    <div
      className="panel"
      style={{
        borderRadius: "var(--radius-xl)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span className="t-mono-label">Omega Zone</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--foreground)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: zone.authorized
                ? "var(--success)"
                : "var(--muted-foreground)",
              flexShrink: 0,
            }}
          />
          {zone.authorized ? "Private RPC authorized" : "Private RPC pending"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <ZoneBalance
          label="Zone · PATH.USD"
          value={`${zone.zoneBalances.pathUsd} PATH.USD`}
        />
        <ZoneBalance
          label="Zone · OALPHA"
          value={`${zone.zoneBalances.oalpha} OALPHA`}
        />
        <ZoneBalance
          label="Darkpool · PATH.USD"
          value={`${zone.darkpoolBalances.pathUsd} PATH.USD`}
        />
        <ZoneBalance
          label="Darkpool · OALPHA"
          value={`${zone.darkpoolBalances.oalpha} OALPHA`}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── useTheme hook ─── */

function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const [mode, setMode] = React.useState<ThemeMode>("dark");

  React.useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem("brand-theme") as ThemeMode | null)
        : null;
    const initial: ThemeMode = saved ?? "dark";
    setMode(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const setTheme = React.useCallback((next: ThemeMode) => {
    setMode(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("brand-theme", next);
  }, []);

  return [mode, setTheme];
}

/* ─────────────────────────── page component ─── */

export default function AccountPage() {
  const wallet = useWalletState();

  // No full-page connect gate — SettingsContent renders read-only while
  // disconnected (it falls back to placeholder identity). The Tempo wallet
  // connect is a modal popup from the Navbar (WalletStatus).
  return (
    <AppShell route="/account" auth>
      <SettingsContent wallet={wallet} />
    </AppShell>
  );
}

/* ─────────────────── SettingsContent (kit port) ─── */

function SettingsContent({
  wallet,
}: {
  wallet: ReturnType<typeof useWalletState>;
}) {
  const fixture = accountFixtures.default;
  const zone = fixture.zone;
  const address: string =
    wallet.address ??
    fixture.address ??
    "0x0000000000000000000000000000000000000000";
  // Settlement layer — prefer the live wallet chain, else the demo zone name.
  const chainName = wallet.chainName ?? zone?.chainName ?? "Omega Zone";
  const connector = wallet.connector ?? "Tempo Wallet";
  const sessionStartedAt = fixture.sessionStartedAt;
  const truncated = truncateAddress(address);
  const explorerHref = tempoAddressUrl(address);

  // Theme — dark default, persisted to localStorage (brand-theme key).
  const [theme, setTheme] = useTheme();

  // Local preference state (cosmetic / session-local for now; backend deferred).
  const [defaultMode, setDefaultMode] = React.useState<OrderMode>("market");
  const [defaultPair, setDefaultPair] =
    React.useState<DefaultPair>("OALPHA/PATH.USD");
  const [confirmSign, setConfirmSign] = React.useState(true);
  const [hideBalances, setHideBalances] = React.useState(false);
  const [fillAlerts, setFillAlerts] = React.useState(true);
  const [proofAlerts, setProofAlerts] = React.useState(true);

  return (
    <div
      className="pf-fade"
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* Page header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "var(--muted-foreground)",
          }}
        >
          Account, preferences, and privacy for this session.
        </p>
      </div>

      {/* Wallet identity panel */}
      <div
        className="panel"
        style={{
          borderRadius: "var(--radius-xl)",
          padding: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border)",
            background:
              "color-mix(in oklab, var(--muted) 60%, var(--card))",
            color: "var(--muted-foreground)",
            flexShrink: 0,
          }}
        >
          <Icon.Wallet size={18} aria-hidden />
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: 0,
            flex: 1,
          }}
        >
          <span className="t-mono-label">
            Tempo Wallet · {connector}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--foreground)",
              wordBreak: "break-all",
            }}
          >
            {truncated}
          </span>
          {sessionStartedAt ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted-foreground)",
              }}
            >
              Session since {formatSessionStart(sessionStartedAt)}
            </span>
          ) : null}
        </div>
        <div
          style={{ marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }}
        >
          <CopyButton address={address} />
          <a
            href={explorerHref}
            target="_blank"
            rel="noreferrer noopener"
            className="press-down"
            style={ghostActionStyle}
            aria-label="View on Tempo Explorer"
          >
            <Icon.External size={15} aria-hidden />
            Explorer
          </a>
        </div>
      </div>

      {/* Omega Zone — demo snapshot (backend unwired; renders live, not empty) */}
      {zone ? <ZonePanel zone={zone} /> : null}

      {/* Preferences section */}
      <Section title="Preferences">
        <Row
          first
          title="Theme"
          desc="Dark is the trading default. Light is supported."
          control={
            <Segmented<ThemeMode>
              options={[
                ["dark", "Dark"],
                ["light", "Light"],
              ]}
              value={theme}
              onChange={setTheme}
              aria-label="Theme"
            />
          }
        />
        <Row
          title="Default order mode"
          desc="Which entry mode opens first on the trade screen."
          control={
            <Segmented<OrderMode>
              options={[
                ["market", "Market"],
                ["limit", "Limit"],
              ]}
              value={defaultMode}
              onChange={setDefaultMode}
              aria-label="Default order mode"
            />
          }
        />
        <Row
          title="Default pair"
          desc="The pair selected when you open Trade."
          control={
            <Segmented<DefaultPair>
              options={[
                ["OALPHA/PATH.USD", "OALPHA/PATH.USD"],
                ["ETH/USDC", "ETH/USDC"],
              ]}
              value={defaultPair}
              onChange={setDefaultPair}
              aria-label="Default pair"
            />
          }
        />
      </Section>

      {/* Trading section */}
      <Section title="Trading">
        <Row
          first
          title="Confirm before signing"
          desc="Show the order review modal before each signature."
          control={
            <SettingsToggle
              on={confirmSign}
              onChange={setConfirmSign}
              aria-label="Confirm before signing"
            />
          }
        />
        <Row
          title="Network"
          desc={`Settlement layer. Chain: ${chainName}.`}
          control={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--foreground)",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--success)",
                  flexShrink: 0,
                }}
              />
              {chainName}
            </span>
          }
        />
      </Section>

      {/* Privacy section */}
      <Section title="Privacy">
        <Row
          first
          title="Hide balances"
          desc="Mask amounts across the interface until revealed."
          control={
            <SettingsToggle
              on={hideBalances}
              onChange={setHideBalances}
              aria-label="Hide balances"
            />
          }
        />
      </Section>

      {/* Notifications section */}
      <Section title="Notifications">
        <Row
          first
          title="Fill alerts"
          desc="Notify when an order matches at midpoint."
          control={
            <SettingsToggle
              on={fillAlerts}
              onChange={setFillAlerts}
              aria-label="Fill alerts"
            />
          }
        />
        <Row
          title="Proof verified"
          desc="Notify when a batch proof is verified onchain."
          control={
            <SettingsToggle
              on={proofAlerts}
              onChange={setProofAlerts}
              aria-label="Proof verified"
            />
          }
        />
      </Section>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Sign out */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Sign out
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--muted-foreground)",
            }}
          >
            Ends this session. Your passkey stays on your device.
          </span>
        </div>
        <button
          type="button"
          onClick={() => wallet.disconnect()}
          className="press-down"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 18px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            border:
              "1px solid color-mix(in oklab, var(--destructive) 40%, transparent)",
            background:
              "color-mix(in oklab, var(--destructive) 10%, transparent)",
            color: "var(--destructive)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Icon.Disconnect size={16} aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── helpers ─── */

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
