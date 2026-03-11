import { mockPipelineState } from "@/lib/mockData";
import type { PipelineStep } from "@/lib/types";
import { Check } from "lucide-react";

const steps: { key: PipelineStep; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "matched", label: "Matched" },
  { key: "aggregation-locked", label: "Agg Lock" },
  { key: "batched", label: "Batched" },
  { key: "settled", label: "Settled" },
  { key: "proven", label: "Proven" },
];

export default function PipelineTracker() {
  const { currentStep, completedSteps } = mockPipelineState;

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4">
      <h3 className="text-label-uppercase text-text-muted mb-3">Order Pipeline</h3>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = currentStep === step.key;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-body-sm ${
                    isCompleted
                      ? "bg-success text-text-inverse"
                      : isCurrent
                        ? "bg-accent text-text-inverse"
                        : "bg-bg-elevated text-text-muted"
                  }`}
                  style={isCurrent ? { animation: "pulse 2s infinite" } : undefined}
                >
                  {isCompleted ? <Check size={12} /> : (i + 1)}
                </div>
                <span className="text-label-uppercase text-text-muted text-center whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-1 mt-[-18px] ${
                    isCompleted ? "bg-success" : "bg-bg-elevated"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
