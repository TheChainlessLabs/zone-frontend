"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ShoppingCart,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNotifications, type Notification } from "@/lib/useNotifications";

const DISPLAY_LIMIT = 20;

function iconForType(type: Notification["type"]) {
  switch (type) {
    case "order_placed":
      return <ShoppingCart size={14} className="text-accent shrink-0" />;
    case "order_filled":
      return <CheckCircle2 size={14} className="text-success shrink-0" />;
    case "order_cancelled":
      return <XCircle size={14} className="text-warning shrink-0" />;
    case "error":
      return <AlertCircle size={14} className="text-error shrink-0" />;
  }
}

function relativeTime(timestamp: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllRead } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const displayed = notifications.slice(0, DISPLAY_LIMIT);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-[30px] h-[30px] rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-fast"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-text-inverse px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[38px] w-[320px] bg-bg-elevated border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <span className="text-body-sm font-semibold text-text-primary">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[12px] text-accent hover:text-accent-hover transition-fast"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <Bell size={24} className="mb-2 opacity-40" />
                <span className="text-body-sm">No notifications yet</span>
              </div>
            ) : (
              displayed.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 transition-fast ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="mt-0.5">{iconForType(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary truncate">
                      {n.title}
                    </p>
                    <p className="text-[12px] text-text-muted truncate">
                      {n.message}
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                    {relativeTime(n.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
