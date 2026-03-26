"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { unstable_noStore } from "next/cache";
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

    const admin = await requireAdmin();

   if (!admin) {
  return {
    success: false,
    status: 401,
    message: "Unauthorized",
  };
}


  const [customers, products, orders, revenue] = await Promise.all([
    prisma.customer_list.count({ where: { is_deleted: false } }),
    prisma.product_list.count({ where: { is_deleted: false,is_active: true } }),
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
  const admin = await requireAdmin();
  if (!admin) return [];

  const now = new Date();
  const startDate = new Date(now);

  switch (range) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "1m":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      startDate.setMonth(now.getMonth() - 6);
      break;
  }

  const orders = await prisma.order_list.findMany({
    where: { created_at: { gte: startDate } },
    select: { created_at: true, status: true },
  });

  const map = {};
  const statusKeys = OrderStatus; // enum or array

  /* ------------------ AGGREGATE ------------------ */

  for (const o of orders) {
    let key;

    // ✅ MONTHLY for 3m / 6m
    if (range === "3m" || range === "6m") {
      key = `${o.created_at.getFullYear()}-${String(
        o.created_at.getMonth() + 1
      ).padStart(2, "0")}`;
    }
    // ✅ DAILY for week / 1m
    else {
      key = `${o.created_at.getFullYear()}-${String(
        o.created_at.getMonth() + 1
      ).padStart(2, "0")}-${String(o.created_at.getDate()).padStart(2, "0")}`;
    }

    if (!map[key]) {
      map[key] = { date: key };
      for (const s of statusKeys) map[key][s] = 0;
    }

    map[key][o.status]++;
  }

  /* ------------------ MONTH VIEW (FILL ZERO) ------------------ */

  if (range === "3m" || range === "6m") {
    const count = range === "3m" ? 3 : 6;
    const result = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      const row =
        map[key] ||
        Object.assign(
          { date: d.toLocaleString("en-US", { month: "short" }) },
          Object.fromEntries(statusKeys.map((s) => [s, 0]))
        );

      // Convert YYYY-MM → Jan, Feb
      if (row.date.includes("-")) {
        row.date = d.toLocaleString("en-US", { month: "short" });
      }

      result.push(row);
    }

    return result;
  }

  /* ------------------ DAILY VIEW ------------------ */

  return Object.values(map).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}



/* ==============================
   REVENUE BAR CHART (PAID ONLY)
================================ */
/* ---------------- Server Action ---------------- */
function getRevenueStartDate(range) {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "1m":
      start.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      start.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(now.getMonth() - 6);
      break;
  }

  start.setHours(0, 0, 0, 0);
  return start;
}
function getMonthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}


export async function getRevenueChart(range) {
  const admin = await requireAdmin();
  if (!admin) return [];

  const startDate = getRevenueStartDate(range);
  const now = new Date();

  const rows = await prisma.order_list.findMany({
    where: {
      status: OrderStatus.PAID,
      created_at: { gte: startDate },
    },
    select: {
      created_at: true,
      total: true,
    },
  });

  const revenueMap = {};

  // -------------------------------
  // STEP 1: Aggregate DB data
  // -------------------------------
  for (const row of rows) {
    let key;

    if (range === "3m" || range === "6m") {
      key = getMonthKey(row.created_at); // format: YYYY-MM
    } else {
      key = row.created_at.toISOString().split("T")[0]; // format: YYYY-MM-DD
    }

    revenueMap[key] = (revenueMap[key] || 0) + Number(row.total || 0);
  }

  // -------------------------------
  // STEP 2: MONTHLY (3m / 6m)
  // -------------------------------
  if (range === "3m" || range === "6m") {
    const monthsCount = range === "3m" ? 3 : 6;
    const result = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d); // YYYY-MM

      result.push({
        date: d.toLocaleString("en-US", { month: "long" }),
        revenue: Number((revenueMap[key] || 0).toFixed(2)), // zero if missing
      });
    }

    return result;
  }

  // -------------------------------
  // STEP 3: DAILY (week / 1m) ✅ ZERO-FILL FIX
  // -------------------------------
// -------------------------------
// STEP 3: DAILY (week / 1m) ✅ FIXED RANGE LOGIC
// -------------------------------
const result = [];

let start;

// 🔥 FIX: week = last 7 days only
if (range === "week") {
  start = new Date(now);
  start.setDate(now.getDate() - 6); // today + last 6 days = 7 days
} else {
  start = new Date(startDate); // 1m uses real startDate
}

start.setHours(0, 0, 0, 0);

const end = new Date(now);
end.setHours(0, 0, 0, 0);

let current = new Date(start);

while (current <= end) {
  const key = current.toISOString().split("T")[0];

  result.push({
    date: key,
    revenue: Number((revenueMap[key] || 0).toFixed(2)),
  });

  current.setDate(current.getDate() + 1);
}

return result;

}
