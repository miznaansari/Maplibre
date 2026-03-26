"use server";


import { prisma } from "@/lib/prisma"; // adjust path if needed

export async function updateCategory(id, data) {
  try {
    const categoryId = Number(id);

    /* ===============================
       Validations
    =============================== */

    // ❌ Prevent self-parent
    if (data.parent_id && Number(data.parent_id) === categoryId) {
      return {
        success: false,
        message: "Category cannot be parent of itself",
      };
    }

    // ❌ Prevent parent = own child (tree loop protection)
    if (data.parent_id) {
      const children = await prisma.product_category.findMany({
        where: { parent_id: categoryId, is_deleted: false },
        select: { id: true },
      });

      if (children.some(c => c.id === Number(data.parent_id))) {
        return {
          success: false,
          message: "Cannot assign child category as parent",
        };
      }
    }

    /* ===============================
       Build Path
    =============================== */

    let newPath = data.slug;

    if (data.parent_id) {
      const parent = await prisma.product_category.findUnique({
        where: { id: Number(data.parent_id) },
        select: { path: true },
      });

      if (!parent) {
        return {
          success: false,
          message: "Parent category not found",
        };
      }

      newPath = `${parent.path}/${data.slug}`;
    }

    /* ===============================
       Update Category + SEO
    =============================== */

    await prisma.product_category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: data.slug,
        path: newPath,
        parent_id: data.parent_id ? Number(data.parent_id) : null,
        description: data.description,
        is_active: true,

        seo: {
          upsert: {
            create: {
              meta_title: data.meta_title || null,
              meta_description: data.meta_description || null,
              focus_keyword: data.focus_keyword || null,
            },
            update: {
              meta_title: data.meta_title || null,
              meta_description: data.meta_description || null,
              focus_keyword: data.focus_keyword || null,
            },
          },
        },
      },
    });

    return {
      success: true,
      message: "Category updated successfully",
    };

  } catch (error) {
    console.error("updateCategory error:", error);

    // Prisma unique constraint error
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Slug already exists under same parent category",
      };
    }

    return {
      success: false,
      message: "Failed to update category",
      error: error.message,
    };
  }
}
