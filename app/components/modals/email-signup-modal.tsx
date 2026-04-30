"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ModalShell } from "./modal-shell";

/**
 * EmailSignupModal — v0 entry point for the closed-alpha (omega-docs#5 PRD,
 * Decision #12). Email + magic link replaces wallet-connect at v0; the
 * server pre-generates a trading address per email. Wallet-first auth
 * returns at Phase 4 when self-custody applies — see
 * `connect-wallet-modal.tsx` for that mechanism.
 *
 * State machine (mock at v0; real backend lands in M6):
 *   idle             — email input + Send magic link
 *   submitting       — disabled form, "Sending..."
 *   sent             — "Check your inbox" with the entered email
 *   expired          — "Link expired" + Send new link
 *   invalid          — inline form error, retry inline
 *   already-claimed  — "Already registered" + Resend magic link
 *   not-on-allowlist — "Closed alpha" + contact link
 *
 * The `state` prop is the source of truth — driven by the consumer (or by
 * the `/system` showcase). When the modal is in `idle` it owns a small
 * internal state machine for submit + 600ms simulated delay → flips
 * `internalState` to `submitting` then `sent`. Real backend integration
 * will replace the timeout with an API call.
 *
 * Voice rules (omega-docs/03-brand/messaging.md): direct, period-terminated,
 * no exclamation, no emoji, no marketing voice.
 */
export type EmailSignupState =
  | "idle"
  | "submitting"
  | "sent"
  | "expired"
  | "invalid"
  | "already-claimed"
  | "not-on-allowlist";

export interface EmailSignupModalProps {
  open: boolean;
  onClose: () => void;
  /** Source-of-truth state. The internal submit flow only fires when this
   *  starts as `idle`; pass an explicit state to pin the modal to one of the
   *  showcase variants. */
  state: EmailSignupState;
  /** Pre-fill / display email. Used as the displayed value in `sent`,
   *  `expired`, `already-claimed`. */
  email?: string;
  /** Optional submit handler — fired after the local validation passes and
   *  the simulated delay elapses. Receives the validated email. */
  onSubmit?: (email: string) => void;
  /** Optional handler for the "Use a different email" link from the `sent`
   *  view. Defaults to clearing the input + flipping back to `idle`. */
  onChangeEmail?: () => void;
  /** Override copy for the inline `invalid` error. */
  errorMessage?: string;
}

const SUBMIT_DELAY_MS = 600;
const ALLOWLIST_CONTACT = "mailto:alpha@omegamarkets.com";
// Pragmatic email regex — local-part@domain.tld, no whitespace. Strict
// validation lives server-side at M6.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSignupModal({
  open,
  onClose,
  state,
  email,
  onSubmit,
  onChangeEmail,
  errorMessage,
}: EmailSignupModalProps) {
  // Internal state — the modal owns its submit lifecycle when started from
  // `idle`. Showcase consumers that hard-pin a state simply pass that state
  // and the internal lifecycle is bypassed.
  const [internalState, setInternalState] =
    React.useState<EmailSignupState | null>(null);
  const [emailValue, setEmailValue] = React.useState<string>(email ?? "");
  const [inlineError, setInlineError] = React.useState<string | null>(null);
  const submitTimerRef = React.useRef<number | null>(null);

  // Sync the controlled email whenever the parent supplies a new value.
  React.useEffect(() => {
    setEmailValue(email ?? "");
  }, [email]);

  // Reset internal lifecycle whenever the parent state shifts or the modal
  // closes. This guarantees the modal always starts cleanly.
  React.useEffect(() => {
    if (!open) {
      setInternalState(null);
      setInlineError(null);
    }
  }, [open]);

  React.useEffect(() => {
    setInternalState(null);
    setInlineError(null);
  }, [state]);

  // Cleanup any in-flight submit timer.
  React.useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }
    };
  }, []);

  const effectiveState: EmailSignupState = internalState ?? state;
  const displayEmail = emailValue || email || "";

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = emailValue.trim();
      if (!EMAIL_RE.test(trimmed)) {
        setInlineError(
          errorMessage ?? "Enter a valid email address.",
        );
        setInternalState("invalid");
        return;
      }
      setInlineError(null);
      setInternalState("submitting");
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
      submitTimerRef.current = window.setTimeout(() => {
        setInternalState("sent");
        submitTimerRef.current = null;
        onSubmit?.(trimmed);
      }, SUBMIT_DELAY_MS);
    },
    [emailValue, errorMessage, onSubmit],
  );

  const handleChangeEmail = React.useCallback(() => {
    if (onChangeEmail) {
      onChangeEmail();
      return;
    }
    setEmailValue("");
    setInlineError(null);
    setInternalState("idle");
  }, [onChangeEmail]);

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={titleFor(effectiveState)}
      description={descriptionFor(effectiveState, displayEmail)}
    >
      {effectiveState === "idle" || effectiveState === "invalid" ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <label className="flex flex-col gap-1.5 text-left">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Email
            </span>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={emailValue}
              onChange={(e) => {
                setEmailValue(e.target.value);
                if (inlineError) setInlineError(null);
                if (effectiveState === "invalid") setInternalState("idle");
              }}
              placeholder="you@example.com"
              aria-invalid={effectiveState === "invalid"}
              aria-describedby={
                effectiveState === "invalid" ? "email-signup-error" : undefined
              }
              className={cn(
                "h-11",
                effectiveState === "invalid" &&
                  "border-[var(--destructive)] focus-visible:ring-[var(--destructive)]",
              )}
              required
            />
            {effectiveState === "invalid" && inlineError ? (
              <span
                id="email-signup-error"
                role="alert"
                className="text-xs text-[var(--destructive)]"
              >
                {inlineError}
              </span>
            ) : null}
          </label>
          <Button type="submit" className="min-h-[44px] md:min-h-0">
            <Icon.Mail aria-hidden />
            <span>Send magic link</span>
          </Button>
          <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            Already have an account? Use the same flow.
          </p>
        </form>
      ) : null}

      {effectiveState === "submitting" ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner />
          <Status state="submitting" label="Sending..." />
          <p className="text-sm text-[var(--muted-foreground)]">
            Sending your magic link.
          </p>
        </div>
      ) : null}

      {effectiveState === "sent" ? (
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center justify-center">
            <Status state="connected" label="Sent" />
          </div>
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            We sent a magic link to{" "}
            <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
              {displayEmail || "your inbox"}
            </span>
            . Click the link to activate.
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-xs underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              Use a different email
            </button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Close
            </Button>
          </div>
        </div>
      ) : null}

      {effectiveState === "expired" ? (
        <div className="flex flex-col gap-4">
          <Status state="failed" label="Link expired" />
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            Magic links expire after 15 minutes. Request a new one to sign in.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeEmail}
              className="min-h-[44px] md:min-h-0"
            >
              Send new link
            </Button>
          </div>
        </div>
      ) : null}

      {effectiveState === "already-claimed" ? (
        <div className="flex flex-col gap-4">
          <Status state="pending" label="Already registered" />
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            <span className="font-mono text-sm">
              {displayEmail || "This email"}
            </span>{" "}
            is already registered. Check your inbox for an active session, or
            contact us if locked out.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Close
            </Button>
            <Button
              onClick={handleChangeEmail}
              className="min-h-[44px] md:min-h-0"
            >
              Resend magic link
            </Button>
          </div>
        </div>
      ) : null}

      {effectiveState === "not-on-allowlist" ? (
        <div className="flex flex-col gap-4">
          <Status state="pending" label="Closed alpha" />
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            Omega is in closed alpha. Request access from the team to be
            added to the v0 allowlist.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Close
            </Button>
            <Button asChild className="min-h-[44px] md:min-h-0">
              <a href={ALLOWLIST_CONTACT}>
                <span>Request access</span>
                <Icon.External aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function titleFor(state: EmailSignupState): string {
  switch (state) {
    case "idle":
    case "invalid":
      return "Sign up";
    case "submitting":
      return "Sending";
    case "sent":
      return "Check your inbox";
    case "expired":
      return "Link expired";
    case "already-claimed":
      return "Already registered";
    case "not-on-allowlist":
      return "Closed alpha";
  }
}

function descriptionFor(
  state: EmailSignupState,
  email: string,
): React.ReactNode {
  switch (state) {
    case "idle":
    case "invalid":
      return "Enter your email. We'll send a magic link to activate your account.";
    case "submitting":
      return "Hold tight.";
    case "sent":
      return email
        ? `We sent a magic link to ${email}.`
        : "We sent a magic link to your inbox.";
    case "expired":
      return null;
    case "already-claimed":
      return null;
    case "not-on-allowlist":
      return null;
  }
}

/** Minimal CSS spinner — mirrors connect-wallet-modal. Respects
 *  `prefers-reduced-motion` via Tailwind's `motion-reduce:` utility. */
function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none"
    />
  );
}
