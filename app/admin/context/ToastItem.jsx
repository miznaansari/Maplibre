"use client";

import {
  CheckBadgeIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ToastItem({ toast, onClose }) {
  const isSuccess = toast.type === "success";

  return (
    <div
      className={`relative w-80 rounded-xl p-[1px]
      ${isSuccess
          ? "bg-gradient-to-r from-[#347eb3]/40 to-[#38bdf8]/40"
          : "bg-gradient-to-r from-red-500/40 to-red-400/40"
        }
      animate-slide-in`}
    >
      {/* INNER CARD */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl
        bg-white
        border border-gray-200
        shadow-md"
      >
        {/* ICON */}
        <div
          className={`h-9 w-9 flex items-center justify-center rounded-full
          ${isSuccess
              ? "bg-[#347eb3]/15 text-[#347eb3]"
              : "bg-red-100 text-red-500"
            }`}
        >
          {isSuccess ? (
            <CheckBadgeIcon className="h-5 w-5" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5" />
          )}
        </div>

        {/* TEXT */}
        <div className="flex-1">
          <p
            className={`text-sm font-semibold tracking-wide
            ${isSuccess ? "text-[#347eb3]" : "text-red-500"}`}
          >
            {isSuccess ? "Success" : "Error"}
          </p>

          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-black" />
        </button>
      </div>
    </div>
  );
}