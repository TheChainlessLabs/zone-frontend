import Navbar from "@/components/Navbar";
import PairDetail from "@/components/PairDetail";

interface PairPageProps {
  params: Promise<{ pair: string }>;
}

export default async function PairPage({ params }: PairPageProps) {
  const { pair } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        <PairDetail pairSlug={pair} />
      </div>
    </div>
  );
}
