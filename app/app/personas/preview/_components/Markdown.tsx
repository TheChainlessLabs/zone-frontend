"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

/**
 * Tightly-styled markdown renderer for persona critique + inspirations.
 * Headings, lists, links, code, and quotes are mapped to the design-system
 * tokens so the persona's voice doesn't fight the surrounding UI.
 */
export function Markdown({ source }: { source: string }) {
  return (
    <article className="max-w-prose text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ className, ...props }) => (
            <h1
              className={cn(
                "mt-6 text-2xl font-medium tracking-tight first:mt-0",
                className,
              )}
              {...props}
            />
          ),
          h2: ({ className, ...props }) => (
            <h2
              className={cn(
                "mt-6 text-lg font-medium tracking-tight",
                className,
              )}
              {...props}
            />
          ),
          h3: ({ className, ...props }) => (
            <h3
              className={cn(
                "mt-5 text-base font-medium tracking-tight",
                className,
              )}
              {...props}
            />
          ),
          p: ({ className, ...props }) => (
            <p
              className={cn("mt-3 text-[var(--foreground)]", className)}
              {...props}
            />
          ),
          ul: ({ className, ...props }) => (
            <ul
              className={cn(
                "mt-3 flex list-disc flex-col gap-1.5 pl-5",
                className,
              )}
              {...props}
            />
          ),
          ol: ({ className, ...props }) => (
            <ol
              className={cn(
                "mt-3 flex list-decimal flex-col gap-1.5 pl-5",
                className,
              )}
              {...props}
            />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("text-[var(--foreground)]", className)} {...props} />
          ),
          a: ({ className, ...props }) => (
            <a
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                "text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-2 transition-colors hover:decoration-[var(--foreground)]",
                className,
              )}
              {...props}
            />
          ),
          code: ({ className, ...props }) => (
            <code
              className={cn(
                "rounded-sm bg-[var(--muted)] px-1 py-0.5 font-mono text-[12px] text-[var(--foreground)]",
                className,
              )}
              {...props}
            />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn(
                "mt-3 border-l-2 border-[var(--border)] pl-3 italic text-[var(--muted-foreground)]",
                className,
              )}
              {...props}
            />
          ),
          hr: ({ className, ...props }) => (
            <hr
              className={cn("my-6 border-[var(--border)]", className)}
              {...props}
            />
          ),
          strong: ({ className, ...props }) => (
            <strong
              className={cn(
                "font-medium text-[var(--foreground)]",
                className,
              )}
              {...props}
            />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
}
