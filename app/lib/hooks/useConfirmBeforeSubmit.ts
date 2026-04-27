"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "omega.confirmBeforeSubmit";

function readPref(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

/**
 * User preference: show the OrderConfirmationModal between submit click and
 * signing. Persisted to localStorage so the toggle in Settings has effect
 * across reloads. Default is `true` — opt out is explicit. High-stake
 * orders should always confirm regardless; that gate lives on the caller.
 */
export function useConfirmBeforeSubmit(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(true);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setEnabled(readPref());
  }, []);

  const update = useCallback((next: boolean) => {
    setEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    }
  }, []);

  return [enabled, update];
}
