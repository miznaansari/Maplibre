"use client";

import { useState } from "react";

export default function BulkWishlistDropdown({
  wishlists = [],
  onSelect,
  onCreate,
}) {
  const [newName, setNewName] = useState("");

  return (
  <div className="absolute  top-full z-50 mt-2  box-border rounded border border-gray-200 bg-white shadow-xl">

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
              rounded
              border border-gray-300
              px-3 py-1.5
                text-base
              focus:border-blue-500
              focus:outline-none
              focus:ring-1
              focus:ring-blue-500
            "
          />
          <button
            onClick={() => {
              if (!newName.trim()) return;
              onCreate(newName.trim());
              setNewName("");
            }}
            className="
              rounded
              cursor-pointer
              bg-[#00AEEF]
              px-3 py-1.5
              text-sm font-medium
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
    </div>
  );
}
