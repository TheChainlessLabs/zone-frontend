"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  createElement,
  type ReactNode,
} from "react";
import type { ToastType, ToastMessage } from "./types";

type Action =
  | { type: "ADD"; toast: ToastMessage }
  | { type: "REMOVE"; id: string };

function reducer(state: ToastMessage[], action: Action): ToastMessage[] {
  switch (action.type) {
    case "ADD":
      return [...state.slice(-4), action.toast]; // cap at 5
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
  }
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      dispatch({ type: "ADD", toast: { id, type, title, message } });
      const delay = type === "error" ? 8000 : 5000;
      const timer = setTimeout(() => removeToast(id), delay);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return createElement(
    ToastContext.Provider,
    { value: { toasts, addToast, removeToast } },
    children
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
