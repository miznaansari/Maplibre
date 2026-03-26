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
  console.log('cartItems', cartItems)

  const [isPending, startTransition] = useTransition();
  const [loadingProductId, setLoadingProductId] = useState(null);

  /* =========================
     IMAGE FADE-IN
  ========================= */
  useEffect(() => {
    ScrollReveal().reveal(".sr-image", {
      opacity: 0,
      duration: 400,
      easing: "ease-out",
      interval: 0,
      reset: false,
      cleanup: false,
    });
  }, []);

  /* =========================
     GET CART QTY (SAFE)
  ========================= */
  const getCartQty = useCallback(
    (productId) => {
      // LOGGED-IN CART (ARRAY)
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        const item = cartItems.find(
          (i) => i.product_list_id === productId
          // OR: i.product?.id === productId
        );

        return item?.quantity || 0;
      }

      // GUEST CART
      if (typeof window === "undefined") return 0;

      const guestCart =
        JSON.parse(localStorage.getItem("guest_cart")) || {};

      return guestCart[productId]?.quantity || 0;
    },
    [cartItems]
  );


  /* =========================
     ADD TO CART
  ========================= */
  const handleAddToCart = (product) => {
    setLoadingProductId(product.id);

    startTransition(async () => {
      const payload = {
        [product.id]: 1,
      };

      const res = await addToCartAction({
        customerId,
        quantities: payload,
      });

      /* LOGGED-IN USER */
      if (res?.success) {
        reloadCart();
        showToast({
          type: "success",
          message: "Product added to cart",
        });
        setLoadingProductId(null);
        return;
      }

      /* GUEST USER */
      if (res?.message === "Customer not found") {
        if (typeof window !== "undefined") {
          const existingCart =
            JSON.parse(localStorage.getItem("guest_cart")) || {};

          const updatedCart = { ...existingCart };

          if (updatedCart[product.id]) {
            updatedCart[product.id].quantity += 1;
          } else {
            updatedCart[product.id] = {
              product_id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1,
            };
          }

          localStorage.setItem(
            "guest_cart",
            JSON.stringify(updatedCart)
          );
        }

        reloadCart();
        showToast({
          type: "info",
          message: "Saved to cart. Login to continue",
        });
        setLoadingProductId(null);
        return;
      }

      /* ERROR */
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
        localStorage.setItem("guest_cart", JSON.stringify(cart));
      }

      reloadCart();
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {products.map((product) => {
        const qty = getCartQty(product.id);
        const isThisLoading =
          isPending && loadingProductId === product.id;

        return (
          <div
            key={product.id}
            className="
          flex flex-col overflow-hidden rounded-md
          border border-gray-200 bg-white
        "
          >
            {/* IMAGE */}
            <Link href={`/product/${product.slug}`}>
              <div className="relative aspect-square w-full bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  loading="lazy"
                  className="object-contain p-3"
                />
              </div>
            </Link>

            {/* CONTENT */}
            <div className="flex flex-1 flex-col gap-2 p-3">
              {/* NAME */}
              <Link href={`/product/${product.slug}`}>
                <p className="line-clamp-2 text-sm font-medium text-gray-900">
                  {product.name}
                </p>
              </Link>

              {/* META */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  ${product.price}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    ex. GST
                  </span>
                </p>

                {qty > 0 && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Qty {qty}
                  </span>
                )}
              </div>
           <div className="mt-auto flex gap-3">

                    {qty > 0 && (
                <button
                  onClick={() => handleRemoveFromCart(product)}
                  className="flex items-center justify-center w-full gap-2 rounded border border-red-200 text-red-600 py-2 text-sm font-medium hover:bg-red-50 transition"
                >
                  <Image
                    src="/images/page/checkout/delete.svg"
                    alt="Remove"
                    width={14}
                    height={14}
                  />
                  Remove item
                </button>
                )}


                {/* ACTION */}
                <button
                  disabled={isThisLoading}
                  onClick={() => handleAddToCart(product)}
                  className={`
              mt-auto h-9 w-full rounded-md
              border text-sm font-medium
              transition
              disabled:opacity-60
              ${qty > 0
                      ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-gray-300 bg-[#347eb3] text-white hover:bg-[#0095cc]"
                    }
            `}
                >
                  {isThisLoading
                    ? "Adding…"
                    : qty > 0
                      ? "Add More"
                      : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>



  );
}
