import OrderDetail from "@/components/OrderDetail";
import ProtectedPage from "@/components/ProtectedPage";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <ProtectedPage shellClassName="flex flex-1 flex-col">
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        <OrderDetail orderId={id} />
      </div>
    </ProtectedPage>
  );
}
