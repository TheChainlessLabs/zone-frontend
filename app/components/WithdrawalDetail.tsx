"use client";

import Link from "next/link";
import { mockWithdrawal } from "@/lib/mockData";
import type { WithdrawalStatus } from "@/lib/types";
import { Check, Download, Shield } from "lucide-react";

const statusOrder: WithdrawalStatus[] = ["initiated", "proof-generated", "claimable", "claimed", "confirmed"];

const statusColors: Record<WithdrawalStatus, string> = {
  initiated: "bg-info/20 text-info",
  "proof-generated": "bg-info/20 text-info",
  claimable: "bg-warning/20 text-warning",
  claimed: "bg-success/20 text-success",
  confirmed: "bg-success/20 text-success",
};

const modeColors: Record<string, string> = {
  standard: "bg-bg-elevated text-text-secondary",
  privacy: "bg-info/20 text-info",
};

interface WithdrawalDetailProps {
  withdrawalId: string;
}

export default function WithdrawalDetail({ withdrawalId }: WithdrawalDetailProps) {
  const wd = { ...mockWithdrawal, id: withdrawalId };
  const currentIdx = statusOrder.indexOf(wd.status);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Link
        href="/portfolio"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &larr; Back to Portfolio
      </Link>

      {/* Header with badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-h3 md:text-h2 font-semibold">Withdrawal</h2>
        <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${modeColors[wd.mode]}`}>
          {wd.mode}
        </span>
        <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[wd.status]}`}>
          {wd.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Withdrawal details */}
        <div className="bg-bg-surface border border-border rounded-lg p-4 md:p-6">
          <h3 className="text-label-uppercase text-text-muted mb-4">Withdrawal Details</h3>
          <div className="flex flex-col gap-3">
            <Row label="Amount" value={`${wd.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${wd.token}`} mono />
            <Row label="Destination" value={wd.destination} mono />
            <Row label="Chain" value={wd.chain} />
            <div className="flex justify-between text-body-sm items-center">
              <span className="text-text-muted">Mode</span>
              <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${modeColors[wd.mode]}`}>
                {wd.mode}
              </span>
            </div>
            <Row label="Fee" value={`${wd.fee.toFixed(2)} ${wd.token}`} mono />
            <Row label="Initiated" value={wd.initiatedAt} mono />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-bg-surface border border-border rounded-lg p-4 md:p-6">
          <h3 className="text-label-uppercase text-text-muted mb-4">Timeline</h3>
          <div className="flex flex-col gap-0">
            {wd.timeline.map((step, i) => {
              const stepIdx = statusOrder.indexOf(step.step);
              const isCompleted = stepIdx <= currentIdx;
              const isCurrent = stepIdx === currentIdx;

              return (
                <div key={step.step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? step.step === "claimable"
                            ? "bg-warning text-text-inverse"
                            : "bg-success text-text-inverse"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {isCompleted ? <Check size={10} /> : null}
                    </div>
                    {i < wd.timeline.length - 1 && (
                      <div className={`w-px h-6 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
                    )}
                  </div>
                  <div className="flex flex-col -mt-0.5">
                    <span
                      className={`text-body-sm ${
                        isCurrent ? "text-text-primary font-medium" : isCompleted ? "text-success" : "text-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.time ? (
                      <span className="text-[11px] text-text-muted font-mono font-tabular">
                        {step.time}
                      </span>
                    ) : (
                      <span className="text-[11px] text-text-muted">Pending</span>
                    )}
                    {isCurrent && step.step === "claimable" && (
                      <span className="text-[11px] text-text-muted mt-0.5">Download proof and submit on-chain</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Privacy proof card — shown for privacy withdrawals */}
      {wd.mode === "privacy" && (
        <div className="bg-bg-surface border border-border rounded-lg p-4 md:p-6">
          <h3 className="text-body-sm font-semibold mb-2">Privacy Proof</h3>
          <p className="text-[12px] text-text-muted mb-3">
            Your withdrawal proof has been generated. Download it to claim your funds on-chain.
          </p>
          <div className="mb-4">
            <span className="text-label-uppercase text-text-muted">Proof Hash</span>
            <p className="text-[12px] font-mono font-tabular text-accent mt-0.5">
              0xc9e2...7f1b
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-[40px] flex items-center justify-center gap-2 border border-border rounded-md text-body-sm font-medium text-text-secondary hover:bg-bg-elevated transition-fast">
              <Shield size={14} />
              Verify Proof
            </button>
            <button className="flex-1 h-[40px] flex items-center justify-center gap-2 rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast">
              <Download size={14} />
              Download & Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-body-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`${mono ? "font-mono font-tabular" : ""} text-text-primary capitalize`}>
        {value}
      </span>
    </div>
  );
}
