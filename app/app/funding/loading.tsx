import { Skeleton } from "@/components/Skeleton";

export default function FundingLoading() {
  return (
    <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
      <Skeleton className="h-8 w-[100px]" />
      <div className="flex gap-6">
        <Skeleton className="h-[500px] flex-1 rounded-lg" />
        <Skeleton className="h-[500px] flex-1 rounded-lg" />
      </div>
    </div>
  );
}
