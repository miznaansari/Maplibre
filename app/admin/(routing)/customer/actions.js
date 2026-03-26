"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePath } from "next/cache";

export async function updateCustomerGroup(customerId, groupId) {
  const admin = await requireAdmin();

  if (!admin) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized",
    };
  }

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

export async function updateCustomerPriceTier(customerId, priceTier) {
    const admin = await requireAdmin();

  if (!admin) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized",
    };
  }
  if (!customerId) return;

  await prisma.customer_list.update({
    where: { id: customerId },
    data: {
      price_tier: priceTier || null,
    },
  });

  // Revalidate customers list
  revalidatePath("/admin/customer");
}


export async function togglecustomerStatus(customerId, currentStatus) {
  const loggedInAdmin = await requireAdmin();

  // ❌ Not logged in → redirect to /admin
  // ❌ Not logged in
  if (!loggedInAdmin) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized",
    };
  }

  try {
    const newStatus = !currentStatus;

   
    // 1️⃣ Update customer status
    const updatedCustomer = await prisma.customer_list.update({
      where: { id: customerId },
      data: {
        is_active: newStatus,
      },
      select: {
        is_active: true,
      },
    });

    // 2️⃣ If customer is inactivated → expire all sessions
    if (newStatus === false) {
      await prisma.customer_session.updateMany({
        where: {
          customer_list_id: customerId,
          is_expired: false,
        },
        data: {
          is_expired: true,
        },
      });
    }

    return {
      success: true,
      is_active: updatedCustomer.is_active,
    };
  } catch (error) {
    console.error("TOGGLE CUSTOMER STATUS ERROR:", error);

    return {
      success: false,
      message: "Failed to update status",
    };
  }
}


export async function customerBlockAction(customerId) {
  const admin = await requireAdmin();

  if (!admin) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized",
    };
  }

  if (!customerId) return;

  const customer = await prisma.customer_list.findUnique({
    where: { id: customerId },
    select: { is_blocked: true },
  });

  if (!customer) {
    return {
      success: false,
      message: "Customer not found",
    };
  }

  await prisma.customer_list.update({
    where: { id: customerId },
    data: {
      is_blocked: !customer.is_blocked,
    },
  });

  // Revalidate customers list
  revalidatePath("/admin/customer");
}