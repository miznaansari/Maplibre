"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =========================
   UPDATE QUANTITY
========================= */
export async function updateCartQty(_, formData) {
  const cartId = Number(formData.get("cartId"));
  const quantity = Number(formData.get("quantity"));

  if (!cartId || quantity < 1) return;

  await prisma.customer_cart.update({
    where: { id: cartId },
    data: { quantity },
  });

  revalidatePath("/cart");
}

/* =========================
   DELETE CART ITEM (SOFT)
========================= */
export async function deleteCartItem(_, formData) {
  const cartId = Number(formData.get("cartId"));

  if (!cartId) return;

  await prisma.customer_cart.update({
    where: { id: cartId },
    data: {
      is_deleted: true,
    },
  });

  revalidatePath("/cart");
}
