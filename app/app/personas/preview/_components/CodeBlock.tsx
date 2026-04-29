"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";

/**
 * CodeBlock — non-highlighted source viewer for the redesign artefact.
 * Geist Mono, line numbers, copy-to-clipboard. Syntax highlighting lives
 * in editors where the reviewer can open the file via the path link
 * shown above the block.
 */
export function CodeBlock({
  source,
  filename,
}: {
  source: string;
  filename: string;
}) {
  const lines = React.useMemo(() => source.split("\n"), [source]);
  const [copied, setCopied] = React.useState(false);
  const onCopy = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }, [source]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {filename} · {lines.length} lines
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          aria-label="Copy source"
          className="h-7 px-2"
        >
          {copied ? (
            <Icon.Match className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden />
          ) : (
            <Icon.Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="max-h-[70vh] overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 p-4 font-mono text-[12px] leading-[1.6] text-[var(--foreground)]">
        <code className="block">
          {lines.map((line, idx) => (
            <span key={idx} className="grid grid-cols-[3rem_1fr]">
              <span className="select-none text-right pr-4 text-[var(--muted-foreground)]">
                {idx + 1}
              </span>
              <span className="whitespace-pre">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
