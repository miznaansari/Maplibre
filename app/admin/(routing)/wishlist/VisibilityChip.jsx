"use client";

import { useState, useTransition } from "react";
import { toggleWishlistVisibility } from "./action";
import { useToast } from "../../context/ToastProvider";

export default function VisibilityChip({ wishlistId, initialStatus }) {
    const {showToast} = useToast();
  const [isPublic, setIsPublic] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e) => {
    e.stopPropagation();

    startTransition(async () => {
      const res = await toggleWishlistVisibility(wishlistId, isPublic);

      if (res?.success) {
        setIsPublic((prev) => !prev);
      }

      showToast({
        type: res.success ? "success" : "error",
        message: res.message,
      });
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 rounded-full text-xs font-medium transition
        ${isPublic
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
        ${isPending ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {isPending ? (
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Updating
        </span>
      ) : (
        isPublic ? "Public" : "Private"
      )}
    </button>
  );
}
