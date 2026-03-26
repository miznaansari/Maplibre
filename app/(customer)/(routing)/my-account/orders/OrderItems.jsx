// app/my-account/orders/OrderItems.jsx
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function OrderItems({ orderId }) {
  const items = await prisma.order_items.findMany({
    where: { order_list_id: orderId },
    orderBy: { id: "asc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            where: { is_primary: true, is_deleted: false },
            take: 1,
            select: {
              image_url: true,
            },
          },
        },
      },
    },
  });

  const hasMore = items.length > 3;
  const visibleItems = items.slice(0, 3);

  return (
    <div className="space-y-2 bg-white px-4 py-3 border border-gray-200 rounded-xl">

      {visibleItems.map((item, index) => (
        <div
          key={item.id}
          className={`flex flex-col md:flex-row justify-between text-sm ${
            index !== visibleItems.length - 1
              ? "border-b border-gray-200 pb-3"
              : ""
          }`}
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100">
              <Image
                src={
                  item.product?.images?.[0]?.image_url ||
                  "/images/not-found.png"
                }
                alt={item.product_title}
                width={40}
                height={40}
                className="!h-10 !w-10 object-cover"
              />
            </div>

            <div className="max-w-md">
              <div className="font-medium text-gray-900">
                {item.product_title}
              </div>

              <div className="text-xs text-gray-500">
                ({item.sku})
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex w-full justify-end gap-6 md:w-auto">

            <span className="text-gray-500">
              QTY: {item.quantity}
            </span>

            {/* <span className="font-medium text-[#347eb3]">
              ${item.line_total.toFixed(2)}
            </span> */}

          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-xs text-gray-500">
          + {items.length - 3} more items
        </div>
      )}

    </div>
  );
}