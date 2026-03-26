"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { addToCartDB, deleteCartItem } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import ServiceHighlights from "@/app/admin/UI/home/ServiceHighlights";
import { useCart } from "@/app/context/CartContext";

export default function ProductDetailClient({ product, isLoggedIn }) {
  const { showToast } = useToast();
  const { cartItems, reloadCart } = useCart();

  const price = product.price ?? product.regular_price;
  const moq = product.moq ?? 1;
  const stock = product.stock_qty ?? 0;

  const [qty, setQty] = useState(moq);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  /* ================= CART ITEM ================= */
  const cartItem = useMemo(() => {
    return cartItems?.find(
      (item) =>
        item.product_list_id === product.id &&
        item.is_deleted === false
    );
  }, [cartItems, product.id]);

  useEffect(() => {
    if (cartItem?.quantity) {
      setQty(cartItem.quantity);
    } else {
      setQty(moq);
    }
  }, [cartItem, moq]);

  /* ================= ADD / UPDATE ================= */
  const handleAddToCart = async () => {
    if (isAdding || qty < moq) return;
    setIsAdding(true);

    try {
      if (isLoggedIn) {
        await addToCartDB({
          productId: product.id,
          qty,
        });
        await reloadCart();

        showToast({
          type: "success",
          message: cartItem
            ? "Cart updated successfully"
            : "Product added to cart",
        });
      } else {
        const guestCart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};

        guestCart[product.id] = {
          product_id: product.id,
          name: product.name,
          price,
          image: product.mainImage,
          quantity: qty,
        };

        localStorage.setItem("guest_cart", JSON.stringify(guestCart));

        showToast({
          type: "info",
          message: "Saved to cart. Login required to place order",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Failed to update cart",
      });
    } finally {
      setIsAdding(false);
    }
  };

  /* ================= REMOVE ================= */
  const handleRemoveItem = async () => {
    if (!cartItem || isRemoving) return;
    setIsRemoving(true);

    try {
      await deleteCartItem({ cartItemId: cartItem.id });
      await reloadCart();

      showToast({
        type: "success",
        message: "Item removed from cart",
      });
    } catch {
      showToast({
        type: "error",
        message: "Failed to remove item",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      {/* BREADCRUMB */}
      <p className="mb-4 text-sm text-gray-500">
        HOME / {product.category.path.replaceAll("/", " / ")}
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* IMAGE */}
        <div className="rounded-lg border bg-white p-4 flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-square">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* DETAILS */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            {product.name}
          </h1>

          {/* PRICE */}
          <div className="mt-3 flex items-end gap-3">
            <span className="text-3xl font-bold text-blue-600">
              ₹{price}
            </span>
            <span className="text-sm text-gray-500">per unit</span>
          </div>

          {/* BUSINESS INFO */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Minimum Order</p>
              <p className="font-medium">{moq} units</p>
            </div>
            <div>
              <p className="text-gray-500">Availability</p>
              <p
                className={`font-medium ${
                  stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stock > 0 ? "In Stock" : "Out of Stock"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">GST</p>
              <p className="font-medium">Invoice available</p>
            </div>
            <div>
              <p className="text-gray-500">Delivery</p>
              <p className="font-medium">3–5 business days</p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="number"
              min={moq}
              value={qty}
              disabled={isAdding || isRemoving}
              onChange={(e) =>
                setQty(Math.max(moq, Number(e.target.value)))
              }
              className="h-11 w-full sm:w-28 rounded border border-gray-300 text-center"
            />

            <button
              onClick={handleAddToCart}
              disabled={isAdding || isRemoving || stock === 0}
              className={`flex-1 rounded px-6 py-3 text-sm font-medium text-white
                ${
                  isAdding
                    ? "bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isAdding
                ? "Saving…"
                : cartItem
                ? "Update Cart"
                : "Add to Cart"}
            </button>
          </div>

          {/* REMOVE */}
          {cartItem && (
            <button
              onClick={handleRemoveItem}
              disabled={isRemoving}
              className="mt-3 text-sm font-medium text-red-600"
            >
              {isRemoving ? "Removing…" : "Remove from Cart"}
            </button>
          )}

          {/* CART INFO */}
          {cartItem && (
            <p className="mt-2 text-sm text-green-600">
              ✔ {cartItem.quantity} units in cart
            </p>
          )}

          {/* SERVICE */}
          <div className="mt-8 rounded bg-gray-50 p-4">
            <ServiceHighlights />
          </div>
        </div>
      </div>
    </section>
  );
}
