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
export default function MyCart({ cartData }) {
  console.log('cartDatacartData', cartData)
  if (!cartData || cartData.length === 0) {
    return (
      <p className="font-poppins text-gray-500">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="rounded md:border border-gray-200 md:bg-white md:shadow-sm font-poppins">


      {/* TABLE HEADER */}
      {/* TABLE HEADER (DESKTOP ONLY) */}
      <div className="hidden md:grid grid-cols-12 bg-[#F6F6F6] px-4 py-3 text-xs font-semibold uppercase text-gray-600">
        <div className="col-span-2">Code</div>
        <div className="col-span-5">Product Name</div>
        <div className="col-span-1 text-center">Unit</div>
        <div className="col-span-2">Unit Price</div>
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
      <div className="md:hidden  ">
        <div className="relative rounded border border-gray-200 bg-white shadow-sm p-4 space-y-4">
          {/* Top */}
          <div className="flex gap-3">
            <div className="relative h-16 w-16 rounded-lg border bg-white overflow-hidden">
            <img
  src={product?.images?.[0]?.image_url || "/images/not-found.png"}
  alt={product?.name}
  className="object-contain w-full h-full"
/>

            </div>


            <div className="flex-1">
              <p className="text-[#4A4A4A] font-normal leading-tight">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">
                {product.short_description}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                SKU: {product.sku} • Unit: {product.measure_unit || 'not defined'}
              </p>
            </div>
          </div>

          {/* Price + Qty */}
          <div className="flex items-center justify-between">
            {/* QTY x PRICE */}
            <div className="text-sm text-gray-600 flex justify-between  pt-3">
              <span>
                <input
  type="number"
  min={stepper || 1}
  step={stepper || 1}
  value={qty}
  onChange={handleQtyChange}
  onBlur={handleBlur}
  className="w-16 mr-2 rounded border border-blue-500 text-center text-base text-blue-600 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
/>

                X  ${price.toFixed(2)}
              </span>


            </div>
{error && (
  <p className="mt-1 text-xs text-red-500">
    {error}
  </p>
)}

            <div className="relative">
              <span className="font-semibold text-gray-900">
                ${total.toFixed(2)}
              </span>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          {/* Remove */}
          <button
            onClick={removeItem}
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
        </div>
      </div>

      {/* ================= DESKTOP ROW (UNCHANGED) ================= */}
      <div
        className={`hidden md:grid grid-cols-12 px-4 py-4 items-center border-b border-gray-200 text-sm
          ${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F3F8FB]"}
        `}
      >
        <div className="col-span-2 font-semibold  text-[#181818]">{product.sku}</div>

        <div className="col-span-5 flex items-center gap-3 min-w-0">
          {/* Image — NEVER shrink */}
          <div className="relative w-10 aspect-square shrink-0 rounded border border-gray-200 bg-white overflow-hidden">
           <img
  src={product?.images?.[0]?.image_url || "/images/not-found.png"}
  alt={product?.name || "Product Image"}
  className="w-full h-full object-cover"
/>
          </div>

          {/* Text — constrained */}
          <div className="min-w-0">
            <p className="text-[#4A4A4A] font-normal leading-tight truncate">
              {product.name}
            </p>

            <p className="text-xs text-gray-500 truncate">
              {product.short_description}
            </p>
          </div>
        </div>



        <div className="col-span-1 text-center ">{product.measure_unit || '-'}</div>

        <div className="col-span-2 font-semibold text-gray-900">
          ${price.toFixed(2)}
        </div>

        <div className="col-span-1 flex justify-center relative">
<div className="col-span-1 flex flex-col items-center relative">
  <input
    type="number"
    min={stepper || 1}
    step={stepper || 1}
    value={qty}
    onChange={handleQtyChange}
    onBlur={handleBlur}
    className={`w-14 rounded border border-[rgb(var(--inputField))] text-center text-sm py-1 bg-white focus:outline-none 
      ${error
        ? "border-red-500 text-red-600 focus:ring-red-400"
        : "  focus:border-[rgb(var(--inputFieldFocusBorder))] "
      }
    `}
  />

  {error && (
    <span className="mt-1 text-[11px] text-red-500 text-center">
      {error}
    </span>
  )}

  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
      <Spinner />
    </div>
  )}
</div>


          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
              <Spinner />
            </div>
          )}
        </div>

        <div className="col-span-1 flex justify-center">
          <button
            onClick={removeItem}
            className="rounded-full p-2 hover:bg-red-100 transition"
          >
            <Image
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
