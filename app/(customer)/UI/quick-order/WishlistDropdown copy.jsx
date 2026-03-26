"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function WishlistDropdown({
  wishlists = [],
  onSelect,
  onCreate,
  anchorRef,
}) {
  const [newName, setNewName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState(null);

  /* =========================
     Mount safety (Next.js)
  ========================= */
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  /* =========================
     Calculate position
  ========================= */
  useEffect(() => {
    if (!anchorRef?.current) return;

    const rect = anchorRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right + window.scrollX,
    });
  }, [anchorRef]);

  if (!mounted || !position) return null;

  return createPortal(
    <div
      className="
        z-[9999]
        min-w-[220px]
        rounded-lg
        border border-gray-200
        bg-white
        shadow-xl
      "
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transform: "translateX(-100%)",
      }}
    >
      {/* Wishlist list */}
      <ul className="max-h-52 overflow-y-auto divide-y divide-gray-100">
        {wishlists.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-400 text-center">
            No wishlists found
          </li>
        )}

        {wishlists.map((w) => (
          <li
            key={w.id}
            onClick={() => onSelect(w)}
            className="
              cursor-pointer
              px-4 py-2.5
              text-sm text-gray-700
              hover:bg-blue-50
              hover:text-blue-600
              transition
            "
          >
            {w.title}
          </li>
        ))}
      </ul>

      {/* Create new wishlist */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New wishlist name"
            className="
              flex-1
              rounded-md
              border border-gray-300
              px-3 py-1.5
              text-sm
              focus:border-blue-500
              focus:outline-none
              focus:ring-1
              focus:ring-blue-500
            "
          />
          <button
            type="button"
            onClick={() => {
              if (!newName.trim()) return;
              onCreate(newName.trim());
              setNewName("");
            }}
            className="
              rounded-md
              bg-blue-600
              px-3 py-1.5
              text-sm
              font-medium
              text-white
              hover:bg-blue-700
              active:scale-95
              transition
            "
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
