"use client";

import { useTransition } from "react";
import { toggleStatus } from "./action";

export default function StatusToggle({ id, isActive }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleStatus(id, !isActive);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        px-3 py-1 rounded-full text-xs font-semibold
        transition-all duration-200'
        ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
${isPending ? "opacity-50 cursor-not-allowed" : " cursor-pointer"}
      `}
    >
      {isPending ? "Updating..." : isActive ? "Active" : "Inactive"}
    </button>
  );
}
