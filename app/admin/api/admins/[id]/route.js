import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

// DELETE /admin/api/admins/:id
export async function DELETE(req, { params }) {
  const loggedInAdmin = await requireAdmin();

  if (!loggedInAdmin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const p = await params;
    const id = Number(p.id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid admin ID" },
        { status: 400 }
      );
    }

    // ❌ Prevent self delete
    if (loggedInAdmin.id === id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account",
        },
        { status: 403 }
      );
    }

    // Check if admin exists & not deleted
    const existingAdmin = await prisma.admins.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // ✅ Soft delete
    await prisma.admins.update({
      where: { id },
      data: {
        is_deleted: true,
        status: false,
      },
    });

    // ✅ Expire all sessions (VERY IMPORTANT 🔥)
    await prisma.admin_session.updateMany({
      where: {
        admin_id: id,
        is_expired: false,
      },
      data: {
        is_expired: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADMIN ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}