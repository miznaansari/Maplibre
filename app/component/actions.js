"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/* =========================
   UPDATE QUANTITY
========================= */
export async function updateCartQty(_, formData) {
  try {
    const user = await requireUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const customerId = user.id;
    const cartId = Number(formData.get("cartId"));
    const quantity = Number(formData.get("quantity"));

    if (!cartId || quantity < 1) {
      return { error: "Invalid cart or quantity" };
    }

    /* --------------------------------
       1️⃣ Fetch cart with ownership
    -------------------------------- */
    const cartItem = await prisma.customer_cart.findFirst({
      where: {
        id: cartId,
        customer_list_id: customerId,
        is_deleted: false,
      },
      include: {
        product: {
          select: {
            stepper_value: true,
            is_active: true,
            is_deleted: true,
          },
        },
      },
    });

    if (!cartItem) {
      return { error: "Cart item not found or access denied" };
    }

    if (
      !cartItem.product ||
      cartItem.product.is_deleted ||
      !cartItem.product.is_active
    ) {
      return { error: "Product is no longer available" };
    }

    /* --------------------------------
       2️⃣ Stepper validation
    -------------------------------- */
    const stepper = cartItem.product.stepper_value;

    if (stepper && quantity % stepper !== 0) {
      return {
        error: `Quantity must be a multiple of ${stepper}`,
      };
    }

    /* --------------------------------
       3️⃣ Update quantity
    -------------------------------- */
    await prisma.customer_cart.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    revalidatePath("/cart");

    return { success: true };
  } catch (err) {
    console.error("updateCartQty error:", err);
    return { error: "Something went wrong. Please try again." };
  }
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

export async function clearCart() {
  const user = await requireUser();

  if (!user) return;
  const customerId = user.id;  

  if (!customerId) return;

  await prisma.customer_cart.updateMany({
    where: {
      customer_list_id: customerId,
      is_deleted: false,
    },
    data: {
      is_deleted: true,
    },
  });

  revalidatePath("/cart");
}