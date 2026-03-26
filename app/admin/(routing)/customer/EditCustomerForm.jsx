"use client";

import { useActionState, useEffect } from "react";
import { updateCustomerAction } from "./actions";
import { useToast } from "../../context/ToastProvider";

export function EditCustomerForm({ customer, onClose }) {
  const { showToast } = useToast();

  const [state, action, pending] = useActionState(updateCustomerAction, {
    success: false,
    message: "",
    errors: {},
  });

  useEffect(() => {
    if (!state.message) return;

    showToast({
      type: state.success ? "success" : "error",
      message: state.message,
    });

    if (state.success) {
      onClose();
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={customer?.id} />

      {/* First Name */}
      <div>
        <label className="text-sm">First Name</label>
        <input
          name="first_name"
          defaultValue={customer?.first_name}
          className={`w-full border px-3 py-2 rounded ${
            state.errors?.first_name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        />

        {/* ✅ Reserved space */}
        <p className="mt-1 text-sm h-5 text-red-500">
          {state.errors?.first_name || ""}
        </p>
      </div>

      {/* Last Name */}
      <div>
        <label className="text-sm">Last Name</label>
        <input
          name="last_name"
          defaultValue={customer?.last_name}
          className="w-full border px-3 py-2 rounded border-gray-300"
        />
        <p className="mt-1 text-sm h-5"></p>
      </div>

      {/* Email (read-only recommended) */}
      <div>
        <label className="text-sm">Email</label>
        <input
          value={customer?.email || ""}
          readOnly
          name="email"
          className="w-full border px-3 py-2 rounded border-gray-200 bg-gray-100 text-gray-500"
        />

        <p className="mt-1 text-sm h-5 text-red-500">
          {state.errors?.email || ""}
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm">Phone</label>
        <input
          name="phone"
          defaultValue={customer?.phone}
          className="w-full border px-3 py-2 rounded border-gray-300"
        />
        <p className="mt-1 text-sm h-5"></p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}