import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(req) {

  console.time("api:category-products:total");

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("category");

  console.log("category slug:", slug);

  console.time("auth:user");
  const user = await requireUser();
  console.timeEnd("auth:user");

  let customer;

  if (user) {
    console.time("db:customer_lookup");

    customer = await prisma.customer_list.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        customer_group_id: true,
        price_tier: true,
      },
    });

    console.timeEnd("db:customer_lookup");
  }

  console.time("db:category_lookup");

  const category = await prisma.product_category.findFirst({
    where: { slug },
  });

  console.timeEnd("db:category_lookup");

  if (!category) {
    console.timeEnd("api:category-products:total");
    return Response.json([]);
  }

console.time("db:products_query");

const products = await prisma.product_list.findMany({
  where: {
    category_id: category.id,
    is_deleted: false,
    is_active: true,
  },

  select: {
    id: true,
    name: true,
    slug: true,
    regular_price: true,
    sale_price: true,

    images: {
      select: {
        image_url: true,
      }
    },

    pricing: customer?.customer_group_id
      ? {
          where: {
            customer_group_id: customer.customer_group_id,
          },
          select: {
            price: true,
          },
          take: 1,
        }
      : false,
  },
});

console.timeEnd("db:products_query");

  console.log("products found:", products.length);

  console.timeEnd("api:category-products:total");

  return Response.json(products);
}