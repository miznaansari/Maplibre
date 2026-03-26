import EditCategory from "./EditCategory";
import { prisma } from "@/lib/prisma";

export default async function Page({ params }) {
    const p = await params;
  const id = Number(p.id);

  // 🔹 Fetch category detail
  const category = await prisma.product_category.findUnique({
    where: { id },
    include: {
      seo: true,
    },
  });

  if (!category) {
    return <div className="p-6">Category not found</div>;
  }

  // 🔹 Fetch all categories for parent select
  const categories = await prisma.product_category.findMany({
    where: {
      is_deleted: false,
    },
    orderBy: {
      path: "asc",
    },
  });

  return (
    <EditCategory
      category={category}
      categories={categories}
    />
  );
}
