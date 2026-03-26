
export default function OrderCard({ order }) {
//   const router = useRouter();
  const items = order.items || [];
  const visibleItems = items.slice(0, 3);
  const paypalOrderId = order.payments?.[0]?.provider_order_id;

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white">
      
      {/* 🔹 TOP INFO BAR */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 bg-[#F3F8FB] px-4 py-3 text-sm md:grid-cols-4">
        <div>
          <div className="text-gray-500">Order ID:</div>
          <div className="font-medium">
            #{order.order_number}
          </div>
        </div>

        <div>
          <div className="text-gray-500">Order Placed:</div>
          <div className="font-medium">
            {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>

        <div>
          <div className="text-gray-500">Ship to:</div>
          <div className="font-medium">CITA</div>
        </div>

        <div className="text-right">
          <div className="text-gray-500">Order Status:</div>
          <span className="inline-block rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium">
            {order.status}
          </span>
        </div>
      </div>

      {/* 🔹 ITEMS SECTION */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div
          className={`space-y-3 ${
            items.length > 3 ? "max-h-36 overflow-y-auto pr-2" : ""
          }`}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between text-sm ${
                index !== visibleItems.length - 1
                  ? "border-b border-dashed border-gray-200 pb-3"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Image placeholder */}
                <div className="h-10 w-10 rounded border border-gray-200 bg-gray-50" />

                <div className="max-w-md">
                  <div className="font-medium text-gray-800">
                    {item.product_title}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({item.sku})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-600">
                  QTY: {item.quantity}
                </span>
                <span className="font-medium text-[#3170B7]">
                  ${item.line_total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {items.length > 3 && (
            <div className="text-xs text-gray-500">
              + {items.length - 3} more items
            </div>
          )}
        </div>
      </div>

      {/* 🔹 BOTTOM BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3F8FB] px-4 py-3 text-sm font-semibold text-[#3170B7]">
        <div>
          Total: ${order.total.toFixed(2)}
        </div>

        <div className="flex items-center gap-4">
          <button className="hover:underline">
            Download Invoice
          </button>

          {/* <button
            onClick={() =>
              router.push(
                `/order/${order.id}?paypalOrderId=${paypalOrderId}`
              )
            }
            className="hover:underline"
          >
            View order details →
          </button> */}
        </div>
      </div>
    </div>
  );
}
