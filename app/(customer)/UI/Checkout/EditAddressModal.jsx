"use client";

import { useEffect, useState, useActionState, useRef } from "react";
import { saveAddress } from "./address.action";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/admin/context/ToastProvider";

const initialState = { error: null, success: false };

function Field({ label, name, value, disabled = false, error, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-200 mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full rounded border px-3 py-2 text-sm
          focus:outline-none
          ${error
            ? "border-red-500 focus:border-red-500"
            : disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-300 focus:border-blue-500"
          }
        `}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function EditAddressModal({
  addresses,
  shippingId,
  billingId,
  onShippingChange,
  onBillingChange,
  onClose,
  sameAsShipping,
}) {
  const { showToast } = useToast();
  const router = useRouter();

  const shipFormRef = useRef(null);
  const billFormRef = useRef(null);

  const [shipId, setShipId] = useState(shippingId);
  const [billId, setBillId] = useState(billingId);

  const shipAddr = addresses.find(a => a.id === shipId);
  const billAddr = addresses.find(a => a.id === billId);

  /* =========================
     FORM STATE (NEW LOGIC)
  ========================= */
  const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    email: "",
    address_1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  };
  const [shipForm, setShipForm] = useState(EMPTY_FORM);
  const [billForm, setBillForm] = useState(EMPTY_FORM);


  /* Sync when dropdown changes */
  useEffect(() => {
    if (shipAddr) {
      setShipForm({
        first_name: shipAddr.first_name || "",
        last_name: shipAddr.last_name || "",
        email: shipAddr.email || "",
        address_1: shipAddr.address_1 || "",
        city: shipAddr.city || "",
        state: shipAddr.state || "",
        postal_code: shipAddr.postal_code || "",
        country: shipAddr.country || "",
      });
    } else {
      // 👇 when "Select address" is chosen
      setShipForm(EMPTY_FORM);
    }
  }, [shipAddr]);




  useEffect(() => {
    if (billAddr) {
      setBillForm({
        first_name: billAddr.first_name || "",
        last_name: billAddr.last_name || "",
        email: billAddr.email || "",
        address_1: billAddr.address_1 || "",
        city: billAddr.city || "",
        state: billAddr.state || "",
        postal_code: billAddr.postal_code || "",
        country: billAddr.country || "",
      });
    } else {
      // 👇 when "Select address" is chosen
      setBillForm(EMPTY_FORM);
    }
  }, [billAddr]);


  const [shipState, shipAction] = useActionState(saveAddress, initialState);
  const [billState, billAction] = useActionState(saveAddress, initialState);

  /* =========================
     SUCCESS + LOCALSTORAGE
  ========================= */
  useEffect(() => {
    if (shipState.success && shipState.id) {
      localStorage.setItem("shippingAddressId", shipState.id);
      onShippingChange(shipState.id);

      if (sameAsShipping) {
        localStorage.setItem("billingAddressId", shipState.id);
        onBillingChange(shipState.id);
      }
    }

    if (!sameAsShipping && billState.success && billState.id) {
      localStorage.setItem("billingAddressId", billState.id);
      onBillingChange(billState.id);
    }

    if (shipState.success || billState.success) {
      showToast({ type: "success", message: "Address updated successfully" });
      router.refresh();
      onClose();
    }
  }, [shipState, billState, sameAsShipping]);
return (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-3">
    <div className="bg-[#0f172a] text-gray-200 w-full max-w-3xl max-h-[90vh] rounded-xl flex flex-col border border-white/10">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 sticky top-0 bg-[#0f172a] z-10">
        <h2 className="text-lg font-semibold text-white">Edit Address</h2>
        <button
          onClick={onClose}
          className="text-xl text-gray-300 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 bg-[#020617]">

        {/* SHIPPING */}
        <div>
          <div className="block md:flex justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 md:mb-0">
              Shipping Address
            </h3>

            <select
              value={shipId ?? ""}
              onChange={e => setShipId(e.target.value ? Number(e.target.value) : null)}
              className="border border-white/10 bg-[#020617] rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value="">Select address</option>
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.address_1}, {a.postal_code}
                </option>
              ))}
            </select>
          </div>

          <form ref={shipFormRef} action={shipAction} className="grid md:grid-cols-2 gap-3">
            <input type="hidden" name="id" value={shipId ?? ""} />

            <Field dark label="First Name" name="first_name"
              value={shipForm.first_name}
              onChange={e => setShipForm({ ...shipForm, first_name: e.target.value })}
              error={shipState.errors?.first_name}
            />

            <Field dark label="Last Name" name="last_name"
              value={shipForm.last_name}
              onChange={e => setShipForm({ ...shipForm, last_name: e.target.value })}
              error={shipState.errors?.last_name}
            />

            <Field dark label="Email" name="email"
              value={shipForm.email}
              onChange={e => setShipForm({ ...shipForm, email: e.target.value })}
              error={shipState.errors?.email}
            />

            <div className="md:col-span-2">
              <Field dark label="Street address" name="address_1"
                value={shipForm.address_1}
                onChange={e => setShipForm({ ...shipForm, address_1: e.target.value })}
                error={shipState.errors?.address_1}
              />
            </div>

            <Field dark label="Town / City" name="city"
              value={shipForm.city}
              onChange={e => setShipForm({ ...shipForm, city: e.target.value })}
              error={shipState.errors?.city}
            />

            <Field dark label="State / County" name="state"
              value={shipForm.state}
              onChange={e => setShipForm({ ...shipForm, state: e.target.value })}
              error={shipState.errors?.state}
            />

            <Field dark label="Postcode / ZIP" name="postal_code"
              value={shipForm.postal_code}
              onChange={e => setShipForm({ ...shipForm, postal_code: e.target.value })}
              error={shipState.errors?.postal_code}
            />

            <Field dark label="Country / Region" name="country"
              value={shipForm.country}
              onChange={e => setShipForm({ ...shipForm, country: e.target.value })}
              error={shipState.errors?.country}
            />
          </form>
        </div>

        {/* BILLING */}
        <div>
          <div className="block md:flex justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 md:mb-0">
              Billing Address
            </h3>

            <select
              value={billId ?? ""}
              onChange={e => setBillId(e.target.value ? Number(e.target.value) : null)}
              className="border border-white/10 bg-[#020617] rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value="">Select address</option>
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.address_1}, {a.postal_code}
                </option>
              ))}
            </select>
          </div>

          <form ref={billFormRef} action={billAction} className="grid md:grid-cols-2 gap-3">
            <input type="hidden" name="id" value={billId ?? ""} />

            <Field dark label="First Name" name="first_name"
              value={billForm.first_name}
              onChange={e => setBillForm({ ...billForm, first_name: e.target.value })}
              disabled={sameAsShipping}
            />

            <Field dark label="Last Name" name="last_name"
              value={billForm.last_name}
              onChange={e => setBillForm({ ...billForm, last_name: e.target.value })}
              disabled={sameAsShipping}
            />

            <Field dark label="Email" name="email"
              value={billForm.email}
              onChange={e => setBillForm({ ...billForm, email: e.target.value })}
              disabled={sameAsShipping}
            />

            <div className="md:col-span-2">
              <Field dark label="Street address" name="address_1"
                value={billForm.address_1}
                onChange={e => setBillForm({ ...billForm, address_1: e.target.value })}
                disabled={sameAsShipping}
              />
            </div>

            <Field dark label="Town / City" name="city"
              value={billForm.city}
              onChange={e => setBillForm({ ...billForm, city: e.target.value })}
              disabled={sameAsShipping}
            />

            <Field dark label="State / County" name="state"
              value={billForm.state}
              onChange={e => setBillForm({ ...billForm, state: e.target.value })}
              disabled={sameAsShipping}
            />

            <Field dark label="Postcode / ZIP" name="postal_code"
              value={billForm.postal_code}
              onChange={e => setBillForm({ ...billForm, postal_code: e.target.value })}
              disabled={sameAsShipping}
            />

            <Field dark label="Country / Region" name="country"
              value={billForm.country}
              onChange={e => setBillForm({ ...billForm, country: e.target.value })}
              disabled={sameAsShipping}
            />
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-4 py-3 sticky bottom-0 bg-[#0f172a] border-t border-white/10">
        <button
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-6 py-2 rounded-lg text-sm"
          onClick={() => {
            shipFormRef.current?.requestSubmit();
            if (!sameAsShipping) billFormRef.current?.requestSubmit();
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

}
