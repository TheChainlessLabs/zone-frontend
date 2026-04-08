import { Skeleton } from "@/components/Skeleton";

export default function PortfolioLoading() {
  return (
    <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[120px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}
