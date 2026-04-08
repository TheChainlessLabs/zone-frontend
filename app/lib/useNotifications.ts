"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  createElement,
  type ReactNode,
} from "react";

export interface Notification {
  id: string;
  type: "order_placed" | "order_cancelled" | "order_filled" | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = "omega_notifications";
const MAX_NOTIFICATIONS = 50;

type Action =
  | { type: "LOAD"; notifications: Notification[] }
  | { type: "ADD"; notification: Notification }
  | { type: "MARK_ALL_READ" };

function reducer(state: Notification[], action: Action): Notification[] {
  switch (action.type) {
    case "LOAD":
      return action.notifications;
    case "ADD":
      return [action.notification, ...state].slice(0, MAX_NOTIFICATIONS);
    case "MARK_ALL_READ":
      return state.map((n) => (n.read ? n : { ...n, read: true }));
  }
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: Notification["type"],
    title: string,
    message: string
  ) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function persist(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Storage full or unavailable — ignore
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, dispatch] = useReducer(reducer, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Notification[];
        dispatch({ type: "LOAD", notifications: parsed.slice(0, MAX_NOTIFICATIONS) });
      }
    } catch {
      // Corrupt data — ignore
    }
  }, []);

  const addNotification = useCallback(
    (type: Notification["type"], title: string, message: string) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      };
      dispatch({ type: "ADD", notification });
    },
    []
  );

  const markAllRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_READ" });
  }, []);

  // Persist whenever notifications change (skip initial empty state)
  useEffect(() => {
    if (notifications.length > 0) {
      persist(notifications);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return createElement(
    NotificationContext.Provider,
    { value: { notifications, unreadCount, addNotification, markAllRead } },
    children
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
}
