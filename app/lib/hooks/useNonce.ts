"use client";

import { useRef, useCallback } from "react";

export function useNonce() {
  const nonceRef = useRef(0);

  const next = useCallback(() => {
    return nonceRef.current;
  }, []);

  const increment = useCallback(() => {
    nonceRef.current += 1;
  }, []);

  return { next, increment };
}
