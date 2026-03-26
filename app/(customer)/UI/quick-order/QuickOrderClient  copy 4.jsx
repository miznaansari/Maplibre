"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
  useDeferredValue,
  useMemo,
} from "react";

import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

import {
  getWishlists,
  createWishlist,
  addProductsToWishlist,
  addToCartAction,
  getWishlistForPrefill,
} from "./action";

import WishlistDropdown from "./WishlistDropdown";
import QuickOrderTopBar from "./QuickOrderTopBar";

import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";

/* =========================
   MEMOIZED ROW
========================= */
const ProductRow = React.memo(function ProductRow({
  product,
  quantity,
  isSelected,
  isWishlistOpen,
  onQtyChange,
  onToggleSelect,
  onWishlistToggle,
}) {
  c
  return (
    <tr className="border-b border-gray-300 odd:bg-white even:bg-[#F3F8FB] hover:bg-[#F3F8FB]">
      <td className="border border-gray-300 px-2 text-center">
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} />
      </td>

      <td className="border border-gray-300 px-3 text-gray-600">{product.sku}</td>

      <td className="border border-gray-300 px-3 text-blue-700 font-medium">
        <Image
          src={product.mainImage || "/images/not-found.png"}
          alt={product.name}
          width={40}
          height={40}
          className="inline-block mr-2 object-contain"
        />
        {product.name}
      </td>

      <td className="border border-gray-300 text-center text-gray-600">EA</td>
      <td className="border border-gray-300 text-center font-semibold">
        ${product.price ?? product.regular_price}
      </td>

      <td className="border border-gray-300 w-20 text-center">
        <input
          type="number"
          min="0"
          className="w-full border border-gray-300 px-2 py-1 text-center focus:border-blue-500 focus:outline-none"
          value={quantity}
          onChange={(e) => onQtyChange(product.id, e.target.value)}
        />
      </td>

      <td className="border border-gray-300 text-center relative">
        <button
          onClick={onWishlistToggle}
          className="flex w-full items-center justify-center"
        >
          {isWishlistOpen ? (
            <HeartSolid className="h-5 w-5 text-blue-600" />
          ) : (
            <HeartOutline className="h-5 w-5 text-gray-400 hover:text-blue-600" />
          )}
        </button>
      </td>
    </tr>
  );
});

/* =========================
   MAIN COMPONENT
========================= */
export default function QuickOrderClient({ products, customerId }) {
  const { showToast } = useToast();
  const { reloadCart } = useCart();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [selected, setSelected] = useState({});
  const [quantities, setQuantities] = useState(() => new Map());

  const [wishlists, setWishlists] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);

  const [activeWishlistFor, setActiveWishlistFor] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const [isPending, startTransition] = useTransition();

  /* =========================
     FETCH WISHLISTS
  ========================= */
  useEffect(() => {
    if (customerId) {
      getWishlists(customerId).then(setWishlists);
    }
  }, [customerId]);

  /* =========================
     HANDLERS
  ========================= */
  const handleQtyChange = useCallback((id, value) => {
    setQuantities((prev) => {
      const map = new Map(prev);
      map.set(id, value);
      return map;
    });
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  const selectedProductIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  /* =========================
     FILTERED PRODUCTS
  ========================= */
  const finalProducts = useMemo(() => {
    let list = products;

    if (activeCategory) {
      list = list.filter((p) =>
        p.slug.toLowerCase().startsWith(activeCategory.toLowerCase())
      );
    }

    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (wishlistProductIds.length > 0) {
      list = list.filter((p) => wishlistProductIds.includes(p.id));
    }

    return list;
  }, [products, activeCategory, deferredSearch, wishlistProductIds]);

  /* =========================
     CART
  ========================= */
  const handleAddToCart = () => {
    startTransition(async () => {
      const payload = {};
      quantities.forEach((v, k) => {
        if (v > 0) payload[k] = v;
      });

      const res = await addToCartAction({
        customerId,
        quantities: payload,
      });

      if (res.success) {
        reloadCart();
        showToast({ type: "success", message: "Products added to cart" });
        setQuantities(new Map());
        return;
      }

      showToast({
        type: "error",
        message: res.message || "Something went wrong",
      });
    });
  };

  /* =========================
     WISHLIST
  ========================= */
  const openWishlistForBulk = () => {
    if (selectedProductIds.length === 0) {
      showToast({ type: "error", message: "Select products first" });
      return;
    }
    setActiveWishlistFor("bulk");
  };

  const handleWishlistSelect = async (wishlist) => {
    const items =
      activeWishlistFor === "bulk"
        ? selectedProductIds.map((id) => ({
            productId: Number(id),
            quantity: Number(quantities.get(Number(id))) || 1,
          }))
        : [
            {
              productId: activeWishlistFor,
              quantity: Number(quantities.get(activeWishlistFor)) || 1,
            },
          ];

    await addProductsToWishlist({
      wishlistId: wishlist.id,
      items,
    });

    setActiveWishlistFor(null);
    showToast({ type: "success", message: "Added to wishlist" });
  };

  const handleCreateWishlist = async (name) => {
    const res = await createWishlist(customerId, name);
    if (res.success) {
      setWishlists((p) => [res.wishlist, ...p]);
      showToast({ type: "success", message: "Wishlist created" });
    }
  };

  const handleWishlistPrefill = async (wishlistId) => {
    if (!wishlistId) {
      setWishlistProductIds([]);
      setQuantities(new Map());
      return;
    }

    const wl = await getWishlistForPrefill(wishlistId, customerId);
    if (!wl?.items?.length) return;

    const map = new Map();
    const ids = [];

    wl.items.forEach((i) => {
      map.set(i.product_list_id, i.qty);
      ids.push(i.product_list_id);
    });

    setQuantities(map);
    setWishlistProductIds(ids);

    showToast({ type: "success", message: "Wishlist loaded" });
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* FILTER BAR */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          type="text"
          placeholder="Search for Products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />

        <select
          onChange={(e) => handleWishlistPrefill(e.target.value)}
          defaultValue=""
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select Wishlist</option>
          {wishlists.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between gap-2 rounded bg-blue-600 px-4 py-2">
        <QuickOrderTopBar onCategorySelect={setActiveCategory} />

        <button
          onClick={openWishlistForBulk}
          className="bg-white text-blue-600 px-4 py-2 rounded text-sm"
        >
          Add Wishlist ▾
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className="bg-white text-blue-600 px-4 py-2 rounded text-sm"
        >
          Add to Cart
        </button>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2">✓</th>
              <th className="border border-gray-300 px-2">Code</th>
              <th className="border border-gray-300 px-2">Name</th>
              <th className="border border-gray-300 px-2">Unit</th>
              <th className="border border-gray-300 px-2">Price</th>
              <th className="border border-gray-300 px-2">Qty</th>
              <th className="border border-gray-300 px-2">Wishlist</th>
            </tr>
          </thead>

          <tbody>
            {finalProducts.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                quantity={quantities.get(p.id) ?? ""}
                isSelected={!!selected[p.id]}
                isWishlistOpen={activeWishlistFor === p.id}
                onQtyChange={handleQtyChange}
                onToggleSelect={() => toggleSelect(p.id)}
                onWishlistToggle={() =>
                  setActiveWishlistFor(
                    activeWishlistFor === p.id ? null : p.id
                  )
                }
              />
            ))}
          </tbody>
        </table>

        {activeWishlistFor && (
          <div className="absolute right-4 top-20">
            <WishlistDropdown
              wishlists={wishlists.map((w) => ({
                id: w.id,
                name: w.title,
              }))}
              onSelect={handleWishlistSelect}
              onCreate={handleCreateWishlist}
            />
          </div>
        )}
      </div>
    </div>
  );
}
