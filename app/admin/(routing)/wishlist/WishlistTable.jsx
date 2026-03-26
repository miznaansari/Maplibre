"use client";

import {
    useEffect,
    useMemo,
    useState,
    useCallback,
    useDeferredValue,
    memo,
} from "react";
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
import Link from "next/link";

/* ======================================================
   DEBOUNCE HOOK (SMOOTH SEARCH)
====================================================== */
function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
}

/* ======================================================
   MEMOIZED ROW (CRITICAL FOR PERFORMANCE)
====================================================== */
const WishlistRow = memo(function WishlistRow({
    product,
    index,
    selected,
    onCheck,
    onQtyChange,
    onToggle,
}) {
    const isActive = selected?.checked;

    return (
        <Link href={`/admin/wishlist/${product.id}`}>

        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-3 py-2">
                <input
                    type="checkbox"
                    checked={!!isActive}
                    onChange={(e) => onCheck(product.id, e.target.checked)}
                />
            </td>

            <td className="px-3 py-2">{index + 1}</td>

            {/* <td className="px-3 py-2 font-medium">
            td
                {product.name || product.slug}
            </td> */}
            <td>
 <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {product.name || ''} 
          </span>
          <span className="text-xs text-gray-500">
            {product.sku}
          </span>
        </div></td>
       
            <td className="px-3 py-2 font-medium">
                ${product.price}
            </td>

            <td className="px-3 py-2">
                <QuantityInput
                    product={product}
                    value={selected?.qty || product.stepper_value || 1}
                    onChange={(qty) => onQtyChange(product.id, qty)}
                />
            </td>

            <td className="px-3 py-2 text-center">
                <button onClick={() => onToggle(product)}>
                    {isActive ? (
                        <HeartSolid className="h-5 w-5 text-red-500" />
                    ) : (
                        <HeartOutline className="h-5 w-5 text-gray-400 hover:text-red-500" />
                    )}
                </button>
            </td>
        </tr>
        </Link>
    );
});

/* ======================================================
   MAIN COMPONENT
====================================================== */
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
       MERGE PRODUCTS (O(1))
    =============================== */
    const merged = useMemo(() => {
        const detailMap = new Map(details.map((d) => [d.id, d]));
        return products.map((p) => ({
            ...p,
            ...detailMap.get(p.id),
        }));
    }, [products, details]);

    /* ===============================
       SEARCH (CTRL+F SAFE)
    =============================== */
    const debouncedSearch = useDebounce(search, 250);
    const deferredSearch = useDeferredValue(debouncedSearch);

    const filtered = useMemo(() => {
        if (!deferredSearch) return merged;

        const q = deferredSearch.toLowerCase();
        return merged.filter((p) =>
            (p.name || p.slug || "").toLowerCase().includes(q)
        );
    }, [merged, deferredSearch]);

    /* ===============================
       HANDLERS (STABLE)
    =============================== */
    const onCheck = useCallback((id, checked) => {
        setSelected((prev) => ({
            ...prev,
            [id]: {
                checked,
                qty: prev[id]?.qty || 1,
            },
        }));
    }, []);

    const onQtyChange = useCallback((id, qty) => {
        setSelected((prev) => ({
            ...prev,
            [id]: {
                checked: prev[id]?.checked ?? false,
                qty,
            },
        }));
    }, []);

    const onToggle = useCallback(
        async (product) => {
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
        },
        [selected, wishlistId]
    );
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
    

    /* ===============================
       RENDER
    =============================== */
    return (
        <div className="rounded border border-gray-200 bg-white">
            {/* HEADER */}
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-200">
                <input
                    type="text"
                    placeholder="Search product (Ctrl + F works)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-64 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              
                {/* <span className="text-sm text-gray-500">
          Showing {filtered.length} of {merged.length}
        </span> */}
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
                            <th className="px-3 py-2" />
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left">Price</th>
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

                        {filtered.map((p, i) => (
                            <WishlistRow
                                key={p.id}
                                product={p}
                                index={i}
                                selected={selected[p.id]}
                                onCheck={onCheck}
                                onQtyChange={onQtyChange}
                                onToggle={onToggle}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
