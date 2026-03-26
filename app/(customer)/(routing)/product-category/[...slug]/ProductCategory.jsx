import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/requireUser";
import ProductGrid from "./ProductGrid";
import { CubeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
    const payload = await requireUser();
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
  return (
    <div className="flex min-h-[300px] bg-[#1a1a1a] items-center justify-center">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a1a] px-8 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        
        <ExclamationTriangleIcon className="h-10 w-10 text-[#38bdf8]" />

        <h3 className="text-lg font-semibold text-white">
          Category not found
        </h3>

        <p className="max-w-sm text-sm text-gray-400">
          The category you are looking for may have been removed or does not exist.
        </p>
      </div>
    </div>
  );
}

  /* =========================
     FETCH PRODUCTS
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
      images: {
        orderBy: { is_primary: "desc" },
        where: { is_deleted: false },
      },
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
     PREPARE PRODUCTS
  ========================= */
  const preparedProducts = products.map((product) => {
    const mainImage =
      product.images.find((i) => i.is_primary)?.image_url ||
      product.images[0]?.image_url ||
      "/images/not-found.png";

    let finalPrice =
      product.sale_price ?? product.regular_price;

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

    if (isLoggedIn) {
      if (product?.pricing?.length) {
        finalPrice = product.pricing[0].price;
      } else if (product?.tier_product_pricing) {
        const tierPrice = getTierPrice(
          product.tier_product_pricing,
          priceTier
        );

        if (tierPrice !== null) {
          finalPrice = Number(tierPrice);
        }
      }
    }

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: mainImage,
      price: finalPrice,
      stepper_value: product.stepper_value,
    };
  });

  /* =========================
     CHILD COUNT
  ========================= */
  const childrenWithCount = await Promise.all(
    category.children.map(async (child) => {
      const product_count =
        await prisma.product_list.count({
          where: {
            is_active: true,
            is_deleted: false,
            category: {
              path: { startsWith: child.path },
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
     UI (DARK CONVERTED)
  ========================= */
  /* =========================
   UI (WHITE THEME)
========================= */
return (
  <div className="min-h-screen bg-white">

    <div className="mx-auto max-w-7xl px-4 py-10">

      {/* CATEGORY TITLE */}
      <h1 className="mb-10 text-center text-3xl font-semibold text-black">
        {category.name}
      </h1>

      {/* ================= CHILD CATEGORIES ================= */}
      {childrenWithCount.length > 0 && (
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">

          {childrenWithCount.map((child) => (
            <Link
              key={child.id}
              href={`/product-category/${child.path}`}
              className="
                group rounded-xl
                bg-white
                border border-gray-200
                p-5 text-center
                transition-all duration-300
                hover:border-[#347eb3]
                hover:shadow-md
              "
            >

              <p
                className="
                  text-sm font-semibold
                  text-black
                  group-hover:text-[#347eb3]
                  transition
                "
              >
                {child.name}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {child.product_count} products
              </p>

            </Link>
          ))}

        </div>
      )}

      {/* ================= PRODUCT GRID ================= */}
      {preparedProducts.length > 0 ? (
        <ProductGrid
          products={preparedProducts}
          customerId={customerId}
        />
      ) : (
        <div className="flex items-center justify-center py-16">

          <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">

            <CubeIcon className="h-10 w-10 text-[#347eb3]" />

            <h3 className="text-lg font-semibold text-black">
              No products found
            </h3>

            <p className="text-sm text-gray-500">
              There are currently no products available in this category.
            </p>

          </div>

        </div>
      )}

    </div>
  </div>
);
}
