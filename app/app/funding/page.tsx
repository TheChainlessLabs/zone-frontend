import Navbar from "@/components/Navbar";
import FundingForm from "@/components/FundingForm";
import TransactionHistory from "@/components/TransactionHistory";

export default function FundingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-4 md:gap-6">
        <h1 className="text-h2 font-semibold">Funding</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <FundingForm />
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
