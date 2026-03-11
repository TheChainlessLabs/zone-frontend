import Navbar from "@/components/Navbar";
import TransactionDetail from "@/components/TransactionDetail";

interface TxPageProps {
  params: Promise<{ id: string }>;
}

export default async function TxPage({ params }: TxPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full">
        <TransactionDetail txId={id} />
      </div>
    </div>
  );
}
