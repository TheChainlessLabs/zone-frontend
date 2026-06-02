"use client";

import * as React from "react";
import { formatUnits, type Address, type Hex } from "viem";
import {
  useAccount,
  useSignMessage,
  useSwitchChain,
  useWalletClient,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import {
  OMEGA_ZONE,
  OMEGA_ZONE_ADDRESSES,
  OMEGA_ZONE_CHAIN_ID,
  OMEGA_ZONE_CHAIN_NAME,
  buildZoneRpcAuthToken,
  getTempoNativeAuthSigner,
  getZoneAuthorizationTokenInfo,
  getZoneInfo,
  persistZoneRpcAuthToken,
  readPersistedZoneRpcAuthToken,
  readPrivateDarkpoolBalance,
  readPrivateZoneOalphaBalance,
  readPrivateZonePathUsdBalance,
  type AuthorizationTokenInfoResponse,
  type ZoneInfoResponse,
} from "@/lib/zone";

interface ZoneSnapshot {
  authToken: Hex;
  authInfo: AuthorizationTokenInfoResponse;
  zoneInfo: ZoneInfoResponse;
  pathUsdBalance: bigint;
  oalphaBalance: bigint;
  darkpoolPathUsdBalance: bigint;
  darkpoolOalphaBalance: bigint;
}

export function OmegaZoneStatus() {
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  const signMessage = useSignMessage();
  const switchChain = useSwitchChain();

  const [snapshot, setSnapshot] = React.useState<ZoneSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const connectedAddress = account.address;
  const onZone = account.chainId === OMEGA_ZONE_CHAIN_ID;
  const busy = signMessage.isPending;

  const authorize = React.useCallback(async () => {
    if (!connectedAddress) {
      setErrorMessage("Connect Tempo Wallet first.");
      return;
    }

    setErrorMessage(null);
    try {
      const authToken =
        readPersistedZoneRpcAuthToken(connectedAddress) ??
        (await buildZoneRpcAuthToken({
          account: connectedAddress,
          signMessage: ({ account: signerAccount, message }) =>
            signMessage.signMessageAsync({
              account: signerAccount,
              message,
            }),
          nativeSigner: getTempoNativeAuthSigner(walletClient),
        }));
      persistZoneRpcAuthToken(authToken, connectedAddress);

      const [
        authInfo,
        zoneInfo,
        pathUsdBalance,
        oalphaBalance,
        darkpoolPathUsdBalance,
        darkpoolOalphaBalance,
      ] =
        await Promise.all([
          getZoneAuthorizationTokenInfo(authToken),
          getZoneInfo(authToken),
          readPrivateZonePathUsdBalance(authToken, connectedAddress),
          readPrivateZoneOalphaBalance(authToken, connectedAddress),
          readPrivateDarkpoolBalance(authToken, connectedAddress),
          readPrivateDarkpoolBalance(
            authToken,
            connectedAddress,
            OMEGA_ZONE_ADDRESSES.oalpha,
          ),
        ]);

      setSnapshot({
        authToken,
        authInfo,
        zoneInfo,
        pathUsdBalance,
        oalphaBalance,
        darkpoolPathUsdBalance,
        darkpoolOalphaBalance,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSnapshot(null);
    }
  }, [connectedAddress, signMessage, walletClient]);

  const switchToZone = React.useCallback(() => {
    switchChain.switchChain({ chainId: OMEGA_ZONE_CHAIN_ID });
  }, [switchChain]);

  return (
    <Card className="flex flex-col gap-5 p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Omega Zone
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Status state={snapshot ? "settled" : "pending"} />
          <span className="text-sm">
            {snapshot ? "Private RPC authorized." : "Private RPC pending."}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ZoneField label="Zone" value={OMEGA_ZONE_CHAIN_NAME} />
        <ZoneField label="Chain ID" value={String(OMEGA_ZONE.chainId)} />
        <ZoneField label="Zone ID" value={String(OMEGA_ZONE.zoneId)} />
        <ZoneField label="Account" value={connectedAddress ?? "Not connected"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BalanceField
          label="PATH.USD zone balance"
          value={snapshot ? formatToken(snapshot.pathUsdBalance, "PATH.USD") : "Authorize"}
        />
        <BalanceField
          label="OALPHA zone balance"
          value={snapshot ? formatToken(snapshot.oalphaBalance, "OALPHA") : "Authorize"}
        />
        <BalanceField
          label="PATH.USD darkpool"
          value={snapshot ? formatToken(snapshot.darkpoolPathUsdBalance, "PATH.USD") : "Authorize"}
        />
        <BalanceField
          label="OALPHA darkpool"
          value={snapshot ? formatToken(snapshot.darkpoolOalphaBalance, "OALPHA") : "Authorize"}
        />
      </div>

      <div className="grid gap-2 text-xs text-[var(--muted-foreground)]">
        <AddressLine label="Portal" value={OMEGA_ZONE_ADDRESSES.portal} />
        <AddressLine label="Darkpool" value={OMEGA_ZONE_ADDRESSES.darkpool} />
        <AddressLine label="PATH.USD" value={OMEGA_ZONE_ADDRESSES.pathUsd} />
        <AddressLine label="OALPHA" value={OMEGA_ZONE_ADDRESSES.oalpha} />
      </div>

      {snapshot ? (
        <div className="grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
          <ZoneField label="Token expires" value={snapshot.authInfo.expiresAt} />
          <ZoneField
            label="Enabled tokens"
            value={String(snapshot.zoneInfo.zoneTokens.length)}
          />
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs leading-relaxed text-[var(--destructive)]"
        >
          <Icon.Failed size={14} aria-hidden className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!onZone && connectedAddress ? (
          <Button
            variant="outline"
            onClick={switchToZone}
            disabled={switchChain.isPending}
            className="min-h-[44px] md:min-h-0"
          >
            <Icon.Trade aria-hidden />
            Switch to Omega Zone
          </Button>
        ) : null}
        <Button
          onClick={authorize}
          disabled={!connectedAddress || busy}
          className="min-h-[44px] md:min-h-0"
        >
          {busy ? <ConnectingSpinner /> : <Icon.Sign aria-hidden />}
          {snapshot ? "Refresh private state" : "Authorize private RPC"}
        </Button>
      </div>
    </Card>
  );
}

function ZoneField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </Label>
      <span className="truncate font-mono text-sm">{value}</span>
    </div>
  );
}

function BalanceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-lg tabular-nums">{value}</span>
    </div>
  );
}

function AddressLine({ label, value }: { label: string; value: Address }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2">
      <span className="font-mono uppercase tracking-[0.14em]">{label}</span>
      <span className="truncate font-mono text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function ConnectingSpinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent"
    />
  );
}

function formatToken(value: bigint, symbol: string): string {
  const formatted = formatUnits(value, 6);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmedFraction = fraction.replace(/0+$/, "").slice(0, 6);
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return trimmedFraction
    ? `${groupedWhole}.${trimmedFraction} ${symbol}`
    : `${groupedWhole} ${symbol}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Omega Zone private RPC request failed.";
}
