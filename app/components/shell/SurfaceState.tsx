"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";

export function SurfaceState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center shadow-none"
    >
      <p className="text-base font-medium leading-tight">{title}</p>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
      {action ? <div className="pt-2">{action}</div> : null}
    </Card>
  );
}
