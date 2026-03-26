"use client";

import { useEffect, useState, useTransition } from "react";
import { createWishlist, getWishlists } from "../action";

export default function WishlistSelector({
  selectedWishlistId,
  setSelectedWishlistId,
}) {
  const [wishlists, setWishlists] = useState([]);
  const [isPending, startTransition] = useTransition();

  const loadWishlists = async () => {
    const data = await getWishlists();
    setWishlists(data);
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  return (
    <div className="flex gap-4 items-center">

      <select
        value={selectedWishlistId ?? ""}
        onChange={(e) => setSelectedWishlistId(Number(e.target.value))}
        className="border px-2 py-1 rounded min-w-[200px]"
      >
        <option value="">Select Wishlist</option>
        {wishlists.map((w) => (
          <option key={w.id} value={w.id}>
            {w.title} {w.is_public ? "(Public)" : "(Private)"}
          </option>
        ))}
      </select>
    </div>
  );
}
