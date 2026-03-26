"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function deleteContactAction(id) {
  await prisma.contact_form.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  revalidatePath("/admin/contact");

  return { success: true };
}
export async function markAsReadAction(id) {
  await prisma.contact_form.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/admin/contact");

  return { success: true };
}