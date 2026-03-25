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
  columns: { width: string }[];
}

export function SkeletonRow({ height, columns, ...props }: SkeletonRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-3"
      style={{ height }}
      {...props}
    >
      {columns.map((col, i) => (
        <Skeleton
          key={i}
          className="h-[14px] rounded-sm"
          style={{ width: col.width }}
        />
      ))}
    </div>
  );
}
