"use client";

import { useActionState, useEffect } from "react";
import { createCustomerAction } from "./action";
import CustomInputField from "@/app/admin/UI/common/CustomInputField";
import { useToast } from "@/app/admin/context/ToastProvider";

const PRICE_TIERS = [
  "TIER_1",
  "TIER_2",
  "TIER_3",
  "TIER_4",
  "TIER_5",
  "TIER_6",
  "TIER_7",
  "TIER_8",
  "TIER_9",
  "TIER_10",
];

export default function AddCustomer({ customerGroups }) {
  const [state, action, pending] = useActionState(createCustomerAction, {
    success: false,
    errors: {},
    message: "",
    values: {},
  });

  const { showToast } = useToast();

  // ✅ TOAST HANDLING
  useEffect(() => {
    if (state.success) {
      showToast({
        type: "success",
        message: "Customer created successfully.",
      });
    } else if (!state.success && state.message) {
      showToast({
        type: "error",
        message: state.message,
      });
    }
  }, [state.success, state.message, showToast]);

  return (
    <form action={action} className="bg-white p-6 pt-0 rounded space-y-6">
      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CustomInputField
          label="First Name"
          name="first_name"
          defaultValue={state.values?.first_name}
          error={state.errors?.first_name}
        />

        <CustomInputField
          label="Last Name"
          name="last_name"
          defaultValue={state.values?.last_name}
          error={state.errors?.last_name}
        />

        <CustomInputField
          label="Email"
          name="email"
          type="email"
          defaultValue={state.values?.email}
          error={state.errors?.email}
        />

        <CustomInputField
          label="Phone"
          name="phone"
          defaultValue={state.values?.phone}
          error={state.errors?.phone}
        />

        {/* Customer Group */}
        <div className="space-y-1">
          <label className="label">Customer Group</label>
          <select
            name="customer_group_id"
            defaultValue={state.values?.customer_group_id || ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-black"
          >
            <option value="">Select Customer Group</option>
            {customerGroups.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>

          {state.errors?.customer_group_id && (
            <p className="text-sm text-red-500">
              {state.errors.customer_group_id}
            </p>
          )}
        </div>

        {/* Price Tier */}
        <div className="space-y-1">
          <label className="label">Price Tier</label>
          <select
            name="price_tier"
            defaultValue={state.values?.price_tier || ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-black"
          >
            <option value="">Select Price Tier</option>
            {PRICE_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier.replace("_", " ")}
              </option>
            ))}
          </select>

          {state.errors?.price_tier && (
            <p className="text-sm text-red-500">
              {state.errors.price_tier}
            </p>
          )}
        </div>

        {/* Password (always empty) */}
        <div className="md:col-span-2">
          <CustomInputField
            label="Password"
            name="password"
            type="password"
            error={state.errors?.password}
          />
        </div>
      </div>

      {/* Global Error */}
      {/* {state.message && !state.success && (
        <div className="bg-red-50 p-3 text-sm text-red-700 border border-red-200 rounded">
          {state.message}
        </div>
      )} */}

      {/* Action */}
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 bg-blue-600 text-white rounded text-sm
                   hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Create Customer"}
      </button>
    </form>
  );
}
