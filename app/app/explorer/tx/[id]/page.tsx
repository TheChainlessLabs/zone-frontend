import Navbar from "@/components/Navbar";
import TransactionDetail from "@/components/TransactionDetail";

interface TxPageProps {
  params: Promise<{ id: string }>;
}

export default async function TxPage({ params }: TxPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        <TransactionDetail txId={id} />
      </div>
    </div>
  );
}
