"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { redirect } from "next/navigation";

export async function getAdmins(searchParams) {
  await requireAdmin();
const s = await searchParams;
  const page = Number(s.page || 1);
  const limit = Number(s.limit || 10);
  const search = s.search || "";

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } }  ,
          { email: { contains: search } },
        ],
      }
    : {};

  const [admins, total] = await Promise.all([
    prisma.admins.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        status: true,
      },
    }),
    prisma.admins.count({ where }),
  ]);

  return {
    data: admins,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function toggleAdminStatus(adminId, currentStatus) {
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

    // ❌ Prevent self-deactivation
    if (loggedInAdmin.id === adminId && newStatus === false) {
      return {
        success: false,
        status: 403,
        message: "You cannot deactivate your own account",
      };
    }

    // 1️⃣ Update admin status
    const updatedAdmin = await prisma.admins.update({
      where: { id: adminId },
      data: {
        status: newStatus,
      },
      select: {
        status: true,
      },
    });

    // 2️⃣ If admin is inactivated → expire all sessions
    if (newStatus === false) {
      await prisma.admin_session.updateMany({
        where: {
          admin_id: adminId,
          is_expired: false,
        },
        data: {
          is_expired: true,
        },
      });
    }

    return {
      success: true,
      status: updatedAdmin.status,
    };
  } catch (error) {
    console.error("TOGGLE ADMIN STATUS ERROR:", error);

    return {
      success: false,
      message: "Failed to update status",
    };
  }
}