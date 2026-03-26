"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

/* ---------------- DATE HELPERS ---------------- */

function getDateRange(type) {
  const now = new Date();
  const start = new Date();

  if (type === "week") start.setDate(now.getDate() - 6);
  if (type === "month") start.setDate(now.getDate() - 29);
  if (type === "year") start.setFullYear(now.getFullYear() - 1);

  return { start, end: now };
}

function percentChange(current, previous) {
  if (previous === 0) return 100;
  return Number(((current - previous) / previous) * 100).toFixed(2);
}

function buildBuckets(range) {
  const now = new Date();
  const buckets = [];

  if (range === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets.push({ key: d.toISOString().slice(0, 10), value: 0 });
    }
  }

  if (range === "month") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets.push({ key: d.toISOString().slice(0, 10), value: 0 });
    }
  }

  if (range === "year") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
        value: 0,
      });
    }
  }

  return buckets;
}

/* ---------------- MAIN ACTION ---------------- */

export async function getDashboardStats(range = "week") {
    const admin = await requireAdmin();
    if(!admin){
        return{
            message: "Unauthorized",
            status: 401,
            success: false,
        }
    }
  const current = getDateRange(range);
  const previous = getDateRange(range === "week" ? "month" : "year");

  /* -------- CUSTOMERS -------- */
  const customersNow = await prisma.customer_list.count({
    where: { created_at: { gte: current.start, lte: current.end }, is_deleted: false },
  });

  const customersPrev = await prisma.customer_list.count({
    where: { created_at: { gte: previous.start, lte: previous.end }, is_deleted: false },
  });

  const customerRows = await prisma.customer_list.findMany({
    where: { created_at: { gte: current.start, lte: current.end }, is_deleted: false },
    select: { created_at: true },
  });

  const customerBuckets = buildBuckets(range);

  customerRows.forEach((r) => {
    const key =
      range === "year"
        ? `${r.created_at.getFullYear()}-${r.created_at.getMonth() + 1}`
        : r.created_at.toISOString().slice(0, 10);

    const bucket = customerBuckets.find((b) => b.key === key);
    if (bucket) bucket.value++;
  });

  /* -------- ORDERS -------- */
  const ordersNow = await prisma.order_list.count({
    where: { created_at: { gte: current.start, lte: current.end } },
  });

  const ordersPrev = await prisma.order_list.count({
    where: { created_at: { gte: previous.start, lte: previous.end } },
  });

  const orderRows = await prisma.order_list.findMany({
    where: { created_at: { gte: current.start, lte: current.end } },
    select: { created_at: true },
  });

  const orderBuckets = buildBuckets(range);

  orderRows.forEach((r) => {
    const key =
      range === "year"
        ? `${r.created_at.getFullYear()}-${r.created_at.getMonth() + 1}`
        : r.created_at.toISOString().slice(0, 10);

    const bucket = orderBuckets.find((b) => b.key === key);
    if (bucket) bucket.value++;
  });

  /* -------- REVENUE -------- */
  const revenueNowAgg = await prisma.order_list.aggregate({
    _sum: { total: true },
    where: {
      created_at: { gte: current.start, lte: current.end },
      status: { in: ["PAID", "DELIVERED"] },
    },
  });

  const revenuePrevAgg = await prisma.order_list.aggregate({
    _sum: { total: true },
    where: {
      created_at: { gte: previous.start, lte: previous.end },
      status: { in: ["PAID", "DELIVERED"] },
    },
  });

  const revenueRows = await prisma.order_list.findMany({
    where: {
      created_at: { gte: current.start, lte: current.end },
      status: { in: ["PAID", "DELIVERED"] },
    },
    select: { created_at: true, total: true },
  });

  const revenueBuckets = buildBuckets(range);

  revenueRows.forEach((r) => {
    const key =
      range === "year"
        ? `${r.created_at.getFullYear()}-${r.created_at.getMonth() + 1}`
        : r.created_at.toISOString().slice(0, 10);

    const bucket = revenueBuckets.find((b) => b.key === key);
    if (bucket) bucket.value += Number(r.total);
  });

  return {
    customers: {
      value: customersNow,
      change: percentChange(customersNow, customersPrev),
      chart: customerBuckets.map((b) => b.value),
    },
    orders: {
      value: ordersNow,
      change: percentChange(ordersNow, ordersPrev),
      chart: orderBuckets.map((b) => b.value),
    },
    revenue: {
      value: Number(revenueNowAgg._sum.total || 0),
      change: percentChange(
        Number(revenueNowAgg._sum.total || 0),
        Number(revenuePrevAgg._sum.total || 0)
      ),
      chart: revenueBuckets.map((b) => b.value),
    },
  };
}
