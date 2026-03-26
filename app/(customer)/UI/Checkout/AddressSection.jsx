"use client";

import { useEffect, useState } from "react";
import EditAddressModal from "./EditAddressModal";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function AddressSection({ addresses = [] }) {
  // console.log('adrasdafsfd', addresses)
  const [shippingId, setShippingId] = useState(null);
  const [billingId, setBillingId] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  /* =========================
     LOAD FROM localStorage OR PRIMARY
  ========================= */
  useEffect(() => {
    const s = localStorage.getItem("shipping_address_id");
    const b = localStorage.getItem("billing_address_id");

    if (s) {
      setShippingId(Number(s));
    } else {
      const primary = addresses.find(a => a.is_default);
      if (primary) {
        setShippingId(primary.id);
        localStorage.setItem("shipping_address_id", primary.id);
      }
    }

    if (b) {
      setBillingId(Number(b));
    }
  }, [addresses]);

  /* =========================
     SYNC BILLING WITH SHIPPING
  ========================= */
  useEffect(() => {
    if (sameAsShipping && shippingId) {
      setBillingId(shippingId);
      localStorage.setItem("billing_address_id", shippingId);
    }
  }, [sameAsShipping, shippingId]);

  const handleShippingChange = (id) => {
    setShippingId(id);
    localStorage.setItem("shipping_address_id", id);

    if (sameAsShipping) {
      setBillingId(id);
      localStorage.setItem("billing_address_id", id);
    }
  };

  const handleBillingChange = (id) => {
    setBillingId(id);
    localStorage.setItem("billing_address_id", id);
    setSameAsShipping(false);
  };

  const formatAddress = (a) =>
    `${a.address_1}, ${a.postal_code}, ${a.country}`;
return (
  <div className="bg-[#1a1a1a] border border-white/10  p-4 space-y-3 rounded-xl shadow-lg">
    {/* SHIPPING */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm w-full">
      <span className="text-gray-400 sm:w-16 shrink-0">Shipping:</span>

      <div className="relative w-full">
        <select
          value={shippingId ?? ""}
          onChange={(e) => handleShippingChange(Number(e.target.value))}
          className="
            w-full appearance-none bg-transparent border-none
            min-w-0 p-0 pr-5 cursor-pointer font-bold text-[14px]
            text-gray-200 focus:outline-none truncate
          "
        >
          <option value="">Select address</option>

          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {formatAddress(a)}
            </option>
          ))}
        </select>

        <ChevronDownIcon
          className="
            pointer-events-none absolute right-0 top-1/2 h-4 w-4
            -translate-y-1/2 text-gray-500
          "
        />
      </div>
    </div>

    {/* BILLING */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm w-full">
      <span className="text-gray-400 sm:w-16 shrink-0">Billing:</span>

      <div className="relative group w-full min-w-0">
        <div className="relative w-full">
          <select
            value={billingId ?? ""}
            onChange={(e) => handleBillingChange(Number(e.target.value))}
            disabled={sameAsShipping}
            className={`
              w-full appearance-none bg-transparent border-none
              min-w-0 p-0 pr-5 font-bold text-[14px]
              focus:outline-none truncate
              ${
                sameAsShipping
                  ? "cursor-not-allowed text-gray-500"
                  : "cursor-pointer text-gray-200"
              }
            `}
          >
            <option value="">Select address</option>

            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {formatAddress(a)}
              </option>
            ))}
          </select>

          <ChevronDownIcon
            className={`
              pointer-events-none absolute right-0 top-1/2 h-4 w-4
              -translate-y-1/2
              ${sameAsShipping ? "text-gray-600" : "text-gray-500"}
            `}
          />
        </div>

        {sameAsShipping && (
          <div
            className="
              pointer-events-none absolute left-1/2 -translate-x-1/2
              -top-9 whitespace-nowrap rounded bg-black
              px-2 py-1 text-[11px] text-white opacity-0
              group-hover:opacity-100 transition z-10
            "
          >
            You can’t edit this because “Use shipping address” is marked.
          </div>
        )}
      </div>
    </div>

    <hr className="border-dashed border-white/10" />

    {/* FOOTER */}
    <div className="flex justify-between items-center">
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={sameAsShipping}
          onChange={(e) => setSameAsShipping(e.target.checked)}
        />
        Use my shipping address
      </label>

      <button
        onClick={() => setOpenModal(true)}
        className="
          text-sm text-[#38bdf8]
          border border-[#38bdf8]
          px-3 py-1 font-bold rounded
          hover:bg-[#347eb3]/10
        "
      >
        Edit Address
      </button>
    </div>

    {/* MODAL */}
    {openModal && (
      <EditAddressModal
        addresses={addresses}
        shippingId={shippingId}
        billingId={billingId}
        sameAsShipping={sameAsShipping}
        onShippingChange={handleShippingChange}
        onBillingChange={handleBillingChange}
        onClose={() => setOpenModal(false)}
      />
    )}
  </div>
);

}
