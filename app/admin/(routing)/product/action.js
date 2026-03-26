"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePath } from "next/cache";

export async function toggleStatus(id, newStatus) {
  const admin = await requireAdmin();
  if (!admin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }
await prisma.product_list.update({
  where: { id },
  data: { is_active: newStatus },
});

// Revalidate the page where the table exists
revalidatePath("/admin"); // change if needed
}
