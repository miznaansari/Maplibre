"use client";

import React from "react";
import { updateAddress } from "./server";

const initialState = {
  success: false,
  errors: {},
  values: {},
};
const inputBase =
  "w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),_0_1px_1px_rgba(0,0,0,0.08)] focus:border-gray-400 focus:outline-none";

const labelBase = "block text-sm font-medium mb-1";
const errorText = "mt-1 text-xs text-red-500";

const formWrapper =
  "space-y-6 rounded border mt-5 bg-white border-gray-300 bg-gray-50 p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),_0_1px_1px_rgba(0,0,0,0.08)]";

const submitButton =
  "rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60";

export default function EditAddressForm({ address }) {
  console.log('address',address)

  // ✅ FIX 1: bind address id
  const editAction = updateAddress.bind(null, address.id);

  const [state, action, pending] = React.useActionState(
    editAction,
    initialState
  );

  // ✅ FIX 2: choose values (validation > db)
const v = Object.keys(state.values).length ? state.values : address;


  return (
    <form action={action} className={formWrapper}>

      {/* NAME + COMPANY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Name *</label>
          <input
            name="first_name"
            defaultValue={v.first_name}
            className={inputBase}
          />
          {state.errors?.first_name && (
  <p className={errorText}>{state.errors.first_name}</p>
)}
        </div>

        <div>
          <label className={labelBase}>
            Company name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="company"
            defaultValue={v.company || ""}
            className={inputBase}
          />
          {state.errors?.company && (
  <p className={errorText}>{state.errors.company}</p>
)}
        </div>
      </div>

      {/* EMAIL + PHONE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Email *</label>
          <input
            name="email"
            defaultValue={v.email || ""}
            className={inputBase}
          />
        {state.errors?.email && (
  <p className={errorText}>{state.errors.email}</p>
)}
        </div>

        <div>
          <label className={labelBase}>Phone Number *</label>
          <input
            name="phone"
            defaultValue={v.phone || ""}
            className={inputBase}
          />
        {state.errors?.phone && (
  <p className={errorText}>{state.errors.phone}</p>
)}
        </div>
      </div>

      {/* STREET */}
      <div>
        <label className={labelBase}>Street address *</label>
        <input
          name="address_1"
          defaultValue={v.address_1}
          className={inputBase}
        />
        {state.errors?.address_1 && (
  <p className={errorText}>{state.errors.address_1}</p>
)}
      </div>

      <input
        name="address_2"
        defaultValue={v.address_2 || ""}
        className={inputBase}
      />
      {/* ADDRESS LINE 2 */}
      {state.errors?.address_2 && (
  <p className={errorText}>{state.errors.address_2}</p>
)}

      {/* CITY + STATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Town / City *</label>
          <input
            name="city"
            defaultValue={v.city}
            className={inputBase}
          />
        {state.errors?.city && (
  <p className={errorText}>{state.errors.city}</p>
)}
        </div>

        <div>
          <label className={labelBase}>State / County *</label>
          <input
            name="state"
            defaultValue={v.state || ""}
            className={inputBase}
          />
        {state.errors?.state && (
  <p className={errorText}>{state.errors.state}</p>
)}
        </div>
      </div>

      {/* POSTCODE + COUNTRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Postcode / ZIP *</label>
          <input
            name="postal_code"
            defaultValue={v.postal_code}
            className={inputBase}
          />
        {state.errors?.postal_code && (
  <p className={errorText}>{state.errors.postal_code}</p>
)}
        </div>

        <div>
          <label className={labelBase}>Country / Region *</label>
          <select
            name="country"
            defaultValue={v.country}
            className={inputBase}
          >
            <option value="">Select a country / region…</option>
            <option value="India">India</option>
            <option value="USA">United States</option>
          </select>
        {state.errors?.country && (
  <p className={errorText}>{state.errors.country}</p>
)}
        </div>
      </div>

      {/* DEFAULT */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="is_default"
          defaultChecked={v.is_default}
        />
        Make this my default address
      </label>

      {/* SUBMIT */}
      <button disabled={pending} className={submitButton}>
        {pending ? "Saving..." : "Update Address"}
      </button>
    </form>
  );
}
