"use client";

import { useState } from "react";
import WishlistList from "./WishlistList";

export default function WishlistPage() {
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);
  const [search, setSearch] = useState("");

  return (
    <div className="m-2 space-y-4 bg-white">
      

      {/* WISHLIST LIST */}
      <WishlistList
        search={search}
        selectedId={selectedWishlistId}
        onSelect={setSelectedWishlistId}
      />
    </div>
  );
}
