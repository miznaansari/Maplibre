"use server";

import { prisma } from "@/lib/prisma";
const OrderStatus = [
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
function getStartDate(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/* ==============================
   DASHBOARD STATS (TOP CARDS)
================================ */
export async function getDashboardStats() {
  const [customers, products, orders, revenue] = await Promise.all([
    prisma.customer_list.count({ where: { is_deleted: false } }),
    prisma.product_list.count({ where: { is_deleted: false } }),
    prisma.order_list.count(),
    prisma.order_list.aggregate({
      _sum: { total: true },
      where: { status: OrderStatus.PAID },
    }),
  ]);

  return {
    customers,
    products,
    orders,
    revenue: revenue._sum.total ?? 0,
  };
}

/* ==============================
   ORDERS BAR CHART
================================ */
export async function getOrdersChart(range = "3m") {
  const startDate = new Date();

  switch (range) {
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6m":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 3);
  }

  const orders = await prisma.order_list.findMany({
    where: {
      created_at: { gte: startDate },
    },
    select: {
      created_at: true,
    },
  });

  // Group by DATE
  const map = {};

  for (const o of orders) {
    const date = o.created_at.toISOString().slice(0, 10);
    map[date] = (map[date] || 0) + 1;
  }

  return Object.entries(map)
    .map(([date, orders]) => ({ date, orders }))
    .sort((a, b) => a.date.localeCompare(b.date));
}


/* ==============================
   REVENUE BAR CHART (PAID ONLY)
================================ */
export async function getRevenueChart(months = 3) {
  const startDate = getStartDate(months);

  const data = await prisma.order_list.groupBy({
    by: ["created_at"],
    where: {
      status: OrderStatus.PAID,
      created_at: { gte: startDate },
    },
    _sum: { total: true },
    orderBy: { created_at: "asc" },
  });

  return data.map(item => ({
    date: item.created_at.toISOString().slice(0, 10),
    revenue: Number(item._sum.total ?? 0),
  }));
}
