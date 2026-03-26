"use client";

import { useState, useMemo } from "react";
import { addToCartDB, deleteCartItem } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";
import RelatedProduct from "./RelatedProduct";

import {
  StarIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";

import ProductInfoTabs from "./ProductInfoTabs";
import ServiceHighlights from "@/app/(customer)/customer/components/home/ServiceHighlights";
  import { useRouter } from "next/navigation";

export default function ProductDetailClient({
  product,
  isLoggedIn,
  relatedProducts,
}) {

const router = useRouter();
  const { showToast } = useToast();
  const { cartItems, reloadCart } = useCart();

  const price = product.price ?? product.regular_price;
  const originalPrice = price + 200;

  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(product.mainImage?.[0]);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );

  const cartItem = useMemo(() => {
    if (isLoggedIn) {
      return cartItems?.find(
        (item) =>
          item.product_list_id === product.id &&
          item.is_deleted === false
      );
    } else {
      const guestCart =
        JSON.parse(localStorage.getItem("guest_cart")) || {};
      return guestCart[product.id] || null;
    }
  }, [cartItems, product.id, isLoggedIn]);
const handleAddToCart = async () => {
  if (isAdding) return;
  setIsAdding(true);

  try {
    // ❗ If not logged in → redirect to login
    if (!isLoggedIn) {
      showToast({ type: "info", message: "Please login to add to cart" });
      router.push(`/auth/login?redirect=${encodeURIComponent(`/product/${product.slug}`)}`);
      return;
    }

    // Logged in → add to DB cart
    await addToCartDB({
      productId: product.id,
      variantId: selectedVariant?.id,
      qty,
    });

    await reloadCart();

    showToast({ type: "success", message: "Added to Cart" });

  } catch {
    showToast({ type: "error", message: "Something went wrong" });
  } finally {
    setIsAdding(false);
  }
};
  const handleRemove = async () => {
    try {
      if (isLoggedIn && cartItem) {
        await deleteCartItem({ cartItemId: cartItem.id });
        await reloadCart();
      } else {
        const existingCart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};
        delete existingCart[product.id];
        localStorage.setItem("guest_cart", JSON.stringify(existingCart));
      }

      showToast({ type: "success", message: "Removed" });
    } catch {
      showToast({ type: "error", message: "Failed" });
    }
  };

  return (
    <section className="bg-white text-black min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* IMAGE SECTION */}
          <div className="flex justify-evenly flex-wrap-reverse gap-6">

            {/* THUMBNAILS */}
            <div className="flex flex-row md:flex-col gap-3 mt-4">
              {product.mainImage?.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 object-cover rounded-md cursor-pointer border
                  ${
                    activeImage?.url === img.url
                      ? "border-[#347eb3]"
                      : "border-gray-200 hover:border-[#347eb3]"
                  }`}
                />
              ))}
            </div>

            {/* MAIN IMAGE */}
            <div className="relative">

              <span className="absolute top-4 left-4 z-10 bg-red-500 text-xs px-3 py-1 rounded-full font-semibold text-white">
                HOT
              </span>

              <img
                src={activeImage?.url}
                className="w-full h-[500px] rounded-xl object-contain border border-gray-200"
              />
            </div>

          </div>

          {/* RIGHT DETAILS */}
          <div className="space-y-6">

            <div>

              <p className="text-green-600 text-xs uppercase tracking-wider">
                Premium Accessory
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                {product.name}
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {product.description}
              </p>

              {/* rating */}
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">

                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4" />
                  ))}
                </div>

                <span className="text-[#347eb3] font-semibold">4.8</span>
                <span>(234 reviews)</span>

              </div>

            </div>

            {/* PRICE */}
            <div className="flex items-center gap-4">

              <span className="text-3xl font-bold">
                ₹{price}
              </span>

              {/* <span className="line-through text-gray-500">
                ₹{originalPrice}
              </span> */}

              {/* <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded">
                32% OFF
              </span> */}

            </div>

            <div className="text-sm text-gray-500">
              {product.views} views
            </div>

           

            {/* QTY */}
            <div className="flex items-center gap-3">

              <p className="text-sm text-gray-500">
                QTY:
              </p>

              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">

                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>

                <span className="px-4">{qty}</span>

                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-2">

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 h-12 rounded-lg border border-[#347eb3] text-[#347eb3] hover:bg-[#347eb3] hover:text-white transition font-semibold"
              >
                {isAdding ? "Adding..." : "Add To Cart"}
              </button>

            </div>

            {/* share */}
            <p className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-black transition">
              <ShareIcon className="w-4 h-4" />
              Share this product
            </p>

          </div>

        </div>

      </div>

      {/* <ProductInfoTabs /> */}
      <ServiceHighlights />
      <RelatedProduct relatedProducts={relatedProducts} />

    </section>
  );
}