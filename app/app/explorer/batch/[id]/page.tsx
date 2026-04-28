import Navbar from "@/components/Navbar";
import BatchDetail from "@/components/BatchDetail";

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function BatchPage({ params }: BatchPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        <BatchDetail batchId={id} />
      </div>
    </div>
  );
}
