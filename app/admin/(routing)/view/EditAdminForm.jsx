"use client";

import { useActionState, useEffect } from "react";
import { updateAdminAction } from "./actions";
import { useToast } from "../../context/ToastProvider";
import { useRouter } from "next/navigation";

export function EditAdminForm({ admin, onClose }) {
  const { showToast } = useToast();
  const router = useRouter(); // ✅ correct

  const [state, action, pending] = useActionState(updateAdminAction, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (!state.message) return;

    showToast({
      type: state.success ? "success" : "error",
      message: state.message,
    });

    if (state.success) {
      onClose();          // ✅ close drawer
      router.refresh();   // ✅ refresh data
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={admin?.id} />

      <div>
        <label className="text-sm">Name</label>
        <input
          name="name"
          defaultValue={admin?.name}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="text-sm">Email</label>
        <input
          name="email"
          defaultValue={admin?.email}
          className="w-full border px-3 py-2 rounded"
        />
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