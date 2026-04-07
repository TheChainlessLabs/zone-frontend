"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccountNonce } from "@/lib/apiClient";

export function useNonce(accountId: number | null) {
  const queryClient = useQueryClient();
  const localNonceRef = useRef<number | null>(null);
  const prevAccountIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Reset local state when accountId changes (wallet switch)
  useEffect(() => {
    if (prevAccountIdRef.current !== accountId) {
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
        localNonceRef.current = data.nonce;
      }
      setIsReady(true);
    }
  }, [data?.nonce]);

  const next = useCallback(() => {
    if (localNonceRef.current === null) {
      throw new Error("Nonce not ready — wait for isReady before signing");
    }
    return localNonceRef.current;
  }, []);

  const increment = useCallback(() => {
    if (localNonceRef.current !== null) {
      localNonceRef.current += 1;
    }
  }, []);

  const resync = useCallback(() => {
    localNonceRef.current = null;
    setIsReady(false);
    if (accountId) {
      queryClient.invalidateQueries({ queryKey: ["nonce", accountId] });
    }
  }, [accountId, queryClient]);

  return { next, increment, resync, isReady };
}
