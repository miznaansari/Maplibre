// app/admin/product/[id]/customer-pricing/CustomerPricingForm.jsx
"use client";

import React, { useEffect, useState } from "react";
import { saveCustomerPricing } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";

export default function CustomerPricingForm({ productId, productName, customerPricing }) {
  const { showToast } = useToast();

  const [state, action, pending] = React.useActionState(saveCustomerPricing, {
    success: false,
    errors: {},
  });

  // Controlled state: customer_group_id → price
  const [values, setValues] = useState(() => {
    const obj = {};
    customerPricing.forEach((c) => {
      obj[c.id] = c.price.toString();
    });
    return obj;
  });

  // If customerPricing changes (first load), update state
  useEffect(() => {
    if (!customerPricing) return;
    const obj = {};
    customerPricing.forEach((c) => {
      obj[c.id] = c.price.toString();
    });
    setValues(obj);
  }, [customerPricing]);

  useEffect(() => {
    if (state.success) {
      showToast({ type: "success", message: "Customer pricing saved successfully" });
    }
    if (state.errors?.general) {
      showToast({ type: "error", message: state.errors.general });
    }
  }, [state, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 p-0">

      {/* CARD */}
      <div className="rounded border border-gray-300 bg-white shadow-sm">
        <div className="border-b border-gray-300 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Customer Pricing</h1>
        <p className="text-sm text-gray-600">
          Editing product: <span className="font-medium text-gray-900">{productName}</span>
        </p>
        </div>

        <form action={action} className="p-6 space-y-2">
          <input type="hidden" name="product_list_id" value={productId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customerPricing.map((c) => (
              <div key={c.id}>
                <label className="block text-sm font-medium text-gray-700">
                  {c.group_name} Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name={c.id} // use group id as the key
                  value={values[c.id]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border border-gray-300 p-2"
                  placeholder={`Enter price for ${c.group_name}`}
                />
              </div>
            ))}
          </div>

          <button
            disabled={pending}
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Customer Pricing"}
          </button>
        </form>
      </div>
    </div>
  );
}
