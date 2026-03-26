"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, useCallback } from "react";
import ScrollReveal from "scrollreveal";
import { addToCartAction, deleteCartItem } from "./action";
import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";

export default function ProductGrid({ products, customerId }) {
  const { showToast } = useToast();
  const { reloadCart, cartItems } = useCart();

  const [isPending, startTransition] = useTransition();
  const [loadingProductId, setLoadingProductId] = useState(null);

  useEffect(() => {
    ScrollReveal().reveal(".sr-image", {
      opacity: 0,
      duration: 400,
      easing: "ease-out",
      reset: false,
    });
  }, []);

  const getCartQty = useCallback(
    (productId) => {
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        const item = cartItems.find(
          (i) => i.product_list_id === productId
        );
        return item?.quantity || 0;
      }

      if (typeof window === "undefined") return 0;

      const guestCart =
        JSON.parse(localStorage.getItem("guest_cart")) || {};

      return guestCart[productId]?.quantity || 0;
    },
    [cartItems]
  );

  const handleAddToCart = (product) => {
    const step = Number(product.stepper_value ?? 1);
    setLoadingProductId(product.id);

    startTransition(async () => {
      const payload = { [product.id]: step };
      const res = await addToCartAction({
        customerId,
        quantities: payload,
      });

      if (res?.success) {
        reloadCart();
        showToast({
          type: "success",
          message: "Product added to cart",
        });
        setLoadingProductId(null);
        return;
      }

      if (res?.message === "Customer not found") {
        if (typeof window !== "undefined") {
          const existingCart =
            JSON.parse(localStorage.getItem("guest_cart")) || {};

          const updatedCart = { ...existingCart };

          if (updatedCart[product.id]) {
            updatedCart[product.id].quantity += step;
          } else {
            updatedCart[product.id] = {
              product_id: product.id,
              product_list_id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              stepper_value: product.stepper_value,
              quantity: step,
            };
          }

          localStorage.setItem(
            "guest_cart",
            JSON.stringify(updatedCart)
          );
        }

        reloadCart();
        showToast({
          type: "success",
          message: "Saved to cart.",
        });
        setLoadingProductId(null);
        return;
      }

      showToast({
        type: "error",
        message: res?.message || "Something went wrong",
      });

      setLoadingProductId(null);
    });
  };

  const handleRemoveFromCart = (product) => {
    const cartItem = cartItems?.find(
      (i) => i.product_list_id === product.id
    );
    if (!cartItem) return;

    startTransition(async () => {
      if (customerId) {
        const fd = new FormData();
        fd.append("cartId", cartItem.id);
        await deleteCartItem(null, fd);
      } else {
        const cart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};
        delete cart[product.id];
        localStorage.setItem(
          "guest_cart",
          JSON.stringify(cart)
        );
      }

      reloadCart();
    });
  };

  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">

      {products.map((product) => {
        const qty = getCartQty(product.id);
        const isThisLoading =
          isPending && loadingProductId === product.id;

        return (
          <div
            key={product.id}
            className="
              group flex flex-col overflow-hidden
              rounded-xl
              border border-gray-200
              bg-white
              shadow-sm
              transition-all duration-300
              hover:border-[#347eb3]
              hover:shadow-md
            "
          >

            {/* IMAGE */}
            <Link href={`/product/${product.slug}`}>
              <div className="sr-image relative aspect-square w-full bg-gray-50">

                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="
                    w-full h-full
                    object-cover
                    transition-transform duration-500
                    group-hover:scale-105
                  "
                />

              </div>
            </Link>

            {/* CONTENT */}
            <div className="flex flex-1 flex-col gap-2 p-4">

              <Link href={`/product/${product.slug}`}>
                <p
                  className="
                    line-clamp-2 text-sm font-medium
                    text-black
                    group-hover:text-[#347eb3]
                    transition
                  "
                >
                  {product.name}
                </p>
              </Link>

              {/* PRICE */}
              <div className="flex mt-auto items-center justify-between">

              

                {qty > 0 && (
                  <span
                    className="
                      rounded-md
                      bg-[#347eb3]/10
                      px-2 py-0.5
                      text-xs font-medium
                      text-[#347eb3]
                      border border-[#347eb3]/30
                    "
                  >
                    Qty {qty}
                  </span>
                )}

              </div>

              {/* BUTTONS */}
              <div className="mt-3 flex flex-col gap-2">

                {qty > 0 && (
                  <button
                    onClick={() =>
                      handleRemoveFromCart(product)
                    }
                    className="
                      w-full py-2 text-sm font-medium
                      rounded-lg
                      border border-red-300
                      text-red-600
                      hover:bg-red-50
                      transition
                    "
                  >
                    Remove
                  </button>
                )}

                <button
                  disabled={isThisLoading}
                  onClick={() =>
                    handleAddToCart(product)
                  }
                  className={`
                    w-full py-2 text-sm font-semibold
                    rounded-lg
                    transition
                    disabled:opacity-60

                    ${
                      qty > 0
                        ? `
                          border border-[#347eb3]/40
                          text-[#347eb3]
                          hover:bg-[#347eb3]/10
                        `
                        : `
                          bg-[#347eb3]
                          text-white
                          hover:bg-[#0284c7]
                        `
                    }
                  `}
                >
                  {isThisLoading
                    ? "Adding…"
                    : qty > 0
                    ? "Add More"
                    : "Add to Cart"}
                </button>

              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
}