"use client";

import { useRef, useState, useEffect } from "react";
import { updateCartQty, deleteCartItem } from "./actions";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function Spinner() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#347eb3]" />
  );
}

/* =========================
   HELPER
========================= */

function getGuestCart() {
  let cart = localStorage.getItem("guest_cart");

  try {
    cart = JSON.parse(cart || "[]");
  } catch {
    cart = [];
  }

  if (!Array.isArray(cart)) {
    cart = Object.values(cart);
  }

  return cart;
}

export default function MyCart({ cartData = [], isGuest = false }) {

  const [cart, setCart] = useState(cartData);

  /* =========================
     LOAD GUEST CART
  ========================= */

  useEffect(() => {
    if (!isGuest) return;

    const guestCart = getGuestCart();

    const formatted = guestCart.map((item) => ({
      id: item.product_id,
      quantity: item.quantity,
      finalPrice: item.price,
      variant_id: item.variant_id,
      variant_size: item.variant_size,

      product: {
        slug: item.slug ?? "",
        name: item.name,
        images: [{ image_url: item.image }],
      },
    }));

    setCart(formatted);
  }, [isGuest]);

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        Your cart is empty
      </div>
    );
  }

  const clearCart = async () => {

    if (isGuest) {

      localStorage.removeItem("guest_cart");

      window.dispatchEvent(new Event("guestCartUpdated"));

      setCart([]);

      return;
    }

    /* DB CART CLEAR */

    const res = await fetch("/api/cart/clear", {
      method: "POST",
    });

    if (res.ok) {
      setCart([]);
    }
  };

  return (
    <div className="max-w-5xl  z-10 mx-auto px-3 sm:px-4 space-y-4" style={{ zIndex: -1 }}>

      {/* LOGIN BANNER */}
      {isGuest && (
        <div className="flex items-center justify-between rounded-xl border border-[#347eb3]/30 bg-[#347eb3]/10 p-4">

          <div className="text-sm text-gray-700">
            Login to save your cart and checkout faster.
          </div>

          <Link
            href="/auth/login"
            className="rounded-lg bg-[#347eb3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0284c7] transition"
          >
            LOGIN
          </Link>

        </div>
      )}

      {cart.map((item) => (
        <CartRow
          key={item.id}
          item={item}
          isGuest={isGuest}
          setCart={setCart}
        />
      ))}

    </div>
  );
}

/* =========================
   CART ROW
========================= */

function CartRow({ item, isGuest, setCart }) {

  const product = item.product;
  const price = item.finalPrice ?? product.sale_price;

  const [qty, setQty] = useState(item.quantity ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debounceRef = useRef(null);

  /* =========================
     UPDATE QTY
  ========================= */

  const syncQty = (newQty) => {

    if (isGuest) {

      const guestCart = getGuestCart();

      const updated = guestCart.map((g) =>
        g.product_id === item.id
          ? { ...g, quantity: newQty }
          : g
      );

      localStorage.setItem("guest_cart", JSON.stringify(updated));

      /* notify other components */
      window.dispatchEvent(new Event("guestCartUpdated"));

      setCart((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: newQty }
            : p
        )
      );

      return;
    }

    /* =========================
       DB CART
    ========================= */

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSaving(true);

      const fd = new FormData();
      fd.append("cartId", item.id);
      fd.append("quantity", newQty);

      await updateCartQty(null, fd);

      setIsSaving(false);
    }, 400);
  };

  const increase = () => {
    const v = qty + 1;
    setQty(v);
    syncQty(v);
  };

  const decrease = () => {
    if (qty <= 1) return;
    const v = qty - 1;
    setQty(v);
    syncQty(v);
  };

  /* =========================
     DELETE ITEM
  ========================= */

  const removeItem = async () => {

    if (isGuest) {

      const guestCart = getGuestCart();

      const filtered = guestCart.filter(
        (g) => g.product_id !== item.id
      );

      localStorage.setItem(
        "guest_cart",
        JSON.stringify(filtered)
      );

      window.dispatchEvent(new Event("guestCartUpdated"));

      setCart((prev) =>
        prev.filter((p) => p.id !== item.id)
      );

      return;
    }

    /* DB DELETE */

    setIsDeleting(true);

    const fd = new FormData();
    fd.append("cartId", item.id);

    await deleteCartItem(null, fd);
  };

  return (
    <div className="relative  flex gap-3 md:gap-4 sm:gap-6 rounded-xl bg-white border border-gray-200 p-2 sm:p-5 hover:border-cyan-500/40 transition">

      {/* IMAGE */}
      <Link
        href={`/product/${product.slug}`}
        className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0"
      >
     <img
  src={product.images?.[0]?.image_url || "/images/not-found.png"}
  alt={product.name}
  className="w-full h-full object-cover rounded-lg"
/>
      </Link>

      {/* INFO */}
      <div className="flex flex-col flex-1 min-w-0">

        <Link
          href={`/product/${product.slug}`}
          className="text-sm sm:text-base font-semibold text-black hover:text-[#347eb3] transition truncate"  >
          {product.name}
        </Link>


        <div className="mt-3 flex items-center gap-3">

          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">

            <button
              onClick={decrease}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              −
            </button>

            <span className="px-4 text-sm text-black">
              {qty}
            </span>

            <button
              onClick={increase}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>

          </div>

          {(isSaving || isDeleting) && <Spinner />}

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col items-end justify-between">

        <button
          onClick={removeItem}
          className="text-gray-500 hover:text-red-500 transition"
        >
          <TrashIcon className="h-5 w-5" />
        </button>

        <p className="text-base sm:text-lg font-semibold text-white">
          ₹{price * qty}
        </p>

      </div>

      {isDeleting && (
        <div className="absolute inset-0 bg-black/40 rounded-xl" />
      )}
      
    </div>
  );
}