"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductDetails } from "@/lib/productCache";
import {
    HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import {
    HeartIcon as HeartSolid,
} from "@heroicons/react/24/solid";
import QuantityInput from "./QuantityInput";
import {
    addItemsToWishlist,
    removeItemFromWishlist,
    getWishlistItems,
} from "./action";

export default function WishlistTable({ wishlistId }) {
    const [products, setProducts] = useState([]);
    const [details, setDetails] = useState([]);
    const [selected, setSelected] = useState({});
    const [search, setSearch] = useState("");

    /* ===============================
       LOAD PRODUCTS
    =============================== */
    useEffect(() => {
        fetch("/api/shop?minimal=true")
            .then((r) => r.json())
            .then(setProducts);

        getProductDetails().then(setDetails);
    }, []);

    /* ===============================
       LOAD WISHLIST ITEMS
    =============================== */
    useEffect(() => {
        if (!wishlistId) return;

        getWishlistItems(wishlistId).then((items) => {
            const map = {};
            items.forEach((item) => {
                map[item.product_list_id] = {
                    checked: true,
                    qty: item.qty,
                };
            });
            setSelected(map);
        });
    }, [wishlistId]);

    /* ===============================
       MERGE PRODUCTS
    =============================== */
    const merged = useMemo(() => {
        return products.map((p) => ({
            ...p,
            ...details.find((d) => d.id === p.id),
        }));
    }, [products, details]);

    /* ===============================
       SEARCH FILTER
    =============================== */
    const filtered = useMemo(() => {
        if (!search) return merged;

        return merged.filter((p) =>
            (p.name || p.slug || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [merged, search]);

    /* ===============================
       TOGGLE WISHLIST
    =============================== */
    const toggleWishlist = async (product) => {
        const isActive = selected[product.id]?.checked;
        const qty = selected[product.id]?.qty || 1;

        if (isActive) {
            await removeItemFromWishlist(wishlistId, product.id);
            setSelected((prev) => {
                const copy = { ...prev };
                delete copy[product.id];
                return copy;
            });
        } else {
            await addItemsToWishlist(wishlistId, [
                { product_id: product.id, qty },
            ]);
            setSelected((prev) => ({
                ...prev,
                [product.id]: { checked: true, qty },
            }));
        }
    };

    /* ===============================
       ADD SELECTED
    =============================== */
    const addSelected = async () => {
        const items = filtered
            .filter((p) => selected[p.id]?.checked)
            .map((p) => ({
                product_id: p.id,
                qty: selected[p.id]?.qty || 1,
            }));

        if (!items.length) return;

        await addItemsToWishlist(wishlistId, items);
    };

    return (
        <div className="rounded border border-gray-200 bg-white">
            {/* HEADER */}
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-200">
                <input
                    type="text"
                    placeholder="Search product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-64 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={addSelected}
                    className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Add Selected to Wishlist
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr className="border-b border-gray-200">
                            <th className="px-3 py-2 text-left"></th>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left">Qty</th>
                            <th className="px-3 py-2 text-center">Wishlist</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    No products found
                                </td>
                            </tr>
                        )}

                        {filtered.map((p, i) => {
                            const isActive = selected[p.id]?.checked;

                            return (
                                <tr
                                    key={p.id}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={!!isActive}
                                            onChange={(e) =>
                                                setSelected((prev) => ({
                                                    ...prev,
                                                    [p.id]: {
                                                        checked: e.target.checked,
                                                        qty: prev[p.id]?.qty || 1,
                                                    },
                                                }))
                                            }
                                        />
                                    </td>

                                    <td className="px-3 py-2">{i + 1}</td>

                                    <td className="px-3 py-2 font-medium">
                                        {p.name || p.slug}
                                    </td>

                                    <td className="px-3 py-2">
                                        <QuantityInput
                                            product={p}
                                            value={selected[p.id]?.qty || p.stepper_value || 1}
                                            onChange={(qty) =>
  setSelected((prev) => ({
    ...prev,
    [p.id]: {
      checked: prev[p.id]?.checked ?? false, // ⬅️ DO NOT auto-select
      qty,
    },
  }))
}

                                        />

                                    </td>

                                    <td className="px-3 py-2 text-center">
                                        <button onClick={() => toggleWishlist(p)}>
                                            {isActive ? (
                                                <HeartSolid className="h-5 w-5 text-red-500" />
                                            ) : (
                                                <HeartOutline className="h-5 w-5 text-gray-400 hover:text-red-500" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
