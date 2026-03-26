// UI/Checkout/GuestCartClient.jsx
"use client";

import { useEffect, useState } from "react";
import MyCart from "./Checkout";
import CheckoutTotal from "./CheckoutTotal";
import CheckoutLogin from "./CheckoutLogin";

export default function GuestCartClient() {
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("guest_cart");
    if (!raw) return;

    const parsed = JSON.parse(raw);

    // convert object → array
    const formatted = Object.values(parsed).map((item) => ({
      id: item.product_id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        images: item.image ? [{ url: item.image }] : [],
      },
    }));

    setCartData(formatted);
  }, []);

  if (!cartData.length) {
    return <p className="text-gray-500">Your cart is empty</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
          <CheckoutLogin />
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
          <MyCart cartData={cartData} />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
          <CheckoutTotal cartData={cartData} />
        </div>
      </div>
    </div>
  );

}
