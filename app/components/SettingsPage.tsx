"use client";

import { useState } from "react";

const sections = [
  { key: "trading", label: "Trading" },
  { key: "display", label: "Display" },
  { key: "privacy", label: "Privacy" },
  { key: "notifications", label: "Notifications" },
  { key: "api-keys", label: "API Keys" },
  { key: "wallet", label: "Wallet" },
] as const;

type Section = (typeof sections)[number]["key"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("trading");

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar */}
      <nav className="w-[200px] shrink-0">
        <div className="flex flex-col gap-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`text-left px-3 h-[36px] text-body-sm rounded-md transition-fast ${
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
        {activeSection === "api-keys" && <PlaceholderSection title="API Keys" />}
        {activeSection === "wallet" && <PlaceholderSection title="Wallet" />}
      </div>
    </div>
  );
}

function TradingSettings() {
  const [orderType, setOrderType] = useState("midpoint");
  const [slippage, setSlippage] = useState("0.5");
  const [confirmBeforeSubmit, setConfirmBeforeSubmit] = useState(true);
  const [defaultPrivacy, setDefaultPrivacy] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-h3 font-semibold">Trading Preferences</h2>

      {/* Default Order Type */}
      <div>
        <label className="text-body-sm text-text-secondary mb-2 block">Default Order Type</label>
        <div className="flex gap-1 bg-bg-base rounded-md p-1 w-fit">
          {["midpoint", "limit", "twap"].map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`px-4 h-[32px] text-body-sm font-medium rounded-sm transition-fast capitalize ${
                orderType === t
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Default Slippage */}
      <div>
        <label className="text-body-sm text-text-secondary mb-2 block">Default Slippage</label>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-bg-base rounded-md p-1">
            {["0.1", "0.5", "1.0"].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-3 h-[32px] text-body-sm font-mono rounded-sm transition-fast ${
                  slippage === s
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Custom"
            className="w-[100px] h-[36px] bg-bg-base border border-border rounded-md px-3 text-body-sm font-mono outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Toggles */}
      <Toggle
        label="Confirm Before Submit"
        description="Show confirmation dialog before submitting orders"
        checked={confirmBeforeSubmit}
        onChange={setConfirmBeforeSubmit}
      />
      <Toggle
        label="Default Privacy Mode"
        description="Enable privacy mode by default for all orders"
        checked={defaultPrivacy}
        onChange={setDefaultPrivacy}
      />
    </div>
  );
}

function DisplaySettings() {
  const [currency, setCurrency] = useState("USD");
  const [decimals, setDecimals] = useState("4");
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-h3 font-semibold">Display & Appearance</h2>

      {/* Currency */}
      <div>
        <label className="text-body-sm text-text-secondary mb-2 block">Display Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="h-[36px] px-3 bg-bg-base border border-border rounded-md text-body-sm text-text-primary outline-none"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Decimal Places */}
      <div>
        <label className="text-body-sm text-text-secondary mb-2 block">Decimal Places</label>
        <div className="flex gap-1 bg-bg-base rounded-md p-1 w-fit">
          {["2", "4", "6"].map((d) => (
            <button
              key={d}
              onClick={() => setDecimals(d)}
              className={`px-4 h-[32px] text-body-sm font-medium rounded-sm transition-fast ${
                decimals === d
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <Toggle
        label="Compact Mode"
        description="Reduce spacing and font sizes for denser information display"
        checked={compactMode}
        onChange={setCompactMode}
      />
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
