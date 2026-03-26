import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ProductGrid from "./ProductGrid";

export default async function ProductCategory({ slugPath }) {

  /* =========================
     AUTH + CUSTOMER
  ========================= */
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  let isLoggedIn = false;
  let customerGroupId = null;
  let priceTier = null;
  let customerId = null;
  if (token) {
    const payload = verifyToken(token);
    customerId = payload?.id;

    if (payload?.id) {
      const customer = await prisma.customer_list.findUnique({
        where: { id: payload.id },
        select: {
          customer_group_id: true,
          price_tier: true,
        },
      });

      if (customer) {
        isLoggedIn = true;
        customerGroupId = customer.customer_group_id;
        priceTier = customer.price_tier;
      }
    }
  }

  /* =========================
     FETCH CATEGORY
  ========================= */
  const category = await prisma.product_category.findFirst({
    where: {
      path: slugPath,
      is_active: true,
      is_deleted: false,
    },
    include: {
      children: {
        where: { is_active: true, is_deleted: false },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) {
    return <div className="p-10">Category not found</div>;
  }

  /* =========================
     FETCH PRODUCTS (UNCHANGED)
  ========================= */
  const products = await prisma.product_list.findMany({
    where: {
      is_active: true,
      is_deleted: false,
      category: {
        path: { startsWith: category.path },
      },
    },
    include: {
      images: { orderBy: { is_primary: "desc" } },
      pricing: customerGroupId
        ? { where: { customer_group_id: customerGroupId }, take: 1 }
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
    orderBy: { name: "asc" },
  });

  /* =========================
     PREPARE PRODUCTS (KEY FIX)
  ========================= */
  const preparedProducts = products.map((product) => {
    const mainImage =
      product.images.find((i) => i.is_primary)?.image_url ||
      product.images[0]?.image_url ||
      "/images/not-found.png";

    let finalPrice =
      product.sale_price ?? product.regular_price;

    if (isLoggedIn) {
      if (product.pricing?.length) {
        finalPrice = product.pricing[0].price;
      } else if (product.tier_product_pricing?.length && priceTier) {
        const tier = product.tier_product_pricing[0];
        const tierMap = {
          TIER_1: tier.tier_1_price,
          TIER_2: tier.tier_2_price,
          TIER_3: tier.tier_3_price,
          TIER_4: tier.tier_4_price,
          TIER_5: tier.tier_5_price,
          TIER_6: tier.tier_6_price,
          TIER_7: tier.tier_7_price,
          TIER_8: tier.tier_8_price,
          TIER_9: tier.tier_9_price,
          TIER_10: tier.tier_10_price,
        };

        if (tierMap[priceTier] != null) {
          finalPrice = Number(tierMap[priceTier]);
        }
      }
    }

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: mainImage,
      price: finalPrice,
    };
  });

  /* =========================
     UI
  ========================= */
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-semibold">
        {category.name}
      </h1>
       {/* CHILD CATEGORIES */}
      {childrenWithCount.length > 0 && (
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {childrenWithCount.map((child) => (
            <Link
              key={child.id}
              href={`/product-category/${child.path}`}
              className="rounded-lg bg-sky-100 p-4 text-center hover:bg-sky-200 transition"
            >
              <p className="mt-2 text-sm font-medium">
                {child.name}
              </p>

              <p className="text-xs text-gray-500">
                {child.product_count} products
              </p>
            </Link>
          ))}
        </div>
      )}

      {preparedProducts.length > 0 ? (
        <ProductGrid products={preparedProducts} customerId={customerId}  />
      ) : (
        <p className="text-center text-gray-500">
          No products found in this category
        </p>
      )}
    </div>
  );
}
