import { Skeleton } from "@/components/Skeleton";

export default function TradeLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Navbar placeholder */}
      <div className="h-[48px] bg-bg-base border-b border-border-subtle" />
      {/* BBO marquee placeholder */}
      <div className="h-[40px] bg-bg-base border-b border-border-subtle" />
      {/* Main content */}
      <div className="flex-1 flex gap-0">
        {/* Pair selector skeleton */}
        <div className="hidden lg:block w-[240px] bg-bg-surface border-r border-border p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        {/* Chart + order form */}
        <div className="flex-1 flex flex-col">
          <Skeleton className="flex-1 m-4 rounded-lg" />
        </div>
        {/* Right sidebar */}
        <div className="hidden lg:block w-[380px] bg-bg-surface border-l border-border p-4">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-[200px] w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
