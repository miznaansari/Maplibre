"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDbCart,
  applyGuestCart,
  resolveCart,
} from "./action";
import { useCart } from "@/app/context/CartContext";

/* ----------------------------------------
   Helpers
---------------------------------------- */
const getGuestCartItems = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("guest_cart") || "{}");
    return Object.values(cart);
  } catch {
    return [];
  }
};

export default function CheckCartPage() {
  const router = useRouter();
  const {reloadCart} = useCart();

  const [loading, setLoading] = useState(true);
  const [guestItems, setGuestItems] = useState([]);
  const [dbItems, setDbItems] = useState([]);

  useEffect(() => {
    async function init() {
      const guest = getGuestCartItems();
      setGuestItems(guest);

      if (guest.length === 0) {
        router.replace("/");
        return;
      }

      const dbCart = await getDbCart();
      setDbItems(dbCart);

      /* Case 1: Guest only */
      if (guest.length > 0 && dbCart.length === 0) {
        await applyGuestCart(guest);
        localStorage.removeItem("guest_cart");
        reloadCart();
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    init();
  }, [router]);

  const handleAction = async (type) => {
    setLoading(true);
    await resolveCart(type, guestItems);
    localStorage.removeItem("guest_cart");
    reloadCart();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Resolving cart…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Resolve Your Cart
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Choose how you want to keep your items.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <CartBox title="Guest Cart" items={guestItems} />
        <CartBox title="Account Cart" items={dbItems} />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <ActionButton
          label="Merge Both"
          desc="Combine quantities"
          primary
          onClick={() => handleAction("merge")}
        />
        <ActionButton
          label="Use Account Cart"
          desc="This will discard current items,"
          onClick={() => handleAction("db")}
        />
        <ActionButton
          label="Use Current Cart"
          desc="Discard account items"
          danger
          onClick={() => handleAction("guest")}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------
   UI Components
---------------------------------------- */

function CartBox({ title, items }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="font-semibold mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li
              key={i.product_id || i.product_list_id}
              className="flex justify-between bg-gray-50 px-3 py-2 rounded text-sm"
            >
              <span>{i.name || i.product?.name}</span>
              <span className="font-medium">
                Qty: {i.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionButton({ label, desc, onClick, primary, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-left transition
        ${
          primary
            ? "bg-green-500 text-white hover:bg-green-600"
            : danger
            ? "bg-[#00AEEF] text-white hover:bg-blue-500"
            : "bg-[#00AEEF] text-white hover:bg-blue-500"
        }`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-xs opacity-80">{desc}</div>
    </button>
  );
}
