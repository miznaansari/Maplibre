"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCustomerGroup(customerId, groupId) {
  if (!customerId) return;

  await prisma.customer_list.update({
    where: { id: customerId },
    data: {
      customer_group_id: Number(groupId) || null,
    },
  });

  // Revalidate customers list page
  revalidatePath("/admin/customer");
}
