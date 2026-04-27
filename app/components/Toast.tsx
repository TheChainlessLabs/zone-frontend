"use client";

import { AnimatePresence, motion } from "motion/react";
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

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[340px] pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, tone } = SEVERITY[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-bg-surface border border-border rounded-md p-4 shadow-md pointer-events-auto"
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
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
