import Home from "./customer/components/home/home";
import AnnouncementBar from "./customer/components/home/AnnouncementBar";
import ServiceHighlights from "./customer/components/home/ServiceHighlights";
import CategoryShowProduct from "./customer/components/home/CategoryShowProduct";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export default async function Page({ searchParams }) {

  const params = await searchParams;
  const selectedCategory = params?.category || null;

  const user = await requireUser();
  const isLoggedIn = !!user;

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

  const categories = await prisma.product_category.findMany({
    where: {
      is_active: true,
      is_deleted: false,
      parent_id: null,
    },
    orderBy: {
      name: "asc",
    },
  });

  let products = [];

  if (selectedCategory) {

    const category = await prisma.product_category.findFirst({
      where: {
        slug: selectedCategory,
      },
    });

    if (category) {
      products = await prisma.product_list.findMany({
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

          tier_product_pricing: isLoggedIn
            ? {
                select: {
                  tier_1_price: true,
                  tier_2_price: true,
                  tier_3_price: true,
                  tier_4_price: true,
                  tier_5_price: true,
                  tier_6_price: true,
                  tier_7_price: true,
                  tier_8_price: true,
                  tier_9_price: true,
                  tier_10_price: true,
                },
              }
            : false,
        },
      });
    }
  }

  return (
    <>
      <Home />
      <AnnouncementBar />

      <CategoryShowProduct
        categories={categories}
        products={products}
        selectedCategory={selectedCategory}
        customer={customer}
      />

      <ServiceHighlights />
    </>
  );
}