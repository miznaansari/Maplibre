"use client";

import { useState, useTransition } from "react";
import { togglecustomerStatus } from "./actions";
import { useToast } from "../../context/ToastProvider";
import { type } from "os";

export default function StatusToggle({ customer }) {
  const { showToast } = useToast();
  const [status, setStatus] = useState(customer.is_active);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await togglecustomerStatus(customer.id, status);
      // 🔴 Not logged in → redirect
      if (res?.status === 401) {
        router.push("/customer");
        return;
      }
      if (res.success) {
        setStatus(res.is_active);
        showToast({ type: "success", message: "Status updated successfully" });

      } else {
        // alert("Failed to update status");
        showToast({ type: "error", message: res.message || "Failed to update status" });

      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition
        ${status
          ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
          : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
        }
        ${isPending ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
      `}
    >
      {isPending ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Updating
        </>
      ) : status ? (
        "Active"
      ) : (
        "Inactive"
      )}
    </button>
  );
}
