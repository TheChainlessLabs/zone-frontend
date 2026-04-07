"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSignTypedData } from "wagmi";
import { config } from "../config";
import { eip712Types } from "../eip712Types";
import { createAccount } from "../apiClient";
import { ApiError } from "../apiError";

interface UseAccountRegistrationParams {
  address: `0x${string}` | undefined;
  accountId: number | null;
  setAccountId: (id: number) => void;
}

export function useAccountRegistration({
  address,
  accountId,
  setAccountId,
}: UseAccountRegistrationParams) {
  const { signTypedDataAsync } = useSignTypedData();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const register = useCallback(
    async (addr: `0x${string}`) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setIsRegistering(true);
      setRegistrationError(null);

      try {
        const signature = await signTypedDataAsync({
          domain: config.eip712Domain,
          types: {
            CreateAccountRequest: eip712Types.CreateAccountRequest,
          },
          primaryType: "CreateAccountRequest",
          message: {
            owner: addr,
            nonce: BigInt(0),
          },
        });

        const result = await createAccount({
          owner: addr,
          signature,
          nonce: 0,
        });

        localStorage.setItem(
          `omega_account_${addr}`,
          String(result.account_id),
        );
        setAccountId(result.account_id);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // Account already exists — read from localStorage or treat as success
          const stored = localStorage.getItem(`omega_account_${addr}`);
          if (stored) {
            setAccountId(Number(stored));
          }
          return;
        }

        // User rejected signing — don't show error toast
        if (
          err instanceof Error &&
          (err.message.includes("User rejected") ||
            err.message.includes("user rejected"))
        ) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Account registration failed";
        setRegistrationError(message);
      } finally {
        setIsRegistering(false);
        inFlightRef.current = false;
      }
    },
    [signTypedDataAsync, setAccountId],
  );

  useEffect(() => {
    if (!address || accountId !== null) return;
    register(address);
  }, [address, accountId, register]);

  return { isRegistering, registrationError };
}
