import Navbar from "@/components/Navbar";
import WithdrawalDetail from "@/components/WithdrawalDetail";

interface WithdrawalPageProps {
  params: Promise<{ id: string }>;
}

export default async function WithdrawalPage({ params }: WithdrawalPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        <WithdrawalDetail withdrawalId={id} />
      </div>
    </div>
  );
}
