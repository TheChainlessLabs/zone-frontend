import { Skeleton } from "@/components/Skeleton";

export default function AccountLoading() {
  return (
    <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-[80px]" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}
