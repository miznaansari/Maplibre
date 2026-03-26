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
import QuantityInput from "../QuantityInput";
import {
  addItemsToWishlist,
  removeItemFromWishlist,
  getWishlistItems,
  getWishlists,
} from "../action";

/* ======================================================
   DEBOUNCE HOOK
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
   TABLE ROW SKELETON
====================================================== */
function TableRowSkeleton({ rows = 10 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-gray-200">
      {Array.from({ length: 6 }).map((__, j) => (
        <td key={j} className="px-3 py-3">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
        </td>
      ))}
    </tr>
  ));
}

/* ======================================================
   MEMOIZED ROW
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
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={!!isActive}
          onChange={(e) => onCheck(product.id, e.target.checked)}
        />
      </td>

      <td className="px-3 py-2">{index + 1}</td>

      <td className="px-3 py-2">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {product.name || ""}
          </span>
          <span className="text-xs text-gray-500">{product.sku}</span>
        </div>
      </td>

      <td className="px-3 py-2 font-medium">${product.price}</td>

      <td className="px-3 py-2">
        <QuantityInput
          product={product}
          value={selected?.qty || 1}
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
  );
});

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function WishlistTable({
  wishlistId,
  selectedWishlistId,
  setSelectedWishlistId,
}) {
  const [products, setProducts] = useState([]);
  const [details, setDetails] = useState([]);
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingWishlistItems, setLoadingWishlistItems] = useState(false);

  /* ===============================
     LOAD PRODUCTS
  =============================== */
  useEffect(() => {
    Promise.all([
      fetch("/api/shop?minimal=true").then((r) => r.json()),
      getProductDetails(),
    ]).then(([products, details]) => {
      setProducts(products);
      setDetails(details);
      setLoadingProducts(false);
    });
  }, []);

  /* ===============================
     LOAD WISHLIST ITEMS
  =============================== */
  useEffect(() => {
    if (!wishlistId) return;

    setLoadingWishlistItems(true);
    getWishlistItems(wishlistId).then((items) => {
      const map = {};
      items.forEach((item) => {
        map[item.product_list_id] = {
          checked: true,
          qty: item.qty,
        };
      });
      setSelected(map);
      setLoadingWishlistItems(false);
    });
  }, [wishlistId]);

  /* ===============================
     MERGE PRODUCTS
  =============================== */
  const merged = useMemo(() => {
    const detailMap = new Map(details.map((d) => [d.id, d]));
    return products.map((p) => ({
      ...p,
      ...detailMap.get(p.id),
    }));
  }, [products, details]);

  /* ===============================
     SEARCH + DEFER
  =============================== */
  const debouncedSearch = useDebounce(search, 250);
  const deferredSearch = useDeferredValue(debouncedSearch);

  const filtered = useMemo(() => {
    let list = merged;

    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      list = list.filter((p) =>
        (p.name || p.slug || "").toLowerCase().includes(q)
      );
    }

    // 🔥 SELECTED FIRST
    return list.sort((a, b) => {
      const aChecked = selected[a.id]?.checked ? 1 : 0;
      const bChecked = selected[b.id]?.checked ? 1 : 0;
      return bChecked - aChecked;
    });
  }, [merged, deferredSearch, selected]);

  /* ===============================
     HANDLERS
  =============================== */
  const onCheck = useCallback((id, checked) => {
    setSelected((prev) => ({
      ...prev,
      [id]: { checked, qty: prev[id]?.qty || 1 },
    }));
  }, []);

  const onQtyChange = useCallback((id, qty) => {
    setSelected((prev) => ({
      ...prev,
      [id]: { checked: prev[id]?.checked ?? false, qty },
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

  /* ===============================
     WISHLISTS
  =============================== */
  const [wishlists, setWishlists] = useState([]);
  const [loadingWishlists, setLoadingWishlists] = useState(true);

  useEffect(() => {
    getWishlists().then((data) => {
      setWishlists(data);
      setLoadingWishlists(false);
    });
  }, []);
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
      <div className="flex  gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-200">
        <input
          type="text"
          placeholder="Search product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=" md:w-64 rounded border border-gray-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-3">
       
        <div className="flex gap-2">
          <div className="hidden md:flex">
          {loadingWishlists ? (
            <div className="h-9 w-52 bg-gray-200 rounded animate-pulse" />
          ) : (
            <select
              value={selectedWishlistId ?? ""}
              onChange={(e) =>
                setSelectedWishlistId(Number(e.target.value))
              }
              className="border px-2 py-1 rounded min-w-[200px]"
            >
              <option value="">Select Wishlist</option>
              {wishlists.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title} {w.is_public ? "(Public)" : "(Private)"}
                </option>
              ))}
            </select>
          )}
          </div>
           <button
          onClick={addSelected}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Add Selected to Wishlist
        </button>
        </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th />
              <th>#</th>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Wishlist</th>
            </tr>
          </thead>

          <tbody>
            {loadingProducts || loadingWishlistItems ? (
              <TableRowSkeleton rows={8} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <WishlistRow
                  key={p.id}
                  product={p}
                  index={i}
                  selected={selected[p.id]}
                  onCheck={onCheck}
                  onQtyChange={onQtyChange}
                  onToggle={onToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
