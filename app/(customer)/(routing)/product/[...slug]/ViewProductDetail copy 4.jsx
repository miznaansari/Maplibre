"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { addToCartDB, deleteCartItem } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";
import Highlight from "./highlight";

export default function ProductDetailClient({ product, isLoggedIn }) {
  const { showToast } = useToast();
  const { cartItems, reloadCart } = useCart();

  const price = product.price ?? product.regular_price;
  const step = Number(product.stepper_value ?? 1);

  const [qty, setQty] = useState(step);
  const [draftQty, setDraftQty] = useState(step);
  const [qtyError, setQtyError] = useState("");

  const debounceRef = useRef(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  /* =====================================================
     🛒 CURRENT CART ITEM
  ===================================================== */
  const cartItem = useMemo(() => {
    return cartItems?.find(
      (item) =>
        item.product_list_id === product.id &&
        item.is_deleted === false
    );
  }, [cartItems, product.id]);

  /* =====================================================
     🔄 SYNC QTY FROM CART
  ===================================================== */
  useEffect(() => {
    if (cartItem?.quantity) {
      setQty(cartItem.quantity);
      setDraftQty(cartItem.quantity);
    } else {
      setQty(step);
      setDraftQty(step);
    }
  }, [cartItem, step]);

  /* =====================================================
     🔢 VALIDATION
  ===================================================== */
  const validateAndSetQty = (value) => {
    const val = Number(value);

    if (!val || val === 0) {
      setQty(step);
      setDraftQty(step);
      setQtyError("");
      return;
    }

    if (val < step) {
      setQtyError(`Minimum required ${step}`);
      return;
    }

    if (val % step !== 0) {
      setQtyError(`Quantity must be in multiples of ${step}`);
      return;
    }

    setQtyError("");
    setQty(val);
    setDraftQty(val);
  };

  /* =====================================================
     ⌨️ TYPING → DEBOUNCED
  ===================================================== */
  const handleQtyChangeDebounced = (value) => {
    setDraftQty(value);
    setQtyError("");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateAndSetQty(value);
    }, 400);
  };

  /* =====================================================
     ⬆⬇ ARROWS → IMMEDIATE
  ===================================================== */
  const handleQtyChangeImmediate = (value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    validateAndSetQty(value);
  };

  /* =====================================================
     ➕ ADD / UPDATE CART
  ===================================================== */
  const handleAddToCart = async () => {
    if (isAdding || qtyError) return;
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
        const existingCart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};

        existingCart[product.id] = {
          product_id: product.id,
          name: product.name,
          price,
          image: product.mainImage,
          quantity: qty,
        };

        localStorage.setItem("guest_cart", JSON.stringify(existingCart));

        showToast({
          type: "info",
          message: "Saved to cart. Login to continue",
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

  /* =====================================================
     🗑 REMOVE ITEM
  ===================================================== */
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
      <p className="mb-6 text-sm text-gray-500 mt-3">
        HOME / {product.category.path.replaceAll("/", " / ")}
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 bg-white">
        {/* IMAGE */}
        <div className="flex items-center justify-center p-2 pr-0">
          <div className="relative aspect-square w-full max-w-sm">
           <img
  src={product.mainImage}
  alt={product.name}
  className="w-full h-full object-cover"
/>

          </div>
        </div>

        {/* DETAILS */}
        <div className="lg:col-span-2 mt-8 border-l border-gray-200 pl-4">
          <p className="text-sm mb-2">
            <span className="text-gray-400">SKU:</span>{" "}
            {product.sku || "N/A"}
          </p>

          <h1 className="text-2xl font-semibold text-gray-900">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-4">
            <span className="text-3xl font-bold text-[#0172BC]">
              ${price}
            </span>
            <span>|</span>
            <span className="text-sm text-gray-500">
              {product.measure_unit}
            </span>
          </div>

          <p className="text-sm text-[#ACAAA6]">
            Excluding Goods and Services Tax
          </p>

          {/* ACTIONS */}
          <div className="mt-6 max-w-md space-y-2">
            <div className="flex gap-3">
              <input
                type="number"
                min={step}
                value={draftQty}
                disabled={isAdding || isRemoving}
                onChange={(e) =>
                  handleQtyChangeDebounced(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    handleQtyChangeImmediate(qty + step);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    handleQtyChangeImmediate(
                      Math.max(step, qty - step)
                    );
                  }
                }}
                className={`h-11 w-24 rounded border text-center focus:outline-none focus:ring-2 ${
                  qtyError
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />

              <button
                onClick={handleAddToCart}
                disabled={isAdding || isRemoving || !!qtyError}
                className={`flex-1 rounded px-6 py-3 text-sm font-medium text-white transition ${
                  isAdding || qtyError
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-[#00AEEF] hover:bg-[#0172BC]"
                }`}
              >
                {isAdding
                  ? "Saving…"
                  : cartItem
                  ? "Update Cart"
                  : "Add to Cart"}
              </button>
            </div>

            {step > 1 && (
              <div className="p-1 rounded-full bg-[#E7F9FF] text-[#0172BC] text-sm flex items-center">
                <span className="pl-2">
                  Minimum quantity should be {step} or more, in
                  batches of {step}.
                </span>
              </div>
            )}

            {qtyError && (
              <p className="text-sm text-red-500">{qtyError}</p>
            )}

            {cartItem && (
              <button
                onClick={handleRemoveItem}
                disabled={isRemoving}
                className="h-11 w-full rounded border border-red-500 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {isRemoving
                  ? "Removing…"
                  : "Remove from Cart"}
              </button>
            )}
          </div>

          {cartItem && (
            <p className="mt-2 text-sm text-green-600">
              ✔ {cartItem.quantity} item(s) in cart
            </p>
          )}

          <div className="mt-8 rounded bg-gray-100 p-4">
            <Highlight />
          </div>
        </div>
      </div>
    </section>
  );
}
