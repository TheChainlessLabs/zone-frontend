"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />

      {/* Desktop: centered modal */}
      <div
        className="hidden md:flex items-center justify-center absolute inset-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-bg-surface border border-border rounded-lg p-6 max-w-[480px] w-full mx-4"
          style={{ animation: "modal-enter 150ms ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-h3 font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-fast"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div
        className="md:hidden absolute bottom-0 left-0 right-0 bg-bg-surface rounded-t-2xl"
        style={{ animation: "sheet-enter 250ms cubic-bezier(0.32, 0.72, 0, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full bg-text-muted/30" />
        </div>
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-h3 font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-fast"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
