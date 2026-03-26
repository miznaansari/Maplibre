// app/my-account/orders/OrdersList.jsx
import { prisma } from "@/lib/prisma";
import OrderCard from "./OrderCard";
import OrderCardMobile from "./OrderCardMobile";

export default async function OrdersList({ customerId }) {

  const orders = await prisma.order_list.findMany({
    where: { customer_list_id: customerId },
    orderBy: { created_at: "desc" },
    include: {
      payments: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  if (!orders.length) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-600 text-sm">
        You have no orders yet.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="mx-auto max-w-6xl p-2 md:p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Order History
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View and track your recent purchases
          </p>
        </div>

        {/* ORDERS CARD */}
        <div className=" bg-white p-0 md:p-6">

          {/* DESKTOP GRID */}
          <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <OrderCardMobile key={order.id} order={order} />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}