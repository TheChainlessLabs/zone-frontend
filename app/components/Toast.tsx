"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/lib/useToast";
import type { ToastType } from "@/lib/types";

const SEVERITY: Record<ToastType, { icon: LucideIcon; tone: string }> = {
  success: { icon: CheckCircle, tone: "text-success" },
  error: { icon: AlertCircle, tone: "text-error" },
  warning: { icon: AlertTriangle, tone: "text-warning" },
  info: { icon: Info, tone: "text-text-secondary" },
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[340px]">
      {toasts.map((toast) => {
        const { icon: Icon, tone } = SEVERITY[toast.type];
        return (
          <div
            key={toast.id}
            className="bg-bg-surface border border-border rounded-md p-4 shadow-md"
            style={{ animation: "toast-enter 200ms ease-out" }}
          >
            <div className="flex items-start gap-3">
              <Icon size={16} className={`shrink-0 mt-0.5 ${tone}`} aria-hidden />
              <div className="flex-1 min-w-0">
                <p className={`text-body-sm font-medium ${tone}`}>
                  {toast.title}
                </p>
                <p className="text-body-sm text-text-secondary mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-primary transition-fast shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
