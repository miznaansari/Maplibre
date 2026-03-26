// app/wishlist/actions.js
"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* ============================
   MARK AS PUBLIC / PRIVATE
============================ */
export async function markAsPublic(wishlistId, isPublic) {
  const user = await requireUser();
  if(!user){
    throw new Error("Unauthorized Access");
  }

  await prisma.wishlist.update({
    where: {
      id: wishlistId,
      customer_list_id: user.id,
    },
    data: {
      is_public: isPublic,
    },
  });

  revalidatePath("/wishlist");
}

/* ============================
   REMOVE WISHLIST (SOFT DELETE)
============================ */
export async function removeWishlist(wishlistId) {
  const user = await requireUser();
  if(!user){
    throw new Error("Unauthorized Access");
  }

  await prisma.wishlist.update({
    where: {
      id: wishlistId,
      customer_list_id: user.id,
    },
    data: {
      is_deleted: true,
    },
  });

  revalidatePath("/wishlist");
}

/* ============================
   EDIT → REDIRECT TO CHECKOUT
============================ */
export async function editWishlist(wishlistId) {
  redirect(`/checkout?wishlist=${wishlistId}`);
}
