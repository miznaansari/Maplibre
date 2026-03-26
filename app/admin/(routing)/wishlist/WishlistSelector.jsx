"use client";

import { useEffect, useState, useTransition } from "react";
import { createWishlist, getWishlists } from "./action";

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

  const handleCreate = async (formData) => {
    await createWishlist(formData);
    await loadWishlists();
  };

  return (
    <div className="flex gap-4 items-center">
      {/* CREATE WISHLIST */}
      <form action={handleCreate} className="flex gap-2 items-center">
        <input
          name="title"
          placeholder="Wishlist name"
          className="border px-2 py-1 rounded"
          required
        />
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" name="is_public" />
          Public
        </label>
        <input type="hidden" name="admin_id" value="1" />
        <button
          disabled={isPending}
          className="bg-black text-white px-3 py-1 rounded"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </form>

      {/* SELECT WISHLIST */}
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
