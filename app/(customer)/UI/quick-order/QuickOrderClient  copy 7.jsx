"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import {
  getWishlists,
  createWishlist,
  addProductsToWishlist,
  addToCartAction,
  getWishlistForPrefill
} from "./action";

import WishlistDropdown from "./WishlistDropdown";
import { useToast } from "@/app/admin/context/ToastProvider";
import QuickOrderTopBar from "./QuickOrderTopBar";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

export default function QuickOrderClient({ products, customerId }) {
  const { showToast } = useToast();
  const { reloadCart } = useCart();
const quantitiesRef = useRef({});

  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [activeWishlistFor, setActiveWishlistFor] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [isPending, startTransition] = useTransition();

  /* =========================
     🔍 SEARCH (FAST & SAFE)
  ========================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ========================= */

  const priceRefs = useRef([]);

  useEffect(() => {
    getWishlists(customerId).then(setWishlists);
  }, [customerId]);

  const handleQtyChange = (id, value) => {
    setQuantities((p) => ({ ...p, [id]: value }));
  };

  const toggleSelect = (id) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  };

  /* =========================
     WISHLIST
  ========================= */
  const selectedProductIds = Object.keys(selected).filter(
    (id) => selected[id]
  );

  const openWishlistForBulk = () => {
    if (selectedProductIds.length === 0) {
      showToast({ type: "error", message: "Select products first" });
      return;
    }
    setActiveWishlistFor("bulk");
  };

  const handleWishlistSelect = async (wishlist) => {
    let items = [];

    if (activeWishlistFor === "bulk") {
      items = selectedProductIds.map((productId) => ({
        productId: Number(productId),
        quantity: Number(quantities[productId]) > 0
          ? Number(quantities[productId])
          : 1,
      }));
    } else {
      items = [{
        productId: activeWishlistFor,
        quantity: Number(quantities[activeWishlistFor]) > 0
          ? Number(quantities[activeWishlistFor])
          : 1,
      }];
    }

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

  /* =========================
     ADD TO CART
  ========================= */
  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addToCartAction({ customerId, quantities });

      if (res.success) {
        reloadCart();
        showToast({
          type: "success",
          message: "Products added to cart successfully",
        });
        setQuantities({});
        return;
      }

      if (res.message === "Customer not found") {
        const existingCart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};

        const updatedCart = { ...existingCart };

        products.forEach((product) => {
          const qty = quantities[product.id];
          if (!qty || qty <= 0) return;

          if (updatedCart[product.id]) {
            updatedCart[product.id].quantity += Number(qty);
          } else {
            updatedCart[product.id] = {
              product_id: product.id,
              name: product.name,
              price: product.price,
              image: product.mainImage,
              quantity: qty,
            };
          }
        });

        localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
        reloadCart();

        showToast({
          type: "info",
          message: "Saved to cart. Login to continue",
        });

        setQuantities({});
        return;
      }

      showToast({
        type: "error",
        message: res.message || "Something went wrong",
      });
    });
  };

  /* =========================
     🚀 FINAL FILTER (CATEGORY + WISHLIST + SEARCH)
  ========================= */
  const finalProducts = useMemo(() => {
    let data = products;

    if (activeCategory) {
      data = data.filter((p) =>
        p.slug.toLowerCase().startsWith(activeCategory.toLowerCase())
      );
    }

    if (wishlistProductIds.length > 0) {
      data = data.filter((p) => wishlistProductIds.includes(p.id));
    }

    if (debouncedSearch) {
      data = data.filter((p) =>
        (
          p.name +
          " " +
          p.sku
        ).toLowerCase().includes(debouncedSearch)
      );
    }

    return data;
  }, [products, activeCategory, wishlistProductIds, debouncedSearch]);

  /* ========================= */

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* FILTER BAR */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-600 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        <select
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select Wishlist</option>
        </select>

        <select className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="">Select Order</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-2 rounded bg-blue-600 px-4 py-2">
        <QuickOrderTopBar onCategorySelect={setActiveCategory} />

        <button
          onClick={openWishlistForBulk}
          className="bg-white text-blue-600 w-[200px] px-4 py-2 rounded text-sm font-medium border"
        >
          Add Wishlist ▾
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className="bg-white text-blue-600 w-[200px] px-4 py-2 rounded text-sm font-medium border"
        >
          Add to Cart
        </button>
      </div>

      {/* TABLE — UNCHANGED */}
      <div className="relative overflow-x-auto rounded">
        <table className="w-full text-sm border border-gray-300 border-collapse">
          <tbody>
            {finalProducts.map((p, index) => (
              <tr
                key={p.id}
                className="
                border-b
                odd:bg-white
                even:bg-[#F3F8FB]
                hover:bg-[#F3F8FB]
                transition
              "
              >
                <td className="border border-gray-300 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={!!selected[p.id]}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>

                <td className="border border-gray-300 px-3 text-gray-600">
                  {p.sku}
                </td>

                <td className="border border-gray-300 px-3 text-blue-700 font-medium">
                  <Image
                    src={p.mainImage || "/images/not-found.png"}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="inline-block mr-2 object-contain"
                  />
                  {p.name}
                </td>

                <td className="border border-gray-300 text-center text-gray-600">
                  EA
                </td>

                <td className="border border-gray-300 text-center font-semibold">
                  ${p.price ?? p.regular_price}
                </td>

                {/* TAB-ONLY FIELD */}
                <td className="border w-20 border-gray-300 text-center">
                <input
  type="text"
  inputMode="numeric"
  defaultValue={quantitiesRef.current[p.id] ?? ""}
  onInput={(e) => {
    quantitiesRef.current[p.id] = e.target.value.replace(/\D/g, "");
  }}
  className="
    w-full
    border border-gray-400
    px-2 py-1
    text-center
    bg-white
  "
/>

                </td>


                <td className="border border-gray-300 text-center relative">
                  <button
                    onClick={() =>
                      setActiveWishlistFor(
                        activeWishlistFor === p.id ? null : p.id
                      )
                    }
                    className="flex items-center justify-center w-full"
                  >
                    {activeWishlistFor === p.id ? (
                      <HeartSolid className="h-5 w-5 text-blue-600" />
                    ) : (
                      <HeartOutline className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                    )}
                  </button>

                  {activeWishlistFor === p.id && (
                    <WishlistDropdown
                      wishlists={wishlists.map((w) => ({
                        id: w.id,
                        name: w.title,
                      }))}
                      onSelect={handleWishlistSelect}
                      onCreate={handleCreateWishlist}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
