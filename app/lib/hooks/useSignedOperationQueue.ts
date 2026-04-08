"use client";
import { useRef, useCallback, useState } from "react";

export function useSignedOperationQueue() {
  const lockRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    if (lockRef.current) {
      throw new Error("Another signed operation is in progress");
    }
    lockRef.current = true;
    setIsLocked(true);
    try {
      return await operation();
    } finally {
      lockRef.current = false;
      setIsLocked(false);
    }
  }, []);

  return { execute, isLocked };
}
