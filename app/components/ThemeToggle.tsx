"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Mode = "dark" | "light";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("brand-theme")) as Mode | null;
    const initial: Mode = saved ?? "dark";
    setMode(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("brand-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="press-down inline-flex h-8 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)] px-3 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      {mode === "dark" ? <Moon size={14} /> : <Sun size={14} />}
      <span className="font-mono uppercase tracking-wider">{mode}</span>
    </button>
  );
}
