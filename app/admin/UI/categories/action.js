"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePath } from "next/cache";

export async function deleteCategory(categoryId) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return {
        success: false,
        status: 401,
        message: "Unauthorized",
      };
    }

    if (!categoryId) {
      return {
        success: false,
        message: "Category ID is required",
      };
    }

    const id = Number(categoryId);

    // Check if category exists
    const category = await prisma.product_category.findUnique({
      where: { id },
    });

    if (!category) {
      return {
        success: false,
        message: "Category not found",
      };
    }

    // Check if category has children
    const childrenCount = await prisma.product_category.count({
      where: {
        parent_id: id,
        is_deleted: false,
      },
    });

    if (childrenCount > 0) {
      return {
        success: false,
        message: "❌ Cannot delete this category. Please delete child categories first.",
      };
    }

    // ✅ Soft delete
    await prisma.product_category.update({
      where: { id },
      data: {
        is_deleted: true,
        is_active: false,
      },
    });

    // Revalidate category list page
    revalidatePath("/admin/category");

    return {
      success: true,
      message: "✅ Category deleted successfully",
    };

  } catch (error) {
    console.error("Delete Category Error:", error);

    return {
      success: false,
      message: "Internal server error",
    };
  }
}
