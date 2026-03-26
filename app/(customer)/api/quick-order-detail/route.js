// app/api/shop-detail/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  try {
    console.log("🚀 Quick Order API called");

    /* =========================
       1. AUTH + CUSTOMER
    ========================= */
    const c = await cookies();
    const token = c.get("authToken")?.value;

    let customerGroupId = null;
    let priceTier = null;
    let isLoggedIn = false;

    if (token) {
      const payload = await requireUser();

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

          console.log(
            `👤 Logged-in user | groupId=${customerGroupId} | tier=${priceTier ?? "NULL"}`
          );
        }
      }
    }

    if (!isLoggedIn) {
      console.log("👥 Guest user (default pricing)");
    }

    /* =========================
       2. FETCH PRODUCTS
    ========================= */
    console.log("📦 Fetching products...");

    const products = await prisma.product_list.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        // name: true,
        slug: true,
        sku: true,
        // description: true,
        regular_price: true,
        sale_price: true,

        category: {
          select: { id: true, name: true, slug: true, path: true },
        },

        // ✅ PRIMARY IMAGE FIX
        images: {
          select: {
            image_url: true,
            is_primary: true,
          },
          orderBy: {
            is_primary: "desc", // primary image first
          },
          take: 1,
        },

        pricing: customerGroupId
          ? {
            where: { customer_group_id: customerGroupId },
            select: { price: true },
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

    console.log(`📊 ${products.length} products fetched`);

    /* =========================
       3. TIER PRICE HELPER
    ========================= */
    const getTierPrice = (tierPricing, tier) => {
      if (!tierPricing) return null;
      if (!tier) return null; // 🔥 tier is NULL → skip tier pricing
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

      if (!tier) return null; // ⬅️ IMPORTANT
      return map[tier] ?? null;

    };

    /* =========================
       4. FORMAT RESPONSE
    ========================= */
    const formattedProducts = products.map((p) => {
      let finalPrice = p.sale_price ?? p.regular_price;
      let pricingSource = "DEFAULT_PRICE";

      if (isLoggedIn) {
        if (p.pricing?.length) {
          finalPrice = p.pricing[0].price;
          pricingSource = "GROUP_PRICE";
        } else if (p?.tier_product_pricing) {
          const tierPrice = getTierPrice(
            p.tier_product_pricing, // ✅ correct
            priceTier
          );

          if (tierPrice !== null) {
            finalPrice = Number(tierPrice);
            pricingSource = `TIER_PRICE (${priceTier})`;
          }
        }

      }

      // console.log(
      //   `💰 Product ${p.id} | ${p.name} → ${pricingSource} | Price = ${finalPrice}`
      // );

      return {
        id: p.id,
        // name: p.name,
        slug: p.slug,
        sku: p.sku,
        // description: p.description,
        price: finalPrice,
        regular_price: p.regular_price,
        mainImage: p.images?.[0]?.image_url ?? null,
        category: p.category,
      };
    });

    console.log("✅ Pricing resolution completed");

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("❌ Quick order API error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
