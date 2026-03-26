import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    /* =========================
       AUTH
    ========================= */
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json([], { status: 200 });
    }

    const user = verifyToken(token);
    if (!user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    /* =========================
       CUSTOMER
    ========================= */
    const customer = await prisma.customer_list.findUnique({
      where: { id: user.id },
      select: {
        customer_group_id: true,
        price_tier: true,
      },
    });

    if (!customer) {
      return NextResponse.json([], { status: 200 });
    }

    const { customer_group_id, price_tier } = customer;

    /* =========================
       FETCH CART
    ========================= */
    const cartData = await prisma.customer_cart.findMany({
      where: {
        customer_list_id: user.id,
        is_deleted: false,
      },
      include: {
            variant : {
              select: {
                size: true,
            },},
        
        product: {
          include: {
            images: {
              select: {
                image_url: true,
              },
              where: { is_primary: true },
              take: 1,
            },

            pricing: customer_group_id
              ? {
                where: { customer_group_id },
                take: 1,
              }
              : false,

            tier_product_pricing: {
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
            },
          },
        },
      },
    });

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
       APPLY PRICING
    ========================= */
    const pricedCartData = cartData.map((item) => {
      const product = item.product;

      let finalPrice =
        product.sale_price ?? product.regular_price;

      // 1️⃣ group pricing
      if (product.pricing?.length) {
        finalPrice = product.pricing[0].price;
      }
      // 2️⃣ tier pricing
      else if (product.tier_product_pricing && price_tier) {
        const tierPrice = getTierPrice(
          product.tier_product_pricing,
          price_tier
        );

        if (tierPrice !== null) {
          finalPrice = Number(tierPrice);
        }
      }

      return {
        ...item,
        price: finalPrice, // 🔑 flatten price for client
      };
    });

    return NextResponse.json(pricedCartData);
  } catch (err) {
    console.error("Cart API error:", err);
    return NextResponse.json(
      { error: "Failed to load cart" },
      { status: 500 }
    );
  }
}
