"use client";

import Link from "next/link";
import { mockWithdrawal } from "@/lib/mockData";
import type { WithdrawalStatus } from "@/lib/types";
import { Check } from "lucide-react";

const statusOrder: WithdrawalStatus[] = ["initiated", "proof-generated", "claimable", "claimed", "confirmed"];

interface WithdrawalDetailProps {
  withdrawalId: string;
}

export default function WithdrawalDetail({ withdrawalId }: WithdrawalDetailProps) {
  const wd = { ...mockWithdrawal, id: withdrawalId };
  const currentIdx = statusOrder.indexOf(wd.status);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/funding"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &lt; Back to Funding
      </Link>

      <h2 className="text-h2 font-semibold">Withdrawal {wd.id}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-bg-surface border border-border rounded-lg p-6">
          <h3 className="text-label-uppercase text-text-muted mb-4">Status</h3>
          <div className="flex flex-col gap-0">
            {wd.timeline.map((step, i) => {
              const stepIdx = statusOrder.indexOf(step.step);
              const isCompleted = stepIdx <= currentIdx;
              const isCurrent = stepIdx === currentIdx;

              return (
                <div key={step.step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-success text-text-inverse"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {isCompleted ? <Check size={12} /> : (i + 1)}
                    </div>
                    {i < wd.timeline.length - 1 && (
                      <div className={`w-px h-6 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-body-sm ${
                        isCurrent ? "text-text-primary font-medium" : "text-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.time && (
                      <span className="text-body-sm text-text-muted font-mono font-tabular" style={{ fontSize: "11px" }}>
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdrawal info */}
        <div className="bg-bg-surface border border-border rounded-lg p-6">
          <h3 className="text-label-uppercase text-text-muted mb-4">Withdrawal Info</h3>
          <div className="flex flex-col gap-3">
            <Row label="Amount" value={`${wd.amount.toLocaleString()} ${wd.token}`} mono />
            <Row label="Destination" value={wd.destination} mono />
            <Row label="Chain" value={wd.chain} />
            <Row label="Mode" value={wd.mode} />
            <Row label="Fee" value={`$${wd.fee.toFixed(2)}`} mono />
            <Row label="Initiated" value={wd.initiatedAt} mono />
          </div>
        </div>
      </div>

      {/* Claim button if claimable */}
      {wd.status === "claimable" && (
        <button className="h-[44px] w-fit px-8 rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast">
          Claim Withdrawal
        </button>
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
