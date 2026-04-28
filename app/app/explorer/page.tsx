"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ExchangeOverview from "@/components/ExchangeOverview";
import BatchExplorer from "@/components/BatchExplorer";
import ProtocolStats from "@/components/ProtocolStats";
import EmptyState from "@/components/EmptyState";

const tabs = ["Batches", "Withdrawals", "Order Lookup"] as const;

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Batches");

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-4 md:gap-6">
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
          <div className="bg-bg-surface border border-border rounded-lg">
            <EmptyState
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 7v6l7 5 7-5V7l-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M10 12V8m0 6h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
              title="No withdrawals yet"
              description="Withdrawal history will appear here once users begin withdrawing funds."
            />
          </div>
        )}
        {activeTab === "Order Lookup" && (
          <div className="bg-bg-surface border border-border rounded-lg p-4 md:p-6">
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
            <EmptyState
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
              title="Enter an order ID to look up"
              description="Search for any order by its ID to view execution details and status."
            />
          </div>
        )}

        {/* Protocol Stats */}
        <ProtocolStats />
      </div>
    </div>
  );
}
