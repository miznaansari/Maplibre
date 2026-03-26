"use client";

import Image from "next/image";
import { useState } from "react";
import { addToCartDB } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";

/* =========================
   GUEST CART (localStorage)
========================= */
function addToGuestCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existing = cart.find(
    (i) => i.productId === item.productId
  );

  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function ProductDetailClient({ product, isLoggedIn }) {
  const [qty, setQty] = useState(1);
  const {reloadCart} = useCart();
  console.log('isLoggedIn', isLoggedIn)

  const price =
    product.price ??
    product.regular_price;

  /* =========================
     ADD TO CART HANDLER
  ========================= */

  const { showToast } = useToast();
  const handleAddToCart = async () => {
    // 🔐 LOGGED-IN USER → DATABASE
    if (isLoggedIn) {
      await addToCartDB({
        productId: product.id,
        qty,
        price,
        isLoggedIn,
      });

      showToast({
        type: "success",
        message: "Product added to cart successfully",
      });

      return;
    }

    // 👤 GUEST USER → LOCALSTORAGE (NEW LOGIC)
    const existingCart =
      JSON.parse(localStorage.getItem("guest_cart")) || {};

    const updatedCart = { ...existingCart };

    if (updatedCart[product.id]) {
      // ✅ If product already exists → increase quantity
      updatedCart[product.id].quantity =
        Number(updatedCart[product.id].quantity) + Number(qty);
    } else {
      // ✅ New product
      updatedCart[product.id] = {
        product_id: product.id,
        name: product.name,
        price: price,
        image: product.mainImage,
        quantity: qty,
      };
    }

    localStorage.setItem("guest_cart", JSON.stringify(updatedCart));

    showToast({
      type: "info",
      message: "Saved to cart. Login to continue",
    });
  };


  return (
    <section className="mx-auto max-w-7xl px-4 py-10 pt-0">
      {/* Breadcrumb */}
      <p className="mb-6 text-sm text-gray-500 mt-3">
        HOME / {product.category.path.replaceAll("/", " / ")}
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* IMAGE */}
        <div className="rounded bg-white p-4">
          <Image
            src={product.mainImage}
            alt={product.name}
            width={600}
            height={400}
            className="w-full object-contain"
            priority
          />
        </div>

        {/* INFO */}
        <div className="lg:col-span-2">
          <div className="text-3xl font-semibold text-gray-900">
            {product.name}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            SKU: <span className="font-medium">{product.sku}</span>
          </p>

          <p className="mt-4 text-2xl font-bold text-blue-600">
            ${price}
            <span className="ml-2 text-sm text-gray-400">
              EXCL. GST
            </span>
          </p>

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="h-10 w-10 rounded border"
            >
              −
            </button>

            <span className="w-10 text-center">{qty}</span>

            <button
              onClick={() => setQty(qty + 1)}
              className="h-10 w-10 rounded border"
            >
              +
            </button>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            className="mt-6 rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Add to cart
          </button>

          {/* Description */}
          {product.description && (
            <div
              className="mt-8 text-gray-700"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
