// app/admin/(routing)/customer/page.jsx

import { prisma } from "@/lib/prisma";
import ViewCustomerGroups from "./ViewCustomerGroups";

export const metadata = {
  title: "Customer Groups | Admin",
};

/* =========================
   FETCH CUSTOMER GROUPS
========================= */
async function getCustomerGroups(searchParams) {
  const sp =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Number(sp.page) || 1;
  const limit = Number(sp.limit) || 10;
  const search = typeof sp.search === "string" ? sp.search : "";

  const skip = (page - 1) * limit;

  /* ---------- WHERE CONDITION ---------- */
  const where = {
    is_active: true,

    ...(search && {
      group_name: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  /* ---------- QUERIES ---------- */
  const [groups, total] = await Promise.all([
    prisma.customer_groups.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        group_name: "asc",
      },
      select: {
        id: true,
        group_name: true,
        is_active: true,
        created_at: true,
        _count: {
          select: {
            customers: true, // 🔥 number of customers in group
          },
        },
      },
    }),

    prisma.customer_groups.count({ where }),
  ]);

  return {
    data: groups,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/* =========================
   PAGE
========================= */
export default async function CustomersPage({ searchParams }) {
  const data = await getCustomerGroups(searchParams);
// console.log(object)
  return (
    <ViewCustomerGroups
      customerGroupsData={data.data}   // ✅ ONLY GROUPS DATA
      pagination={data.pagination}
      searchParams={
        searchParams instanceof Promise
          ? await searchParams
          : searchParams ?? {}
      }
    />
  );
}
