"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ExchangeOverview from "@/components/ExchangeOverview";
import BatchExplorer from "@/components/BatchExplorer";
import ProtocolStats from "@/components/ProtocolStats";

const tabs = ["Batches", "Withdrawals", "Order Lookup"] as const;

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Batches");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <h1 className="text-h2 font-semibold">Explorer</h1>
        <ExchangeOverview />

        {/* Tabs */}
        <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1 w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 h-[32px] text-body-sm font-medium rounded-sm transition-fast shrink-0 ${
                activeTab === tab
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Batches" && <BatchExplorer />}
        {activeTab === "Withdrawals" && (
          <div className="bg-bg-surface border border-border rounded-lg flex items-center justify-center h-[200px]">
            <span className="text-body-sm text-text-muted">Withdrawal explorer coming soon</span>
          </div>
        )}
        {activeTab === "Order Lookup" && (
          <div className="bg-bg-surface border border-border rounded-lg p-6">
            <label className="text-label-uppercase text-text-muted mb-2 block">Order ID</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="ORD-20260306-0042"
                className="flex-1 h-[44px] bg-bg-base border border-border rounded-md px-4 text-body-sm font-mono outline-none text-text-primary placeholder:text-text-muted"
              />
              <button className="h-[44px] px-6 bg-accent text-text-inverse rounded-md text-body-sm font-medium hover:bg-accent-hover transition-fast">
                Search
              </button>
            </div>
          </div>
        )}

        {/* Protocol Stats */}
        <ProtocolStats />
      </div>
    </div>
  );
}
