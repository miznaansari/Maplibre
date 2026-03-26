"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
function generateWishlistCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "s";

  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}
export async function createWishlist(formData) {
  try {
    const admin = await requireAdmin();
    if (!admin?.id) {
      return {
        status: false,
        message: "Unauthorized",
      };
    }

    const title = formData.get("title");
    const is_public = formData.get("is_public") === "on";
    const admin_id = admin.id;

    if (!title) {
      return {
        status: false,
        message: "Title is required",
      };
    }

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const slug = generateWishlistCode();

      try {
        const wishlist = await prisma.wishlist.create({
          data: {
            title,
            is_public,
            admin_id,
            slug,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            is_public: true,
          },
        });

        return {
          status: true,
          message: "Wishlist created successfully",
          data: wishlist,
        };
      } catch (error) {
        // 🔁 Unique slug collision → retry
        if (error.code === "P2002" && attempt < MAX_RETRIES) {
          continue;
        }

        // ❌ Other DB error
        return {
          status: false,
          message: "Database error while creating wishlist",
        };
      }
    }

    return {
      status: false,
      message: "Could not generate a unique wishlist slug",
    };
  } catch (error) {
    return {
      status: false,
      message: "Something went wrong",
    };
  }
}


export async function addItemsToWishlist(wishlistId, items) {
  return prisma.$transaction(async (tx) => {

    const productIds = items.map(i => i.product_id);

    // 1️⃣ Fetch existing rows (deleted or not)
    const existing = await tx.wishlist_product.findMany({
      where: {
        wishlist_id: wishlistId,
        product_list_id: { in: productIds },
      },
      select: {
        product_list_id: true,
        is_deleted: true,
      },
    });

    const existingMap = new Map(
      existing.map(e => [e.product_list_id, e.is_deleted])
    );

    const ops = [];

    for (const item of items) {
      if (existingMap.has(item.product_id)) {
        // UPDATE (restore if deleted)
        ops.push(
          tx.wishlist_product.update({
            where: {
              wishlist_id_product_list_id: {
                wishlist_id: wishlistId,
                product_list_id: item.product_id,
              },
            },
            data: {
              qty: item.qty,
              is_deleted: false, // 👈 restore if deleted
            },
          })
        );
      } else {
        // INSERT
        ops.push(
          tx.wishlist_product.create({
            data: {
              wishlist_id: wishlistId,
              product_list_id: item.product_id,
              qty: item.qty,
              is_deleted: false,
            },
          })
        );
      }
    }

    return Promise.all(ops);
  });
}


export async function getWishlists() {
  const admin = await requireAdmin(); // may return admin or null

  const wishlists = await prisma.wishlist.findMany({
    where: {
      is_deleted: false,
      OR: [
        { customer_list_id: admin?.id ?? undefined },
        { admin_id: { not: null } }, // 👈 KEY LINE
      ],
    },
    select: {
      id: true,
      title: true,
      is_public: true,
      products: {
        where: { is_deleted: false },
        select: { id: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return wishlists;
}

export async function getWishlistForPrefill(wishlistId) {
  if (!wishlistId) {
    return {
      success: false,
      message: "Invalid wishlist id",
    };
  }

  const user = await requireAdmin().catch(() => null);

  const wishlist = await prisma.wishlist.findFirst({
    where: {
      id: Number(wishlistId),
      is_deleted: false,
      OR: [
        { is_public: true }, // ✅ public wishlist
        { customer_list_id: user?.id ?? -1 }, // ✅ owner wishlist
      ],
    },
    select: {
      id: true,
      title: true,
      is_public: true,
      products: {
        where: {
          is_deleted: false,
        },
        select: {
          product_list_id: true,
          qty: true,
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    return {
      success: false,
      message: "Wishlist not found or access denied",
    };
  }

  return {
    success: true,
    id: wishlist.id,
    title: wishlist.title,
    is_public: wishlist.is_public,
    items: wishlist.products.map((p) => ({
      product_list_id: p.product_list_id,
      qty: p.qty,
      name: p.product.name,
      sku: p.product.sku,
    })),
  };
}


export async function removeItemFromWishlist(wishlistId, product_id) {
  const user = await requireAdmin();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return prisma.wishlist_product.update({
    where: {
      wishlist_id_product_list_id: {
        wishlist_id: Number(wishlistId),
        product_list_id: Number(product_id),
      },
    },
    data: {
      is_deleted: true,
    },
  });
}
export async function getWishlistItems(wishlistId) {
  console.log("[getWishlistItems] called with wishlistId:", wishlistId);

  const user = await requireAdmin();
  console.log("[getWishlistItems] user from requireAdmin():", user);

  if (!user?.id) {
    console.error("[getWishlistItems] Unauthorized access, user:", user);
    throw new Error("Unauthorized");
  }

  const query = {
    where: {
      wishlist_id: Number(wishlistId),
      is_deleted: false,
      wishlist: {
        // customer_list_id: user.id,
        is_deleted: false,
      },
    },
    select: {
      product_list_id: true,
      qty: true,
    },
  };

  console.log("[getWishlistItems] Prisma query:", query);

  const result = await prisma.wishlist_product.findMany(query);

  console.log("[getWishlistItems] Query result:", result);

  return result;
}


export async function toggleWishlistVisibility(wishlistId, currentStatus) {
  const admin = await requireAdmin();

  if (!admin?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    await prisma.wishlist.update({
      where: {
        id: Number(wishlistId),
      },
      data: {
        is_public: !currentStatus,
      },
    });

    return {
      success: true,
      message: `Wishlist is now ${!currentStatus ? "Public" : "Private"}`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update wishlist visibility",
    };
  }
}
export async function deleteWishlistById(wishlistId) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    await prisma.wishlist.update({
      where: {
        id: Number(wishlistId),
      },
      data: {
        is_deleted: true,
      },
    });

    return {
      success: true,
      message: "Wishlist deleted successfully",
    };
  } catch (error) {
    console.error("Delete wishlist error:", error);

    return {
      success: false,
      message: "Failed to delete wishlist",
    };
  }
}
