"use client";

import { useState } from "react";

const sections = [
  { key: "trading", label: "Trading" },
  { key: "display", label: "Display" },
  { key: "privacy", label: "Privacy" },
  { key: "notifications", label: "Notifs" },
  { key: "wallet", label: "Wallet" },
] as const;

type Section = (typeof sections)[number]["key"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("trading");

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:min-h-[600px]">
      {/* Sidebar — horizontal scroll on mobile, vertical on desktop */}
      <nav className="w-full md:w-[200px] shrink-0">
        <div className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar bg-bg-surface md:bg-transparent border border-border md:border-0 rounded-md md:rounded-none p-1 md:p-0">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`shrink-0 text-left px-3 h-[36px] text-body-sm rounded-md transition-fast whitespace-nowrap ${
                activeSection === s.key
                  ? "bg-bg-elevated text-text-primary font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-[600px]">
        {activeSection === "trading" && <TradingSettings />}
        {activeSection === "display" && <DisplaySettings />}
        {activeSection === "privacy" && <PrivacySettings />}
        {activeSection === "notifications" && <PlaceholderSection title="Notifications" />}
        {activeSection === "wallet" && <PlaceholderSection title="Wallet" />}
      </div>
    </div>
  );
}

function TradingSettings() {
  const [orderType, setOrderType] = useState("midpoint");
  const [slippage, setSlippage] = useState("0.5");
  const [confirmBeforeSubmit, setConfirmBeforeSubmit] = useState(true);
  const [defaultPrivacy, setDefaultPrivacy] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [decimals, setDecimals] = useState("4");
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="flex flex-col gap-0">
      {/* Section header */}
      <div className="bg-bg-surface border border-border rounded-lg p-4 mb-5">
        <h2 className="text-body-sm font-semibold">Trading Preferences</h2>
        <p className="text-[12px] text-text-muted mt-0.5">Configure default order behavior and execution settings.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Default Order Type */}
        <SettingRow
          label="Default Order Type"
          description="Pre-selected on the trading form"
        >
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
            {[{ key: "midpoint", label: "Midpoint Peg" }, { key: "limit", label: "Limit" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setOrderType(t.key)}
                className={`px-3 h-[28px] text-[12px] font-medium rounded-sm transition-fast whitespace-nowrap ${
                  orderType === t.key
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </SettingRow>

        <div className="border-t border-border-subtle" />

        {/* Default Slippage */}
        <SettingRow
          label="Default Slippage"
          description="Max price deviation from midpoint"
        >
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
            {["0.1", "0.5", "1.0"].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-2.5 h-[28px] text-[12px] font-mono rounded-sm transition-fast ${
                  slippage === s
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {s}%
              </button>
            ))}
            <button
              onClick={() => setSlippage("custom")}
              className={`px-2.5 h-[28px] text-[12px] rounded-sm transition-fast ${
                slippage === "custom"
                  ? "bg-accent text-text-inverse"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Custom
            </button>
          </div>
        </SettingRow>

        <div className="border-t border-border-subtle" />

        {/* Toggles */}
        <Toggle
          label="Confirm Before Submit"
          description="Show confirmation dialog before placing orders"
          checked={confirmBeforeSubmit}
          onChange={setConfirmBeforeSubmit}
        />

        <div className="border-t border-border-subtle" />

        <Toggle
          label="Default Privacy Mode"
          description="Execute all orders in privacy mode by default"
          checked={defaultPrivacy}
          onChange={setDefaultPrivacy}
        />

        <div className="border-t border-border-subtle" />

        {/* Display Currency */}
        <SettingRow
          label="Display Currency"
          description="Base currency for portfolio value display"
        >
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-primary outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (&euro;)</option>
            <option value="GBP">GBP (&pound;)</option>
          </select>
        </SettingRow>

        <div className="border-t border-border-subtle" />

        {/* Price Decimal Places */}
        <SettingRow
          label="Price Decimal Places"
          description="Number of decimal places for FX rates"
        >
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
            {["2", "4", "6"].map((d) => (
              <button
                key={d}
                onClick={() => setDecimals(d)}
                className={`w-[28px] h-[28px] text-[12px] font-medium rounded-sm transition-fast ${
                  decimals === d
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </SettingRow>

        <div className="border-t border-border-subtle" />

        <Toggle
          label="Compact Mode"
          description="Reduce spacing for denser information display"
          checked={compactMode}
          onChange={setCompactMode}
        />
      </div>
    </div>
  );
}

function DisplaySettings() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h3 font-semibold">Display & Appearance</h2>
      <p className="text-body-sm text-text-muted">Display settings are now in the Trading tab.</p>
    </div>
  );
}

function PrivacySettings() {
  const [privacyDefault, setPrivacyDefault] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-h3 font-semibold">Privacy</h2>
      <Toggle
        label="Privacy Mode Default"
        description="Enable privacy mode for all new transactions by default"
        checked={privacyDefault}
        onChange={setPrivacyDefault}
      />
    </div>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h3 font-semibold">{title}</h2>
      <p className="text-body-sm text-text-muted">Coming soon</p>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="shrink-0">
        <p className="text-body-sm font-medium text-text-primary">{label}</p>
        <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-body-sm text-text-primary">{label}</p>
        <p className="text-body-sm text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-[44px] h-[24px] rounded-full shrink-0 transition-fast relative ${
          checked ? "bg-accent" : "bg-bg-elevated"
        }`}
      >
        <span
          className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-fast ${
            checked ? "left-[22px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
