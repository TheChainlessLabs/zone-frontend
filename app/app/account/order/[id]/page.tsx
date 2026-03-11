import Navbar from "@/components/Navbar";
import OrderDetail from "@/components/OrderDetail";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full">
        <OrderDetail orderId={id} />
      </div>
    </div>
  );
}
