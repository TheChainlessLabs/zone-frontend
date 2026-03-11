"use client";

import { X } from "lucide-react";
import { useToast } from "@/lib/useToast";

const borderColors: Record<string, string> = {
  success: "border-l-success",
  error: "border-l-error",
  warning: "border-l-warning",
  info: "border-l-info",
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[340px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-bg-surface border border-border rounded-lg p-4 border-l-4 ${borderColors[toast.type]} shadow-lg`}
          style={{ animation: "toast-enter 200ms ease-out" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-text-primary">
                {toast.title}
              </p>
              <p className="text-body-sm text-text-secondary mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary transition-fast shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
