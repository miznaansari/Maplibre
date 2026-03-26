"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { TagIcon } from "@heroicons/react/24/outline";

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

export default function CartTotal({ cartData = [], isGuest = false }) {

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [cart, setCart] = useState(cartData);

  /* =========================
     LOAD GUEST CART
  ========================= */

  useEffect(() => {

    if (!isGuest) return;

    const loadCart = () => {

      const guestCart = getGuestCart();

      const formatted = guestCart.map((item) => ({
        quantity: item.quantity,
        finalPrice: item.price,
        product: {
          regular_price: item.price,
        },
      }));

      setCart(formatted);
    };

    loadCart();

    window.addEventListener("guestCartUpdated", loadCart);

    return () => {
      window.removeEventListener("guestCartUpdated", loadCart);
    };

  }, [isGuest]);

  /* =========================
     CALCULATIONS
  ========================= */

  const { subTotal, totalPrice } = useMemo(() => {

    const subTotal = cart.reduce((sum, item) => {

      const price =
        item.finalPrice ?? item.product?.regular_price ?? 0;

      const qty = item.quantity || 1;

      return sum + price * qty;

    }, 0);

    const totalPrice = subTotal - discount;

    return { subTotal, totalPrice };

  }, [cart, discount]);

  /* =========================
     APPLY COUPON
  ========================= */

  const applyCoupon = async () => {

    if (!coupon) return;

    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: coupon }),
    });

    const data = await res.json();

    if (data?.discount) {
      setDiscount(data.discount);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">

      <h2 className="text-xl font-semibold tracking-wider text-white mb-6">
        ORDER SUMMARY
      </h2>

      {/* COUPON */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-2 tracking-wide">
          COUPON CODE
        </p>

        <div className="flex gap-2">

          <div className="flex items-center gap-2 flex-1 rounded-lg border border-white/10 bg-black px-3">
            <TagIcon className="h-4 w-4 text-gray-500" />

            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="VOD10"
              className="w-full bg-transparent py-2 text-sm text-white outline-none"
            />
          </div>

          <button
            onClick={applyCoupon}
            className="rounded-lg bg-cyan-500 px-4 text-sm font-medium text-black hover:bg-cyan-400 transition"
          >
            APPLY
          </button>

        </div>
      </div>

      {/* SUBTOTAL */}
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Subtotal ({cart.length} items)</span>
        <span>₹{subTotal.toFixed(0)}</span>
      </div>

      {/* SHIPPING */}
      <div className="flex justify-between text-sm mb-4">
        <span className="text-gray-400">Shipping</span>
        <span className="text-green-400 font-medium">FREE</span>
      </div>

      <hr className="border-white/10 mb-4" />

      {/* TOTAL */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-white text-lg font-semibold tracking-wide">
          TOTAL
        </span>

        <span className="text-cyan-400 text-xl font-bold">
          ₹{totalPrice.toFixed(0)}
        </span>
      </div>

      {/* CHECKOUT */}
      <Link
        href="/checkout"
        className="flex w-full items-center justify-center rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-black hover:bg-cyan-300 transition shadow-[0_0_20px_rgba(34,211,238,0.5)]"
      >
        PROCEED TO CHECKOUT
      </Link>

      <p className="text-center text-xs text-gray-500 mt-3">
        Secure checkout · COD available
      </p>

    </div>
  );
}