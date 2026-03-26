"use client";

import React, { useEffect } from "react";
import { addAddress } from "./server";
import { useToast } from "@/app/admin/context/ToastProvider";

/* ---------------- INITIAL STATE ---------------- */
const initialState = {
  success: false,
  errors: {},
  values: {},
};

/* ---------------- STYLES ---------------- */
const inputBase =
  "w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none";
const labelBase = "block text-sm font-medium mb-1";
const errorText = "mt-1 text-xs text-red-500";
const formWrapper =
  "space-y-6 rounded border border-gray-300 mt-5 bg-white p-6";
const submitButton =
  "rounded bg-[#00AEEF] px-5 py-2 text-sm font-medium text-white disabled:opacity-60";

/* ---------------- COMPONENT ---------------- */
export default function AddAddressForm() {
  const [state, action, pending] = React.useActionState(
    addAddress,
    initialState
  );
const {showToast} = useToast();

useEffect(() => {
  // ✅ Success toast
  if (state.success) {
    showToast({
      type: "success",
      message: "Address added successfully",
    });
  }
  // ❌ Error toast
  if (!state.success && state.errors.general) {
    showToast({
      type: "error",
      message: state.errors.general,
    });
  }
}, [state, showToast]);
return (
  <form
    action={action}
    className="space-y-5 rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-white"
  >
    {/* NAME + COMPANY */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormInput label="Name *" name="first_name" state={state} />
      <FormInput label="Company (optional)" name="company" state={state} />
    </div>

    {/* EMAIL + PHONE */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormInput label="Email *" name="email" state={state} />
      <FormInput label="Phone *" name="phone" state={state} />
    </div>

    {/* ADDRESS */}
    <FormInput label="Street Address *" name="address_1" state={state} />

    <FormInput
      label="Apartment, suite, unit (optional)"
      name="address_2"
      state={state}
    />

    {/* CITY + STATE */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormInput label="City *" name="city" state={state} />
      <FormInput label="State *" name="state" state={state} />
    </div>

    {/* POSTCODE + COUNTRY */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormInput label="Postcode *" name="postal_code" state={state} />

      <div>
        <label className="text-sm text-gray-400">Country *</label>
        <select
          name="country"
          className="
            w-full rounded border border-white/10
            bg-[#111827] px-3 py-2 text-sm text-white
            focus:border-[#347eb3]
            focus:ring-1 focus:ring-[#347eb3]
            outline-none
          "
          defaultValue={state.values.country || ""}
        >
          <option value="">Select country</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
        </select>
        {state.errors.country && (
          <div className="mt-1 text-xs text-red-400">
            {state.errors.country}
          </div>
        )}
      </div>
    </div>

    {/* DEFAULT */}
    <label className="flex items-center gap-2 text-sm text-gray-300">
      <input
        type="checkbox"
        name="is_default"
        defaultChecked={state.values.is_default === "on"}
        className="h-4 w-4 accent-[#347eb3]"
      />
      Make this my default address
    </label>

    {/* GENERAL ERROR */}
    {state.errors.general && (
      <div className="text-sm text-red-400">
        {state.errors.general}
      </div>
    )}

    {/* SUBMIT */}
    <button
      disabled={pending}
      className="
        mt-2 rounded-lg bg-[#347eb3]
        px-6 py-2 text-sm font-medium text-white
        shadow-[0_0_18px_rgba(14,165,233,0.35)]
        hover:bg-[#38bdf8]
        disabled:opacity-50
      "
    >
      {pending ? "Saving..." : "Add Address"}
    </button>
  </form>
);

}
function FormInput({ label, name, state }) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <input
        name={name}
        defaultValue={state.values?.[name] || ""}
        className="
          w-full rounded border border-white/10
          bg-[#111827] px-3 py-2 text-sm text-white
          focus:border-[#347eb3]
          focus:ring-1 focus:ring-[#347eb3]
          outline-none
        "
      />
      {state.errors?.[name] && (
        <div className="mt-1 text-xs text-red-400">
          {state.errors[name]}
        </div>
      )}
    </div>
  );
}
