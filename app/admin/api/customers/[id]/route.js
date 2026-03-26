import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

// DELETE /admin/api/customers/:id
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

    console.log("🟡 DELETE CUSTOMER ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // ✅ Check if customer exists & not deleted
    const existingCustomer = await prisma.customer_list.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    console.log("🔍 Customer found:", existingCustomer.email);

    // ✅ Soft delete customer
    await prisma.customer_list.update({
      where: { id },
      data: {
        is_deleted: true,
        is_active: false,
      },
    });

    console.log("🧹 Customer soft deleted");

    // ✅ Expire all sessions (important 🔐)
    await prisma.customer_session.updateMany({
      where: {
        customer_list_id: id,
        is_expired: false,
      },
      data: {
        is_expired: true,
      },
    });

    console.log("🔐 Customer sessions expired");

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("🔥 DELETE CUSTOMER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}