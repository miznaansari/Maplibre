import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ViewCategory from "../../UI/categories/ViewCategory";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Add Category | Admin",
};

async function getCategories({ search = "", page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  console.log("SERVER QUERY →", { search, page, limit, skip });

  const whereCondition = {
    is_active: true,
    is_deleted: false,
    ...(search && {
      path: {
        contains: search,
        // mode: "insensitive",
      },
    }),
  };

  const total = await prisma.product_category.count({
    where: whereCondition,
  });

  const categories = await prisma.product_category.findMany({
    where: whereCondition,
    orderBy: { path: "asc" },
    skip,
    take: limit,
    include: {
      _count: {
        select: {
          products: {
            where: {
              is_active: true,
              is_deleted: false,
            },
          },
        },
      },
    },
  });

  console.log("RESULT COUNT →", categories.length);

  return {
    data: categories.map((cat) => ({
      ...cat,
      product_count: cat._count.products,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken")?.value;

  if (!adminToken) {
    redirect("/admin/login");
  }

  console.log("RAW PARAMS →", searchParams);
const s = await searchParams;
  const search = s?.search || "";
  const page = Number(s?.page) || 1;
  const limit = Number(s?.limit) || 10;

  console.log("PARSED PARAMS →", { search, page, limit });

  const categories = await getCategories({ search, page, limit });

  return (
    <ViewCategory
      categories={categories.data}
      pagination={categories.pagination}
      searchParams={{ search, page, limit }}
    />
  );
}
