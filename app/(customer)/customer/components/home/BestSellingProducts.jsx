"use client";

import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";
import SwipeableDrawer from "@/app/admin/UI/common/SwipeableDrawer";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

import { XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function BestSellingProducts({ products }) {
  const { reloadCart, cartItems } = useCart();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getCartQty = useCallback(
    (productId) => {
      if (Array.isArray(cartItems)) {
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

  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.[0]?.id || null);
    setSelectedSize(product.variants?.[0]?.id || null);
    setQty(1);

    setTimeout(() => setShowModal(true), 10);
  };

  const closeModal = () => {
    setShowModal(false);

    setTimeout(() => {
      setSelectedProduct(null);
      setSelectedVariant(null);
      setQty(1);
    }, 250);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      showToast({ type: "error", message: "Select size first" });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          variantId: selectedVariant,
          quantity: qty,
        }),
      });

      if (!res.ok) throw new Error();

      reloadCart();
      showToast({ type: "success", message: "Added to Cart" });
      closeModal();
    } catch {
      showToast({ type: "error", message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const tagStyles = {
    HOT: "bg-red-500 text-white",
    BESTSELLER: "bg-[#347eb3] text-white",
    NEW: "bg-green-500 text-white",
    LIMITED: "bg-yellow-400 text-black",
  };

  const Content = () => (
    <div className="space-y-5 p-4">

      <div className="flex gap-3">
        <img
          src={selectedProduct?.images?.[0]?.image_url}
          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
        />

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-black">
            {selectedProduct?.name}
          </h3>

          <div className="text-yellow-400 text-xs">★★★★★</div>

          <div className="flex gap-2 mt-1">
            <span className="text-[#347eb3] font-semibold">
              ₹{selectedProduct?.price}
            </span>
          </div>
        </div>
      </div>

      {/* SIZE */}
      <div className="flex flex-wrap gap-2">
        {selectedProduct?.variants?.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setSelectedSize(v.id);
              setSelectedVariant(v.id);
            }}
            className={`px-4 py-2 rounded-lg text-sm border transition
              ${
                selectedSize === v.id
                  ? "bg-[#347eb3] text-white border-[#347eb3]"
                  : "border-gray-300 text-gray-600"
              }`}
          >
            {v.size}
          </button>
        ))}
      </div>

      {/* QTY */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setQty((p) => Math.max(1, p - 1))}
          className="w-9 h-9 bg-gray-200 rounded-lg text-black"
        >
          -
        </button>

        <span className="text-black">{qty}</span>

        <button
          onClick={() => setQty((p) => p + 1)}
          className="w-9 h-9 bg-gray-200 rounded-lg text-black"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!selectedSize || loading}
        className="w-full py-3 rounded-xl bg-[#347eb3] text-white font-semibold"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );

  const ProductCard = ({ product }) => {
    const qtyInCart = getCartQty(product.id);

    return (
      <div className="group rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-md transition">

        <div className="relative aspect-square overflow-hidden">

          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.images?.[0]?.image_url}
              fill
              className="object-cover md:group-hover:scale-105 transition"
              alt={product.name}
            />
          </Link>

          <span
            className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-md font-bold z-10 ${tagStyles["BESTSELLER"]}`}
          >
            BESTSELLER
          </span>

          <button
            onClick={() => openModal(product)}
            className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 
            bg-[#347eb3] text-white text-xs font-semibold px-4 py-2 rounded-full
            opacity-0 group-hover:opacity-100 transition"
          >
            ADD TO CART
          </button>
        </div>

        <div className="px-4 pb-4 flex flex-col gap-1">
          <span className="text-xs text-[#347eb3] uppercase">
            {product.category?.name || "ACCESSORIES"}
          </span>

          <h3 className="text-black text-sm font-semibold">
            {product.name}
          </h3>

          <div className="text-yellow-400 text-xs">
            ★★★★★ <span className="text-gray-500">(234)</span>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-black font-bold">
              ₹{product.price || product.regular_price}
            </span>

            {product.regular_price && (
              <span className="text-gray-500 text-xs line-through">
                ₹{product.regular_price}
              </span>
            )}
          </div>

          {qtyInCart > 0 && (
            <span className="text-xs text-[#347eb3] mt-1">
              In Cart: {qtyInCart}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="border-b hidden md:flex bg-white border-gray-200 py-12">

      <div className="max-w-7xl mx-auto px-4 ">

        <h2 className="text-center text-2xl font-bold text-black mb-10">
          NEW ARRIVALS
        </h2>

        <div className="md:hidden">
          <Swiper slidesPerView={1.2} spaceBetween={14} grabCursor>
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {isMobile && selectedProduct && (
        <SwipeableDrawer open={true} onClose={closeModal}>
          <Content />
        </SwipeableDrawer>
      )}

      {!isMobile && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200">

            <div className="flex justify-between p-4 border-b border-gray-200">
              <h2 className="text-black">{selectedProduct.name}</h2>

              <button onClick={closeModal}>
                <XMarkIcon className="w-5 h-5 text-black" />
              </button>
            </div>

            <Content />
          </div>
        </div>
      )}

    </section>
  );
}