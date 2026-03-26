import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function ProductCategory({ slugPath }) {
  /* =========================
     AUTH + CUSTOMER
  ========================= */
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  let isLoggedIn = false;
  let customerGroupId = null;
  let priceTier = null;

  if (token) {
    const payload = verifyToken(token);

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
     FETCH PRODUCTS (TREE)
  ========================= */
  const products = await prisma.product_list.findMany({
    where: {
      is_active: true,
      is_deleted: false,
      category: {
        path: {
          startsWith: category.path, // parent + child + grandchild
        },
      },
    },
    include: {
      images: {
        orderBy: { is_primary: "desc" },
      },
      pricing: customerGroupId
        ? {
            where: { customer_group_id: customerGroupId },
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
    orderBy: { name: "asc" },
  });

  /* =========================
     CHILD CATEGORY PRODUCT COUNTS
  ========================= */
  const childrenWithCount = await Promise.all(
    category.children.map(async (child) => {
      const product_count = await prisma.product_list.count({
        where: {
          is_active: true,
          is_deleted: false,
          category: {
            path: {
              startsWith: child.path,
            },
          },
        },
      });

      return {
        ...child,
        product_count,
      };
    })
  );

  /* =========================
     TIER PRICE HELPER
  ========================= */
  const getTierPrice = (tierPricing, tier) => {
    if (!tierPricing || !tier) return null;

    const map = {
      TIER_1: tierPricing.tier_1_price,
      TIER_2: tierPricing.tier_2_price,
      TIER_3: tierPricing.tier_3_price,
      TIER_4: tierPricing.tier_4_price,
      TIER_5: tierPricing.tier_5_price,
      TIER_6: tierPricing.tier_6_price,
      TIER_7: tierPricing.tier_7_price,
      TIER_8: tierPricing.tier_8_price,
      TIER_9: tierPricing.tier_9_price,
      TIER_10: tierPricing.tier_10_price,
    };

    return map[tier] ?? null;
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* TITLE */}
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
              className="rounded bg-sky-100 p-4 text-center hover:bg-sky-200 transition"
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

      {/* PRODUCTS */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => {
            /* IMAGE */
            const mainImage =
              product.images.find((i) => i.is_primary)?.image_url ||
              product.images[0]?.image_url ||
              "/images/no-image.png";

            /* PRICE */
            let finalPrice =
              product.sale_price ?? product.regular_price;

            if (isLoggedIn) {
              if (product.pricing?.length) {
                finalPrice = product.pricing[0].price;
              } else if (product.tier_product_pricing?.length) {
                const tierPrice = getTierPrice(
                  product.tier_product_pricing[0],
                  priceTier
                );
                if (tierPrice !== null) {
                  finalPrice = Number(tierPrice);
                }
              }
            }

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="rounded border border-gray-300 bg-white p-4 hover:shadow transition"
              >
                <Image
                  src={mainImage || "/images/not-found.png"}
                  alt={product.name}
                  width={220}
                  height={160}
                  className="mx-auto object-contain"
                />

                <p className="mt-3 text-sm font-medium">
                  {product.name}
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-600">
                  ${finalPrice}
                  <span className="ml-1 text-xs text-gray-400">
                    ex. GST
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No products found in this category
        </p>
      )}
    </div>
  );
}
