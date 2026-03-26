"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
export async function addToCartAction({ quantities }) {

  const user = await requireUser();
  if (!user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }
  let customerId = user.id;

  const entries = Object.entries(quantities)
    .filter(([_, qty]) => Number(qty) > 0)
    .map(([productId, qty]) => ({
      productId: Number(productId),
      qty: Number(qty),
    }));

  if (!entries.length) {
    return { success: false, message: "No quantity selected" };
  }

  try {
    for (const item of entries) {
      // ✅ ONLY check active cart row
      const activeCart = await prisma.customer_cart.findFirst({
        where: {
          customer_list_id: customerId,
          product_list_id: item.productId,
          is_deleted: false,
        },
        orderBy: { id: "desc" }, // safety
      });

      // ✅ Active exists → increment qty
      if (activeCart) {
        await prisma.customer_cart.update({
          where: { id: activeCart.id },
          data: {
            quantity: {
              increment: item.qty,
            },
          },
        });
      }
      // 🆕 No active row → create new
      else {
        await prisma.customer_cart.create({
          data: {
            customer_list_id: customerId,
            product_list_id: item.productId,
            quantity: item.qty,
            is_deleted: false,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      message: "Failed to add products to cart",
    };
  }
}


/* =========================
   GET WISHLISTS
========================= */
export async function getWishlists() {
  const user = await requireUser().catch(() => null);

  const whereCondition = {
    is_deleted: false,
    ...(user?.id
      ? {
        OR: [
          { customer_list_id: user.id }, // user's own wishlists
          { is_public: true },            // public wishlists
        ],
      }
      : {
        is_public: true, // unauthenticated users
      }),
  };

  return prisma.wishlist.findMany({
    where: whereCondition,
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      title: true,
      is_public: true,
    },
  });
}

export async function getUserWishlists() {
  const user = await requireUser().catch(() => null);

  const whereCondition = {
    is_deleted: false,
    ...(user?.id
      ? {
        OR: [
          { customer_list_id: user.id }, // user's own wishlists
          // { is_public: true },            // public wishlists
        ],
      }
      : {
        is_public: true, // unauthenticated users
      }),
  };

  return prisma.wishlist.findMany({
    where: whereCondition,
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      title: true,
      is_public: true,
    },
  });
}



/* =========================
   CREATE WISHLIST
========================= */
function generateSlug(length = 5) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export async function createWishlist(title) {
  const user = await requireUser();

  if (!user?.id) {
    return { success: false, message: "User not authenticated" };
  }

  if (!title) {
    return { success: false, message: "Title is required" };
  }

  const customerId = user.id;
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const slug = "s" + generateSlug(5);

    try {
      const wishlist = await prisma.wishlist.create({
        data: {
          customer_list_id: customerId,
          title,
          slug,
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
      });

      return { success: true, wishlist };
    } catch (error) {
      // Prisma unique constraint error
      if (error.code === "P2002" && attempt < MAX_RETRIES) {
        continue; // slug collision → try again
      }
      throw error;
    }
  }

  return {
    success: false,
    message: "Could not generate unique slug, try again",
  };
}

/* =========================
   ADD PRODUCTS TO WISHLIST
========================= */
export async function addProductsToWishlist({ wishlistId, items }) {
  const user = await requireUser();

  if (!user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }
  /**
   * items = [{ productId, quantity, status }]
   */

  if (!wishlistId || !Array.isArray(items)) {
    return {
      success: false,
      message: "Invalid wishlist or items",
    };
  }

  /* =========================
     FETCH EXISTING WISHLIST ITEMS
  ========================= */
  const existingProducts = await prisma.wishlist_product.findMany({
    where: { wishlist_id: wishlistId },
    select: {
      id: true,
      product_list_id: true,
      qty: true,
      is_deleted: true,
    },
  });

  const dbMap = new Map(
    existingProducts.map((p) => [p.product_list_id, p])
  );

  /* =========================
     FETCH PRODUCTS (NAME + STEPPER)
  ========================= */
  const productIds = items.map((i) => i.productId);

  const products = await prisma.product_list.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      stepper_value: true,
    },
  });

  const productMap = new Map(
    products.map((p) => [
      p.id,
      {
        name: p.name,
        step: Number(p.stepper_value),
      },
    ])
  );

  /* =========================
     PROCESS ITEMS
  ========================= */
  for (const item of items) {
    const dbItem = dbMap.get(item.productId);
    const product = productMap.get(item.productId);

    if (!product) {
      return {
        success: false,
        message: "One or more products no longer exist",
      };
    }

    /* =========================
       REMOVED → NO STEPPER CHECK
    ========================= */
    if (item.status === "removed") {
      if (dbItem && !dbItem.is_deleted) {
        await prisma.wishlist_product.update({
          where: { id: dbItem.id },
          data: { is_deleted: true },
        });
      }
      continue;
    }

    /* =========================
       STEPPER VALIDATION (STRICT)
    ========================= */
    if (
      product.step && // null / undefined allowed
      item.quantity &&
      item.quantity % product.step !== 0
    ) {
      return {
        success: false,
        message: `“${product.name}” quantity must be a multiple of ${product.step}`,
      };
    }

    /* =========================
       EXISTING → SKIP
    ========================= */
    if (item.status === "existing") {
      continue;
    }

    /* =========================
       MODIFIED
    ========================= */
    if (item.status === "modified") {
      if (dbItem && !dbItem.is_deleted && dbItem.qty !== item.quantity) {
        await prisma.wishlist_product.update({
          where: { id: dbItem.id },
          data: { qty: item.quantity },
        });
      }
      continue;
    }

    /* =========================
       NEW
    ========================= */
    if (item.status === "new") {
      if (dbItem && dbItem.is_deleted) {
        await prisma.wishlist_product.update({
          where: { id: dbItem.id },
          data: {
            is_deleted: false,
            qty: item.quantity ?? 1,
          },
        });
        continue;
      }

      if (!dbItem) {
        await prisma.wishlist_product.create({
          data: {
            wishlist_id: wishlistId,
            product_list_id: item.productId,
            qty: item.quantity ?? 1,
          },
        });
      }
    }
  }

  return { success: true };
}

export async function getWishlistForPrefill(wishlistId) {
  console.log("[getWishlistForPrefill] called with:", wishlistId);

  const user = await requireUser();
  console.log("[getWishlistForPrefill] user:", user?.id ?? "GUEST");
  console.log('user',user)

  if (!wishlistId) {
    console.warn("[getWishlistForPrefill] Invalid wishlistId");
    return {
      success: false,
      message: "Invalid wishlist id",
    };
  }

const isNumeric = !Number.isNaN(Number(wishlistId));

const whereCondition = {
  is_deleted: false,

  ...(isNumeric
    ? { id: Number(wishlistId) }
    : { slug: wishlistId }),

  ...(user?.id
    ? {
        OR: [
          { is_public: true },
          { customer_list_id: user.id },
        ],
      }
    : {
        // is_public: true, // guest users only see public
      }),
};



  console.log(
    "[getWishlistForPrefill] Prisma where condition:",
    JSON.stringify(whereCondition, null, 2)
  );

  let wishlist;

  try {
    wishlist = await prisma.wishlist.findFirst({
      where: whereCondition,
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
          },
        },
      },
    });
  } catch (error) {
    console.error("[getWishlistForPrefill] Prisma error:", error);
    return {
      success: false,
      message: "Database error",
    };
  }

  console.log("[getWishlistForPrefill] Prisma result:", wishlist);

  if (!wishlist) {
    console.warn(
      "[getWishlistForPrefill] Wishlist not found or access denied",
      {
        wishlistId,
        userId: user?.id ?? null,
      }
    );

    return {
      success: false,
      message: "Wishlist not found or access denied",
    };
  }

  console.log("[getWishlistForPrefill] Success:", {
    id: wishlist.id,
    title: wishlist.title,
    itemsCount: wishlist.products.length,
  });

  return {
    success: true,
    id: wishlist.id,
    title: wishlist.title,
    is_public: wishlist.is_public,
    items: wishlist.products,
  };
}



export async function getOrderList() {
  const user = await requireUser();
  if (!user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }
  let customerId = user.id;

  const orders = await prisma.order_list.findMany({
    where: {
      customer_list_id: customerId,
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      order_number: true,
    },
  });

  return orders.map((o) => ({
    id: o.id,
    title: `Order #${o.order_number}`,
  }));
}

export async function getOrderForPrefill(orderId) {
  const user = await requireUser();
  if (!user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }
  let customerId = user.id;
  if (!orderId || !customerId) {
    throw new Error("Invalid order or customer");
  }

  const order = await prisma.order_list.findFirst({
    where: {
      id: Number(orderId),
      customer_list_id: Number(customerId),
    },
    select: {
      id: true,
      order_number: true,
      items: {
        select: {
          product_list_id: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    title: `Order #${order.order_number}`, // ✅ SAME as wishlist title
    items: order.items.map((item) => ({
      product_list_id: item.product_list_id,
      qty: item.quantity, // 🔁 normalize to wishlist format
    })),
  };
}
export async function addSingleItemToWishlist({
  wishlistId,
  productId,
  quantity,
}) {
  console.log("[Wishlist] Incoming request", {
    wishlistId,
    productId,
    quantity,
  });

  /* =========================
     AUTH
  ========================= */
  const user = await requireUser();
  console.log("[Wishlist] Auth user:", user?.id);

  if (!user?.id) {
    console.log("[Wishlist] Auth failed");
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  /* =========================
     BASIC VALIDATION
  ========================= */
  if (!wishlistId || !productId) {
    console.log("[Wishlist] Validation failed: wishlistId/productId missing");
    return {
      success: false,
      message: "Wishlist or product is missing",
    };
  }

  // if (!quantity || quantity <= 0) {
  //   console.log("[Wishlist] Validation failed: invalid quantity", quantity);
  //   return {
  //     success: false,
  //     message: "Quantity must be greater than zero",
  //   };
  // }

  try {
    /* =========================
       VERIFY WISHLIST OWNERSHIP
    ========================= */
    console.log("[Wishlist] Checking wishlist ownership");

    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        customer_list_id: user.id,
        is_deleted: false,
      },
      select: { id: true },
    });

    console.log("[Wishlist] Wishlist result:", wishlist);

    if (!wishlist) {
      console.log("[Wishlist] Ownership check failed");
      return {
        success: false,
        message: "You are not allowed to modify this wishlist",
      };
    }

    /* =========================
       FETCH PRODUCT
    ========================= */
    console.log("[Wishlist] Fetching product:", productId);

    const product = await prisma.product_list.findUnique({
      where: { id: productId },
      select: { stepper_value: true },
    });

    console.log("[Wishlist] Product:", product);

    if (!product) {
      console.log("[Wishlist] Product not found");
      return {
        success: false,
        message: "Product not found",
      };
    }

    /* =========================
       STEPPER VALIDATION
    ========================= */
    const step = Number(product.stepper_value) || 1;
    console.log("[Wishlist] Stepper value:", step);

    if (step > 1 && quantity % step !== 0) {
      console.log("[Wishlist] Step validation failed", {
        quantity,
        step,
      });

      return {
        success: false,
        message: `Quantity must be a multiple of ${step}`,
      };
    }

    /* =========================
       UPSERT ITEM
    ========================= */
    console.log("[Wishlist] Checking existing wishlist item");

    const existingItem = await prisma.wishlist_product.findUnique({
      where: {
        wishlist_id_product_list_id: {
          wishlist_id: wishlistId,
          product_list_id: productId,
        },
      },
    });

    console.log("[Wishlist] Existing item:", existingItem);

    if (existingItem) {
      console.log("[Wishlist] Updating existing item");

      await prisma.wishlist_product.update({
        where: { id: existingItem.id },
        data: {
          qty: quantity,
          is_deleted: false,
        },
      });

      console.log("[Wishlist] Item updated successfully");

      return {
        success: true,
        action: "updated",
        message: "Wishlist item updated",
      };
    }

    console.log("[Wishlist] Creating new wishlist item");

    await prisma.wishlist_product.create({
      data: {
        wishlist_id: wishlistId,
        product_list_id: productId,
        // qty: quantity,
        is_deleted: false,
      },
    });

    console.log("[Wishlist] Item created successfully");

    return {
      success: true,
      action: "created",
      message: "Product added to wishlist",
    };
  } catch (error) {
    console.error("[Wishlist] Error", error);

    return {
      success: false,
      message: "Failed to add product to wishlist",
    };
  }
}

/* =========================
   ADD MULTIPLE ITEMS TO WISHLIST
========================= */
export async function addWishlistItems(wishlistId, items) {
  const user = await requireUser();

  if (!user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  /* =========================
     VERIFY WISHLIST OWNER
  ========================= */
  const wishlist = await prisma.wishlist.findFirst({
    where: {
      id: wishlistId,
      customer_list_id: user.id,
      is_deleted: false,
    },
    select: { id: true },
  });

  if (!wishlist) {
    return {
      success: false,
      message: "You are not allowed to modify this wishlist",
    };
  }

  /* =========================
     UPSERT ITEMS
  ========================= */
  for (const item of items) {
    await prisma.wishlist_product.upsert({
      where: {
        wishlist_id_product_list_id: {
          wishlist_id: wishlistId,
          product_list_id: item.productId,
        },
      },
      update: {
        qty: item.quantity,
        is_deleted: false,
      },
      create: {
        wishlist_id: wishlistId,
        product_list_id: item.productId,
        qty: item.quantity,
        is_deleted: false,
      },
    });
  }

  return { success: true };
}

export async function addSingleItemRemoveToWishlist({
  wishlistId,
  productId,
}) {
  const user = await requireUser();

  if (!user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    /* =========================
       VERIFY WISHLIST OWNER
    ========================= */
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        customer_list_id: user.id,
        is_deleted: false,
      },
      select: { id: true },
    });

    if (!wishlist) {
      return {
        success: false,
        message: "You are not allowed to modify this wishlist",
      };
    }

    /* =========================
       FIND EXISTING ITEM
    ========================= */
    const existingItem = await prisma.wishlist_product.findUnique({
      where: {
        wishlist_id_product_list_id: {
          wishlist_id: wishlistId,
          product_list_id: productId,
        },
      },
    });

    /* =========================
       TOGGLE LOGIC
    ========================= */
    if (existingItem) {
      if (existingItem.is_deleted) {
        // 🔁 Restore
        await prisma.wishlist_product.update({
          where: { id: existingItem.id },
          data: { is_deleted: false },
        });

        return {
          success: true,
          action: "restored",
          message: "Product added back to wishlist",
        };
      } else {
        // ❌ Soft delete
        await prisma.wishlist_product.update({
          where: { id: existingItem.id },
          data: { is_deleted: true },
        });

        return {
          success: true,
          action: "removed",
          message: "Product removed from wishlist",
        };
      }
    }

    /* =========================
       CREATE NEW ITEM
    ========================= */
    await prisma.wishlist_product.create({
      data: {
        wishlist_id: wishlistId,
        product_list_id: productId,
        // qty NOT passed → default = 1
        is_deleted: false,
      },
    });

    return {
      success: true,
      action: "created",
      message: "Product added to wishlist",
    };
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return {
      success: false,
      message: "Failed to update wishlist",
    };
  }
}



export async function AddtoYourWishlist(sharedWishlistSlug) {
  console.log('sharedWishlistSlug',sharedWishlistSlug)
  try {
    const user = await requireUser();

    if (!user?.id) {
      return {
        success: false,
        message: "You need to Login to add this wishlist to your account",
      };
    }

    if (!sharedWishlistSlug) {
      return {
        success: false,
        message: "Invalid wishlist slug",
      };
    }

    // 1️⃣ Get shared wishlist (must be public)
    const sharedWishlist = await prisma.wishlist.findFirst({
      where: {
        slug: sharedWishlistSlug,
        is_deleted: false,
      },
      include: {
        products: {
          where: { is_deleted: false },
        },
      },
    });

    if (!sharedWishlist) {
      return {
        success: false,
        message: "Shared wishlist not found",
      };
    }

    // 2️⃣ Create new wishlist for current user
    const newWishlist = await prisma.wishlist.create({
      data: {
        customer_list_id: user.id,
        title: sharedWishlist.title,
        is_public: false, // user's own wishlist
      },
    });

    // 3️⃣ Copy products
    if (sharedWishlist.products.length > 0) {
      await prisma.wishlist_product.createMany({
        data: sharedWishlist.products.map((item) => ({
          wishlist_id: newWishlist.id,
          product_list_id: item.product_list_id,
          qty: item.qty,
        })),
      });
    }

    return {
      success: true,
      wishlistId: newWishlist.id,
      message: "Wishlist added successfully",
    };
  } catch (error) {
    console.error("AddtoYourWishlist error:", error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}