"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useState } from "react";

import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

import { useToast } from "@/app/admin/context/ToastProvider";

export default function ProductCard({ product }) {
  const { showToast } = useToast();
  const { reloadCart, cartItems } = useCart();

  const [loading, setLoading] = useState(false);

  // check if product already exists in cart
  const isInCart = cartItems?.some(
    (item) => item.product_list_id === product.id && !item.is_deleted
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error();

      showToast({
        type: "success",
        message: "Product added to cart",
      });

      reloadCart();
    } finally {
      setLoading(false);
    }
  };

  const badge = product.badge || "NEW";

  const badgeColors = {
    HOT: "bg-red-500 text-white",
    NEW: "bg-green-400 text-black",
    BESTSELLER: "bg-[#347eb3] text-white",
    LIMITED: "bg-yellow-400 text-black",
  };

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition">

      {/* IMAGE */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative">

          <img
            src={product.image || "/images/not-found.png"}
            className="w-full aspect-square object-cover"
            alt={product.name}
          />

          {/* BADGE */}
          <span
            className={`absolute top-3 left-3 text-xs px-2 py-1 rounded font-semibold ${badgeColors[badge]}`}
          >
            {badge}
          </span>

          {/* WISHLIST */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 bg-white shadow p-1.5 rounded-full"
          >
            <HeartIcon className="w-4 h-4 text-gray-700" />
          </button>

        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-3 space-y-1">

        <p className="text-[10px] uppercase text-[#347eb3]">
          {product.category || "ACCESSORIES"}
        </p>

        <h3 className="text-sm font-semibold text-black line-clamp-1">
          {product.name}
        </h3>

        <p className="text-gray-500 text-sm font-semibold line-clamp-1">
          {product.description}
        </p>

        {/* RATING */}
        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="w-3 h-3" />
          ))}

          <span className="text-xs text-gray-500 ml-1">
            ({product.reviews || 0})
          </span>
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-black font-semibold">
            ₹{product.price}
          </span>

          {product.regular_price && (
            <span className="text-xs text-gray-500 line-through">
              ₹{product.regular_price}
            </span>
          )}
        </div>

      </div>

      {/* ADD TO CART BUTTON */}

      {isInCart ? (
        <Link
          href="/cart"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 w-full py-2 bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          View Cart
        </Link>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-2 bg-[#347eb3] text-white text-sm font-semibold hover:bg-[#2c6a97] transition disabled:bg-gray-300"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      )}

    </div>
  );
}