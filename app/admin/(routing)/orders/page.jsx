import { prisma } from "@/lib/prisma";
import ViewOrder from "./ViewOrder";

/* ----------------------------------
   ENUM WHITELISTS
---------------------------------- */
const ORDER_STATUSES = [
  "CREATED",
  "PENDING",
  "PAYMENT_FAILED",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];


const DELIVERY_METHODS = ["PICKUP", "DELIVERY"];

export default async function OrdersPage({ searchParams }) {
  /* ----------------------------------
     REQUIRED (DO NOT CHANGE)
  ---------------------------------- */
  const s = await searchParams;

  console.log("🟢 RAW searchParams:", s);

  /* ----------------------------------
     PAGINATION
  ---------------------------------- */
  const page = Number(s.page) > 0 ? Number(s.page) : 1;
  const limit = Number(s.limit) > 0 ? Number(s.limit) : 10;
  const skip = (page - 1) * limit;
  const purchaseOrder =
  s.purchase_order === "true"
    ? true
    : s.purchase_order === "false"
    ? false
    : undefined;
    console.log('purchaseOrderpurchaseOrder',purchaseOrder)


  console.log("📄 Pagination:", { page, limit, skip });

  /* ----------------------------------
     SEARCH & FILTER VALUES
  ---------------------------------- */
  const search =
    typeof s.search === "string" ? s.search.trim() : "";

  const status = ORDER_STATUSES.includes(s.status)
    ? s.status
    : undefined;

  const delivery = DELIVERY_METHODS.includes(s.delivery)
    ? s.delivery
    : undefined;

  console.log("🔍 Filters:", {
    search,
    status,
    delivery,
  });

  /* ----------------------------------
     WHERE CONDITION (ROBUST)
  ---------------------------------- */
  const where = {};

  if (search) {
    where.OR = [
      {
        order_number: {
          contains: search,
        },
      },
      {
        customer: {
          email: {
            contains: search,
          },
        },
      },
    ];
  }
  if (purchaseOrder !== undefined) {
  where.is_purchase_order = purchaseOrder;
}

  if (status) {
    where.status = status;
  }

  if (delivery) {
    where.delivery_method = delivery;
  }

  console.log(
    "🧠 Prisma WHERE:",
    JSON.stringify(where, null, 2)
  );

  /* ----------------------------------
     FETCH DATA
  ---------------------------------- */
const [orders, total] = await Promise.all([
  prisma.order_list.findMany({
    where,
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          first_name: true,
          email: true,
        },
      },
      _count: {
        select: {
          items: true, // ✅ CORRECT relation name
        },
      },
    },
  }),
  prisma.order_list.count({ where }),
]);

  console.log("📦 Orders fetched:", orders.length);
  console.log("📊 Total matching orders:", total);

  /* ----------------------------------
     SERIALIZE DECIMALS (RSC SAFE)
  ---------------------------------- */
const serializedOrders = orders.map((o) => ({
  ...o,
  order_items_count: o._count?.items || 0, // ✅ FIXED
  sub_total: Number(o.sub_total),
  shipping_amount: Number(o.shipping_amount),
  tax_amount: Number(o.tax_amount),
  total: Number(o.total),
}));


  console.log(
    "✅ Serialized Orders (sample):",
    serializedOrders[0] || "No data"
  );

  /* ----------------------------------
     RENDER
  ---------------------------------- */
  return (
    <ViewOrder
      orders={serializedOrders}
      page={page}
      totalPages={Math.ceil(total / limit)}
      searchParams={searchParams}
    />
  );
}
