import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(req) {

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("category");

  const user = await requireUser();

  let customer;

  if (user) {
    customer = await prisma.customer_list.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        customer_group_id: true,
        price_tier: true,
      },
    });
  }

const category = await prisma.product_category.findFirst({
  where: { slug },
});

  if (!category) {
    return Response.json([]);
  }

  const products = await prisma.product_list.findMany({
    where: {
      category_id: category.id,
      is_deleted: false,
      is_active: true,
    },

    include: {
      variants: true,

      images: {
        where: { is_primary: true },
      },

      category: true,

      pricing: customer?.customer_group_id
        ? {
            where: {
              customer_group_id: customer.customer_group_id,
            },
            take: 1,
          }
        : false,
    },
  });

  return Response.json(products);
}