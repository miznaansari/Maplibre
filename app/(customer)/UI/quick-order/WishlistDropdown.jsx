"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function WishlistDropdown({
  wishlists = [],
  onSelect,
  onCreate,
  onClose,
  anchorRef,
}) {
  const [newName, setNewName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState(null);
  const dropdownRef = useRef(null);

  /* =========================
     Mount safety
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

  /* =========================
     Outside click handler
  ========================= */
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  if (!mounted || !position) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="z-[9999] min-w-[220px] rounded-lg border border-gray-200 bg-white shadow-xl"
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
            onClick={() => {
              onSelect(w);
              onClose?.();
            }}
            className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
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
            className="flex-1 rounded-md border w-40 border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => {
              if (!newName.trim()) return;
              onCreate(newName.trim());
              setNewName("");
              onClose?.();
            }}
            className="rounded-md cursor-pointer bg-[#00AEEF] px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
