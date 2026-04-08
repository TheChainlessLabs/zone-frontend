"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccountNonce } from "@/lib/apiClient";
import { devLog, devWarn } from "@/lib/devLog";

export function useNonce(accountId: number | null) {
  const queryClient = useQueryClient();
  const localNonceRef = useRef<number | null>(null);
  const prevAccountIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Reset local state when accountId changes (wallet switch)
  useEffect(() => {
    if (prevAccountIdRef.current !== accountId) {
      devLog("nonce", `accountId changed: ${prevAccountIdRef.current} → ${accountId}, resetting local nonce`);
      localNonceRef.current = null;
      setIsReady(false);
      prevAccountIdRef.current = accountId;
    }
  }, [accountId]);

  const { data } = useQuery({
    queryKey: ["nonce", accountId],
    queryFn: () => getAccountNonce(accountId!),
    enabled: !!accountId,
    refetchOnWindowFocus: true,
  });

  // Sync ref from query data: update when ref is null or server nonce is higher
  useEffect(() => {
    if (data?.nonce != null) {
      if (localNonceRef.current === null || data.nonce > localNonceRef.current) {
        devLog("nonce", `server nonce=${data.nonce}, local was ${localNonceRef.current} → updating`);
        localNonceRef.current = data.nonce;
      } else {
        devLog("nonce", `server nonce=${data.nonce}, local=${localNonceRef.current} → keeping local (ahead)`);
      }
      setIsReady(true);
    }
  }, [data?.nonce]);

  const next = useCallback(() => {
    if (localNonceRef.current === null) {
      devWarn("nonce", "next() called but nonce not ready!");
      throw new Error("Nonce not ready — wait for isReady before signing");
    }
    devLog("nonce", `next() → ${localNonceRef.current}`);
    return localNonceRef.current;
  }, []);

  const increment = useCallback(() => {
    if (localNonceRef.current !== null) {
      const prev = localNonceRef.current;
      localNonceRef.current += 1;
      devLog("nonce", `increment() ${prev} → ${localNonceRef.current}`);
    }
  }, []);

  const resync = useCallback(() => {
    devLog("nonce", `resync() — clearing local nonce, will re-fetch from server`);
    localNonceRef.current = null;
    setIsReady(false);
    if (accountId) {
      queryClient.invalidateQueries({ queryKey: ["nonce", accountId] });
    }
  }, [accountId, queryClient]);

  return { next, increment, resync, isReady };
}
