"use server";

import { prisma } from "@/lib/prisma";
export async function addToCartAction({ customerId, quantities }) {
  if (!customerId) {
    return { success: false, message: "Customer not found" };
  }

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
export async function getWishlists(customerId) {
  if (!customerId) return [];

  return prisma.wishlist.findMany({
    where: {
      customer_list_id: customerId,
      is_deleted: false,
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });
}

/* =========================
   CREATE WISHLIST
========================= */
export async function createWishlist(customerId, title) {
  if (!customerId || !title) {
    return { success: false };
  }

  const wishlist = await prisma.wishlist.create({
    data: {
      customer_list_id: customerId,
      title,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return { success: true, wishlist };
}

/* =========================
   ADD PRODUCTS TO WISHLIST
========================= */
export async function addProductsToWishlist({ wishlistId, items }) {
  // items = [{ productId, quantity }]

  for (const item of items) {
    await prisma.wishlist_product.upsert({
      where: {
        // ✅ EXACT compound unique key name
        wishlist_id_product_list_id: {
          wishlist_id: wishlistId,
          product_list_id: item.productId,
        },
      },
      update: {
        // ✅ correct column name
        qty: item.quantity,
      },
      create: {
        wishlist_id: wishlistId,
        product_list_id: item.productId,
        qty: item.quantity,
      },
    });
  }

  return { success: true };
}

export async function getWishlistForPrefill(wishlistId, customerId) {
  if (!wishlistId || !customerId) {
    throw new Error("Invalid wishlist or customer");
  }

  const wishlist = await prisma.wishlist.findFirst({
    where: {
      id: Number(wishlistId),
      customer_list_id: Number(customerId),
      is_deleted: false,
    },
    select: {
      id: true,
      title: true,
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

  if (!wishlist) return null;

  return {
    id: wishlist.id,
    title: wishlist.title,
    items: wishlist.products,
  };
}

export async function getOrderList(customerId) {
  if (!customerId) return [];

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

export async function getOrderForPrefill(orderId, customerId) {
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
export async function deleteCartItem(_, formData) {
  const cartId = Number(formData.get("cartId"));

  if (!cartId) return;

  await prisma.customer_cart.update({
    where: { id: cartId },
    data: {
      is_deleted: true,
    },
  });

}
