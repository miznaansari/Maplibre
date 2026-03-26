"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function addToCartDB({ productId, variantId, qty }) {
  const user = await requireUser();
  if (!user?.id) return { guest: true };

  // ❗ Variant is required if product has variants
  if (!variantId) {
    return { error: "Variant is required" };
  }

  /* =========================
     STOCK VALIDATION
  ========================= */
  const variant = await prisma.product_variant.findFirst({
    where: {
      id: variantId,
      product_list_id: productId,
      is_deleted: false,
    },
  });

  if (!variant) {
    return { error: "Invalid variant" };
  }

  if (variant.stock_qty < qty) {
    return { error: "Insufficient stock" };
  }

  /* =========================
     FIND EXISTING CART ITEM
  ========================= */
  const activeItem = await prisma.customer_cart.findFirst({
    where: {
      customer_list_id: user.id,
      product_list_id: productId,
      product_variant_id: variantId, // ✅ important
      is_deleted: false,
    },
  });

  if (activeItem) {
    // ✅ Update quantity (NOT increment)
    await prisma.customer_cart.update({
      where: { id: activeItem.id },
      data: {
        quantity: qty,
      },
    });
  } else {
    // ✅ Create new row
    await prisma.customer_cart.create({
      data: {
        customer_list_id: user.id,
        product_list_id: productId,
        product_variant_id: variantId, // ✅ store variant
        quantity: qty,
      },
    });
  }

  return { success: true };
}

export async function deleteCartItem({ cartItemId }) {
  const user = await requireUser();
  if (!user?.id) return { guest: true };

  if (!cartItemId) {
    throw new Error("Cart item id is required");
  }

  await prisma.customer_cart.update({
    where: {
      id: cartItemId,
      customer_list_id: user.id, // 🔐 extra safety
    },
    data: {
      is_deleted: true,
    },
  });

  return { deleted: true };
}