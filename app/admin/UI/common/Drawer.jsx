"use client";

import { useEffect, useState } from "react";

export default function Drawer({
  open,
  onClose,
  title,
  children,
  size = "md",
}) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  };

  useEffect(() => {
    if (open) {
      setVisible(true);

      // ⏳ next frame → start animation (fix flash)
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    } else {
      setAnimate(false);

      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          absolute inset-0 bg-black/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${animate ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Drawer */}
      <div
        className={`
          ml-auto h-full w-full ${sizeMap[size]} bg-white shadow-2xl
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-90"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-64px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}