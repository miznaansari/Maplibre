"use client";

import { useState } from "react";
import WishlistList from "./WishlistList";

export default function WishlistPage() {
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);
  const [search, setSearch] = useState("");

  return (
    <div className="m-2 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Wishlist Manager</h1>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search wishlist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* WISHLIST LIST */}
      <WishlistList
        search={search}
        selectedId={selectedWishlistId}
        onSelect={setSelectedWishlistId}
      />
    </div>
  );
}
