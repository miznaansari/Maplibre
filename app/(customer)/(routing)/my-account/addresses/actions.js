"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { revalidatePath } from "next/cache";

/* ----------------------------------------
   🗑 REMOVE ADDRESS (SOFT DELETE)
----------------------------------------- */
export async function removeAddress(addressId) {
  const user = await requireUser();

  // check ownership
  const address = await prisma.customer_address.findFirst({
    where: {
      id: Number(addressId),
      customer_list_id: user.id,
      is_deleted: false,
    },
  });

  if (!address) return;

  await prisma.customer_address.update({
    where: { id: address.id },
    data: {
      is_deleted: true,
      is_default: false,
    },
  });

  revalidatePath("/my-account/addresses");
}

/* ----------------------------------------
   ⭐ SET AS DEFAULT ADDRESS
----------------------------------------- */
export async function setAsPrimary(addressId) {
  const user = await requireUser();

  // check ownership
  const address = await prisma.customer_address.findFirst({
    where: {
      id: Number(addressId),
      customer_list_id: user.id,
      is_deleted: false,
    },
  });

  if (!address) return;

  await prisma.$transaction([
    // ❌ unset previous default
    prisma.customer_address.updateMany({
      where: {
        customer_list_id: user.id,
        is_default: true,
      },
      data: {
        is_default: false,
      },
    }),

    // ✅ set new default
    prisma.customer_address.update({
      where: { id: address.id },
      data: {
        is_default: true,
      },
    }),
  ]);

  revalidatePath("/my-account/addresses");
}
