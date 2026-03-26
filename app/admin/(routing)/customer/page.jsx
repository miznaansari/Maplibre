import { prisma } from "@/lib/prisma";
import ViewCustomer from "./ViewCustomer";

export const metadata = {
  title: "Customers | Admin",
};

/* =========================
   SAFE PARSER
========================= */
function parseBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/* =========================
   FETCH CUSTOMERS
========================= */
async function getCustomers(searchParams) {
  try {
    const sp =
      searchParams instanceof Promise
        ? await searchParams
        : searchParams ?? {};

    /* ---------- PARAMS ---------- */
    const page = Math.max(Number(sp.page) || 1, 1);
    const limit = Math.min(Number(sp.limit) || 10, 100);
    const search = typeof sp.search === "string" ? sp.search.trim() : "";
    const status = typeof sp.status === "string" ? sp.status : "";
    const isBlocked = parseBoolean(sp.is_blocked);

    const skip = (page - 1) * limit;

    /* ---------- WHERE ---------- */
    const where = {
      is_deleted: false,
    };

    /* 🔍 Search */
    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
        { user_name: { contains: search } },
        { company_name: { contains: search } },
      ];
    }

    /* 📌 Status filter */
    if (status === "active") {
      where.is_active = true;
      where.is_blocked = false;
    } else if (status === "blocked") {
      where.is_blocked = true;
    } else if (status === "inactive") {
      where.is_active = false;
    }

    /* 🚫 Direct is_blocked override */
    if (typeof isBlocked === "boolean") {
      where.is_blocked = isBlocked;
    }

    /* ---------- QUERIES ---------- */
    const [customers, total] = await Promise.all([
      prisma.customer_list.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          user_name: true,
          price_tier: true,
          company_name: true,
          is_active: true,
          is_blocked: true,
          created_at: true,
          group: {
            select: {
              id: true,
              group_name: true,
            },
          },
        },
      }),

      prisma.customer_list.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      error: null,
    };
  } catch (error) {
    console.error("❌ getCustomers error:", error);

    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      error: "Failed to load customers. Please try again.",
    };
  }
}

/* =========================
   CUSTOMER GROUPS
========================= */
async function getCustomerGroups() {
  try {
    return await prisma.customer_groups.findMany({
      where: { is_active: true },
      select: {
        id: true,
        group_name: true,
      },
      orderBy: { group_name: "asc" },
    });
  } catch (error) {
    console.error("❌ getCustomerGroups error:", error);
    return [];
  }
}

/* =========================
   PAGE
========================= */
export default async function CustomersPage({ searchParams }) {
  const [customersData, customerGroupsData] = await Promise.all([
    getCustomers(searchParams),
    getCustomerGroups(),
  ]);

  return (
    <ViewCustomer
      customerGroupsData={customerGroupsData}
      customers={customersData.data}
      pagination={customersData.pagination}
      error={customersData.error}
      searchParams={
        searchParams instanceof Promise
          ? await searchParams
          : searchParams ?? {}
      }
    />
  );
}
