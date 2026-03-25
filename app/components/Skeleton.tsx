import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-bg-elevated animate-pulse rounded-sm ${className}`}
      {...props}
    />
  );
}

interface SkeletonRowProps extends HTMLAttributes<HTMLDivElement> {
  height: string;
  columns: { width: string; align?: "left" | "right" }[];
}

export function SkeletonRow({ height, columns, ...props }: SkeletonRowProps) {
  return (
    <div
      className="flex items-center px-3"
      style={{ height }}
      {...props}
    >
      {columns.map((col, i) => (
        <div
          key={i}
          className={`flex ${col.align === "right" ? "justify-end" : "justify-start"}`}
          style={{ width: col.width }}
        >
          <Skeleton className="h-[14px] rounded-sm" style={{ width: "60%" }} />
        </div>
      ))}
    </div>
  );
}
