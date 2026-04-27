"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useConfirmBeforeSubmit } from "@/lib/hooks/useConfirmBeforeSubmit";

const sections = [
  { key: "trading", label: "Trading" },
  { key: "privacy", label: "Privacy" },
] as const;

type Section = (typeof sections)[number]["key"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("trading");

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:min-h-[600px]">
      {/* Sidebar — horizontal scroll on mobile, vertical on desktop */}
      <nav className="w-full md:w-[200px] shrink-0">
        <div className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar bg-bg-surface md:bg-transparent border border-border md:border-0 rounded-md md:rounded-none p-1 md:p-0">
          {sections.map((s) => {
            const isActive = activeSection === s.key;
            return (
              <motion.button
                key={s.key}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                onClick={() => setActiveSection(s.key)}
                className={`relative shrink-0 text-left px-3 h-[36px] text-body-sm rounded-md transition-fast whitespace-nowrap ${
                  isActive
                    ? "text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="settings-active-section"
                    aria-hidden
                    className="absolute inset-0 bg-bg-elevated rounded-md"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
                <span className="relative">{s.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-[600px]">
        {activeSection === "trading" && <TradingSettings />}
        {activeSection === "privacy" && <PrivacySettings />}
      </div>
    </div>
  );
}

function TradingSettings() {
  const [orderType, setOrderType] = useState("midpoint");
  const [slippage, setSlippage] = useState("0.5");
  const [confirmBeforeSubmit, setConfirmBeforeSubmit] = useConfirmBeforeSubmit();
  const [defaultPrivacy, setDefaultPrivacy] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [decimals, setDecimals] = useState("4");
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <Fieldset
        title="Execution"
        description="Default order behaviour and confirmation flow."
      >
        <SettingRow
          label="Default Order Type"
          description="Pre-selected on the trading form"
        >
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
            {[
              { key: "midpoint", label: "Midpoint Peg" },
              { key: "limit", label: "Limit" },
            ].map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                onClick={() => setOrderType(t.key)}
                className={`px-3 h-[28px] text-[12px] font-medium rounded-sm transition-fast whitespace-nowrap ${
                  orderType === t.key
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t.label}
              </motion.button>
            ))}
          </div>
        </SettingRow>

        <Divider />

        <SettingRow
          label="Default Slippage"
          description="Max price deviation from midpoint"
        >
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
            {["0.1", "0.5", "1.0"].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                onClick={() => setSlippage(s)}
                className={`px-2.5 h-[28px] text-[12px] font-mono rounded-sm transition-fast ${
                  slippage === s
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {s}%
              </motion.button>
            ))}
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={() => setSlippage("custom")}
              className={`px-2.5 h-[28px] text-[12px] rounded-sm transition-fast ${
                slippage === "custom"
                  ? "bg-accent text-text-inverse"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Custom
            </motion.button>
          </div>
        </SettingRow>

        <Divider />

        <Toggle
          label="Confirm Before Submit"
          description="Show confirmation dialog before placing orders"
          checked={confirmBeforeSubmit}
          onChange={setConfirmBeforeSubmit}
        />

        <Divider />

        <Toggle
          label="Default Privacy Mode"
          description="Execute all orders in privacy mode by default"
          checked={defaultPrivacy}
          onChange={setDefaultPrivacy}
        />
      </Fieldset>

      <Fieldset
        title="Display"
        description="How rates and balances render on the trading screen."
      >
        <SettingRow
          label="Display Currency"
          description="Base currency for portfolio value"
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

        <Divider />

        <SettingRow
          label="Price Decimal Places"
          description="Number of decimal places for FX rates"
        >
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
            {["2", "4", "6"].map((d) => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                onClick={() => setDecimals(d)}
                className={`w-[28px] h-[28px] text-[12px] font-medium rounded-sm transition-fast ${
                  decimals === d
                    ? "bg-accent text-text-inverse"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {d}
              </motion.button>
            ))}
          </div>
        </SettingRow>

        <Divider />

        <Toggle
          label="Compact Mode"
          description="Reduce spacing for denser information display"
          checked={compactMode}
          onChange={setCompactMode}
        />
      </Fieldset>
    </div>
  );
}

function PrivacySettings() {
  const [privacyDefault, setPrivacyDefault] = useState(true);

  return (
    <Fieldset
      title="Privacy"
      description="Defaults for the on-chain privacy claim flow."
    >
      <Toggle
        label="Privacy Mode Default"
        description="Enable privacy mode for all new transactions by default"
        checked={privacyDefault}
        onChange={setPrivacyDefault}
      />
    </Fieldset>
  );
}

function Fieldset({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 pb-3 border-b border-border-subtle">
        <h2 className="text-body-sm font-semibold text-text-primary">{title}</h2>
        <p className="text-[12px] text-text-muted">{description}</p>
      </header>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="border-t border-border-subtle" />;
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
      <motion.button
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`w-[44px] h-[24px] rounded-full shrink-0 transition-fast relative ${
          checked ? "bg-accent" : "bg-bg-elevated"
        }`}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-text-primary"
        />
      </motion.button>
    </div>
  );
}
