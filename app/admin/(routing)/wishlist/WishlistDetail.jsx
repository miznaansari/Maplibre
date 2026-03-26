"use client";

import { useEffect, useState } from "react";
import { getWishlistForPrefill } from "./action";

export default function WishlistDetail({ wishlistId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!wishlistId) return;
    getWishlistForPrefill(wishlistId).then((res) => {
      if (res.success) setData(res);
    });
  }, [wishlistId]);

  if (!wishlistId) {
    return <div className="p-6 text-gray-500">Select a wishlist</div>;
  }

  if (!data) {
    return <div className="p-6">Loading wishlist...</div>;
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="text-lg font-semibold">{data.title}</h2>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Product ID</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.product_list_id} className="border-t">
              <td className="p-2">{item.product_list_id}</td>
              <td className="text-center">{item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add more products */}
      <div className="pt-3 border-t">
        <p className="text-sm text-gray-500">
          You can add more products using the product table
        </p>
      </div>
    </div>
  );
}
