"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

/* ----------------------------------------
   Fetch DB cart
---------------------------------------- */
export async function getDbCart() {
  const user = await requireUser();

  return prisma.customer_cart.findMany({
    where: {
      customer_list_id: user.id,
      is_deleted: false,
    },
    include: {
      product: {
        select: { id: true, name: true },
      },
    },
  });
}

/* ----------------------------------------
   Apply guest cart (NO UPSERT)
---------------------------------------- */
export async function applyGuestCart(guestItems) {
  const user = await requireUser();

  for (const item of guestItems) {
    // 1️⃣ Check existing ACTIVE cart row
    const existing = await prisma.customer_cart.findFirst({
      where: {
        customer_list_id: user.id,
        product_list_id: item.product_id,
        is_deleted: false,
      },
    });

    if (existing) {
      // 2️⃣ Update quantity if active row exists
      await prisma.customer_cart.update({
        where: { id: existing.id },
        data: {
          quantity: item.quantity,
        },
      });
    } else {
      // 3️⃣ Insert NEW row (even if old deleted row exists)
      await prisma.customer_cart.create({
        data: {
          customer_list_id: user.id,
          product_list_id: item.product_id,
          quantity: item.quantity,
          is_deleted: false,
        },
      });
    }
  }
}
/* ----------------------------------------
   Resolve cart conflicts
---------------------------------------- */
export async function resolveCart(action, guestItems) {
  const user = await requireUser();

  if (action === "db") {
    // keep DB cart
    return;
  }

  if (action === "guest") {
    // mark db cart as deleted (recommended over deleteMany)
    await prisma.customer_cart.updateMany({
      where: { customer_list_id: user.id },
      data: { is_deleted: true },
    });

    await applyGuestCart(guestItems);
    return;
  }

  if (action === "merge") {
    await applyGuestCart(guestItems);
  }
}
