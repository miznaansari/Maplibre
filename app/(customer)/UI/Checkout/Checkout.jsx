"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { updateCartQty, deleteCartItem } from "./actions";

/* =========================
   SPINNER
========================= */
function Spinner() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
  );
}

/* =========================
   MAIN CART
========================= */
export default function Checkout({ cartData }) {
  console.log('cartDatacartData', cartData)
  if (!cartData || cartData.length === 0) {
    return (
      <p className="font-poppins text-gray-500">
        Your cart is empty.
      </p>
    );
  }
  return (
    <div className="rounded-xl md:border border-white/10 md:bg-[#1a1a1a] md:shadow-lg font-poppins">
      {/* TABLE HEADER (DESKTOP ONLY) */}
      <div className="hidden md:grid grid-cols-12 bg-[#111827] px-4 py-3 text-xs font-semibold uppercase text-gray-400 border-b border-white/10">
        <div className="col-span-2">Code</div>
        <div className="col-span-5">Product Name</div>
        <div className="col-span-1 text-center">Size</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-1 text-center">QTY</div>
        <div className="col-span-1 text-center">Remove</div>
      </div>

      {/* ROWS */}
      {cartData.map((item, index) => (
        <CartRow key={item.id} item={item} index={index} />
      ))}
    </div>
  );

}

/* =========================
   CART ROW
========================= */
function CartRow({ item, index }) {
  const product = item.product;
  const price = product.price ?? product.sale_price ?? 0;

  const stepper = Number(product?.stepper_value) || null;

  const [qty, setQty] = useState(String(item.quantity || 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ NEW
  const debounceRef = useRef(null);

  const isValidQty = (value) => {
    if (value < 1) return false;
    if (!stepper) return true;
    return value % stepper === 0;
  };

  /* =========================
     SYNC TO DB (DEBOUNCED)
  ========================= */
  const syncQtyToDB = (value) => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!isValidQty(value)) return; // ❌ block DB call

      setLoading(true);
      const fd = new FormData();
      fd.append("cartId", item.id);
      fd.append("quantity", value);
      await updateCartQty(null, fd);
      setLoading(false);
    }, 400);
  };


  /* =========================
     INPUT CHANGE
  ========================= */
  const handleQtyChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value === "") {
      setQty("");
      setError("");
      return;
    }

    value = Number(value);
    setQty(String(value));

    if (!isValidQty(value)) {
      setError(
        stepper
          ? `Quantity must be a multiple of ${stepper}`
          : ""
      );
      return;
    }

    setError("");
    syncQtyToDB(value);
  };


  /* =========================
     BLUR FIX (AUTO ROUND)
  ========================= */
  const handleBlur = () => {
    const value = Number(qty);

    if (!value || value < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (!isValidQty(value)) {
      setError(
        stepper
          ? `Quantity must be a multiple of ${stepper}`
          : ""
      );
      return;
    }

    setError("");
    syncQtyToDB(value);
  };


  const removeItem = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("cartId", item.id);
    await deleteCartItem(null, fd);
  };

  const total = Number(qty || 0) * price;
  return (
    <>
      {/* ================= MOBILE CARD ================= */}
      <div className="md:hidden">
        <div className="relative rounded-xl border border-white/10 bg-[#1a1a1a] shadow-lg p-4 space-y-4">
          {/* Top */}
          <div className="flex gap-3">
            <div className="relative h-16 w-16 rounded-lg border border-white/10 bg-[#0f0f0f] overflow-hidden">
              <img
                src={product?.images?.[0]?.image_url || "/images/not-found.png"}
                alt={product?.name}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-200 leading-tight">
                {product.name}
              </p>
              <p className="text-xs text-gray-400">
                {product.short_description}
              </p>
              <p className="mt-1 text-md text-gray-500">
                SKU: {product.sku} • Size: {product.size || "not defined"}
              </p>
            </div>
          </div>

          {/* Price + Qty */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300 flex justify-between pt-3">
              <span>
                <input
                  type="number"
                  min={stepper || 1}
                  step={stepper || 1}
                  value={qty}
                  onChange={handleQtyChange}
                  onBlur={handleBlur}
                  className="w-16 mr-2 rounded border border-white/10 text-center text-base text-white py-1 bg-[#0f0f0f] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                />
                X ₹{price.toFixed(2)}
              </span>
            </div>

            <div className="relative">
              <span className="font-semibold text-[#38bdf8]">
                ₹{total.toFixed(2)}
              </span>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          {/* Remove */}
          <button
            onClick={removeItem}
            className="flex items-center justify-center w-full gap-2 rounded border border-white/10 text-red-400 py-2 text-sm font-medium hover:bg-red-500/10 transition"
          >
          <img
  src="/images/page/checkout/delete.svg"
  alt="Remove"
  width={14}
  height={14}
/>
            Remove item
          </button>
        </div>
      </div>

      {/* ================= DESKTOP ROW ================= */}
      <div
        className={`hidden md:grid grid-cols-12 px-4 py-4 items-center border-b border-white/10 text-sm
        ${index % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#111827]"}
      `}
      >
        <div className="col-span-2 text-gray-400">{product.sku}</div>

        <div className="col-span-5 flex items-center gap-3 min-w-0">
          <div className="relative w-10 aspect-square shrink-0 rounded border border-white/10 bg-[#1a1a1a] overflow-hidden">
            <img
              src={product?.images?.[0]?.image_url || "/images/not-found.png"}
              alt={product?.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-medium text-gray-200 leading-tight truncate">
              {product.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {product.short_description}
            </p>
          </div>
        </div>

        <div className="col-span-1 text-center text-gray-500">{product.size || "not defined"}</div>

        <div className="col-span-2 font-semibold text-gray-200">
          ₹{price.toFixed(2)}
        </div>

        <div className="col-span-1 flex justify-center relative">
          <div className="flex flex-col items-center relative">
            <input
              type="number"
              min={stepper || 1}
              step={stepper || 1}
              value={qty}
              onChange={handleQtyChange}
              onBlur={handleBlur}
              className={`w-14 rounded border text-center text-sm py-1 bg-[#0f0f0f] text-white focus:outline-none focus:ring-1
              ${error
                  ? "border-red-500 focus:ring-red-400"
                  : "border-white/10 focus:ring-[#38bdf8]"
                }
            `}
            />

            {error && (
              <span className="mt-1 text-[11px] text-red-400 text-center">
                {error}
              </span>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 flex justify-center">
          <button
            onClick={removeItem}
            className="rounded-full p-2 hover:bg-red-500/10 transition"
          >
            <img
              src="/images/page/checkout/delete.svg"
              alt="Remove"
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>
    </>
  );

}
