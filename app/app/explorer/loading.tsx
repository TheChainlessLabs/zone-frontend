import { Skeleton } from "@/components/Skeleton";

export default function ExplorerLoading() {
  return (
    <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
      <Skeleton className="h-8 w-[100px]" />
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[80px] w-full rounded-lg" />
        ))}
      </div>
      {/* Tab bar */}
      <Skeleton className="h-10 w-[300px] rounded-md" />
      {/* Table */}
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}
