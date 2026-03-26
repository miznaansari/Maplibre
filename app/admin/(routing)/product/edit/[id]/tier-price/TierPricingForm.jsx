"use client";

import React, { useEffect, useState } from "react";
import { saveTierPricing } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";

export default function TierPricingForm({ productId, productName, tierPricing }) {
    const { showToast } = useToast();

    const [state, action, pending] = React.useActionState(saveTierPricing, {
        success: false,
        errors: {},
    });

    // Controlled state for all tier prices
    const [values, setValues] = useState(() => {
        const obj = {};
        for (let i = 1; i <= 10; i++) {
            const key = `tier_${i}_price`;
            obj[key] = tierPricing?.[key]?.toString() || "";
        }
        return obj;
    });

    // If the prop changes (first load), update state
    useEffect(() => {
        if (!tierPricing) return;
        const obj = {};
        for (let i = 1; i <= 10; i++) {
            const key = `tier_${i}_price`;
            obj[key] = tierPricing[key]?.toString() || "";
        }
        setValues(obj);
    }, [tierPricing]);

    useEffect(() => {
        if (state.success) {
            showToast({
                type: "success",
                message: "Tier pricing saved successfully",
            });
        }
        if (state.errors?.general) {
            showToast({
                type: "error",
                message: state.errors.general,
            });
        }
    }, [state, showToast]);

    // Update state when user types
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6 p-0">
            {/* HEADER */}
            {/* CARD */}
            <div className="rounded border border-gray-300 bg-white shadow-sm">
                <div className="border-b border-gray-300 px-6 py-4">
                   <h1 className="text-xl font-semibold text-gray-800">Tier Pricing</h1>
                <p className="text-sm text-gray-600">
                    Editing product: <span className="font-medium text-gray-900">{productName}</span>
                </p>
                </div>

                <form action={action} className="p-6 space-y-2">
                    <input type="hidden" name="product_list_id" value={productId} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => {
                            const tier = i + 1;
                            const fieldName = `tier_${tier}_price`;
                            return (
                                <div key={tier}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tier {tier} Price
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name={fieldName}
                                        value={values[fieldName]}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded border border-gray-300 p-2"
                                        placeholder={`Enter Tier ${tier} price`}
                                    />
                                </div>
                            );
                        })}
                    </div>


                    <button disabled={pending} className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                        {pending ? "Saving..." : "Save Tier Pricing"}
                    </button>
                </form>

            </div>
        </div>
    );
}
