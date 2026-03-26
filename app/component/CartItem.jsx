"use client";

import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTransition, useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { updateCartQty, deleteCartItem } from "./actions";
import { useToast } from "../admin/context/ToastProvider";

export default function CartItem({ item, isLoggedIn }) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const { reloadCart } = useCart();

  const stepper =
    Number(item.product?.stepper_value || item.stepper_value) || 1;

  const qty = Number(item.quantity);
  const price = Number(item.product?.price ?? item.price ?? 0);

  const [localQty, setLocalQty] = useState(qty);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalQty(qty);
  }, [qty]);

  const syncQtyToServer = (newQty) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (isLoggedIn) {
        const fd = new FormData();
        fd.append("cartId", item.id);
        fd.append("quantity", newQty);

        startTransition(async () => {
          const res = await updateCartQty(null, fd);
          if (res?.error) {
            showToast({ type: "error", message: res.error });
          }
          reloadCart();
        });
      } else {
        const cart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};
        if (!cart[item.product_id]) return;

        cart[item.product_id].quantity = newQty;
        localStorage.setItem("guest_cart", JSON.stringify(cart));
        reloadCart();
      }
    }, 400);
  };

  const increaseQty = () => {
    const newQty = localQty + stepper;
    setLocalQty(newQty);
    syncQtyToServer(newQty);
  };

  const decreaseQty = () => {
    const newQty = localQty - stepper;
    if (newQty < 1) return;
    setLocalQty(newQty);
    syncQtyToServer(newQty);
  };

  const removeItem = () => {
    if (isLoggedIn) {
      const fd = new FormData();
      fd.append("cartId", item.id);

      startTransition(async () => {
        await deleteCartItem(null, fd);
        reloadCart();
      });
    } else {
      const cart =
        JSON.parse(localStorage.getItem("guest_cart")) || {};
      delete cart[item.product_id];
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      reloadCart();
    }
  };

  return (
    <div
      className="
      group flex gap-4 p-4 rounded-2xl
      bg-white border border-gray-200
      hover:border-[#347eb3]/40
      hover:shadow-sm
      transition
    "
    >
      {/* IMAGE */}
      <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={
            item.image ||
            item.product?.images?.[0]?.image_url ||
            "/images/not-found.png"
          }
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 justify-between">

        {/* LEFT */}
        <div className="flex flex-col justify-between">

          <div>
            {/* NAME */}
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {item.name || item.product?.name}
            </p>

            {/* SIZE */}
            {item.variant?.size && (
              <p className="text-xs text-gray-500 mt-1">
                Size:{" "}
                <span className="text-gray-700">
                  {item.variant.size}
                </span>
              </p>
            )}
          </div>

      

        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end justify-between">

          {/* REMOVE */}
          <button
            onClick={removeItem}
            className="
            p-1 rounded-md
            text-gray-400
            hover:text-red-500
            hover:bg-red-50
            transition
          "
          >
            <TrashIcon className="h-4 w-4" />
          </button>

          {/* QTY */}
          <div
            className="
            flex items-center rounded-lg
            bg-gray-50 border border-gray-200
            overflow-hidden
          "
          >
            <button
              onClick={decreaseQty}
              className="px-2 py-1 hover:bg-gray-200 transition"
            >
              <MinusIcon className="w-4 h-4 text-gray-600" />
            </button>

            <span className="px-3 text-sm font-medium text-gray-900">
              {localQty}
            </span>

            <button
              onClick={increaseQty}
              className="px-2 py-1 hover:bg-gray-200 transition"
            >
              <PlusIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}