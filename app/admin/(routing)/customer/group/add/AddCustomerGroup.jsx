"use client";

import React, { useEffect, useRef } from "react";
import { addCustomerGroup } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
const initialState = {
    success: false,
    errors: {},
    values: {},
};

export default function AddCustomerGroup() {
    const [state, action, pending] = React.useActionState(
        addCustomerGroup,
        initialState
    );

    const { showToast } = useToast();

    // Show toast on global errors
const prevSuccess = useRef(false);
const prevErrors = useRef(null);

useEffect(() => {
    // ✅ SUCCESS TOAST
    if (!prevSuccess.current && state.success) {
        showToast({
            type: "success",
            message: "Customer group added successfully",
        });
    }

    // ❌ ERROR TOAST
    if (
        state.errors &&
        Object.keys(state.errors).length > 0 &&
        state.errors !== prevErrors.current
    ) {
        showToast({
            type: "error",
            message: Object.values(state.errors)[0],
        });
    }

    prevSuccess.current = state.success;
    prevErrors.current = state.errors;
}, [state.success, state.errors, showToast]);



    return (
        <form
            action={action}
            className="m-6 rounded border border-gray-300 bg-white p-6 shadow-sm"
        >
            <h2 className="mb-6 text-lg font-semibold text-gray-800">
                Add Customer Group
            </h2>
  {state.success && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-700">
                    ✅ Customer group added successfully
                </div>
            )}
          

            <div className="space-y-4">
                {/* GROUP NAME */}
                <div>
                    <input
                        name="group_name"
                        placeholder="Customer Group Name"
                        defaultValue={state.values?.group_name || ""}
                        className="w-full rounded border border-gray-300 p-2"
                    />
                    {state.errors?.group_name && (
                        <p className="mt-1 text-sm text-red-500">
                            {state.errors.group_name}
                        </p>
                    )}
                </div>

                {/* STATUS */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={state.values?.is_active !== false}
                        className="h-4 w-4 border border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Active</label>
                </div>
            </div>

            <button
                type="submit"
                disabled={pending}
                className="mt-6 rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {pending ? "Saving..." : "Save Customer Group"}
            </button>
        </form>
    );
}
