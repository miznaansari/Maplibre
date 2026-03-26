"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import WishlistSelector from "./WishlistSelector";
import WishlistTable from "./WishlistTable";

export default function WishlistPage() {
  const params = useParams(); // { id: '12' }
  const wishlistIdFromParams = params?.id ? Number(params.id) : null;

  const [selectedWishlistId, setSelectedWishlistId] = useState(
    wishlistIdFromParams
  );

  // 🔁 keep state in sync if route param changes
  useEffect(() => {
    if (wishlistIdFromParams) {
      setSelectedWishlistId(wishlistIdFromParams);
    }
  }, [wishlistIdFromParams]);

  return (
    <div className="m-2 space-y-4">
      {/* HEADER */}
      {/* <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Wishlist Manager</h1>
      </div> */}

      {/* WISHLIST SELECTOR */}
      {/* <WishlistSelector
        selectedWishlistId={selectedWishlistId}
        setSelectedWishlistId={setSelectedWishlistId}
      /> */}

      {/* TABLE VIEW (ONLY) */}
      <Suspense fallback={<p>Loading products...</p>}>
        {selectedWishlistId && (
          <WishlistTable wishlistId={selectedWishlistId}
            selectedWishlistId={selectedWishlistId}
        setSelectedWishlistId={setSelectedWishlistId}
          />
        )}
      </Suspense>
    </div>
  );
}
