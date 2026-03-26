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

  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [activeWishlistFor, setActiveWishlistFor] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [isPending, startTransition] = useTransition();

  /* =========================
     🔍 SEARCH (PERFORMANCE SAFE)
  ========================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 300); // ✅ debounce delay

    return () => clearTimeout(t);
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
        quantity: Number(quantities[productId]) > 0 ? Number(quantities[productId]) : 1,
      }));
    } else {
      items = [{
        productId: activeWishlistFor,
        quantity: Number(quantities[activeWishlistFor]) > 0 ? Number(quantities[activeWishlistFor]) : 1,
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

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addToCartAction({ customerId, quantities });

      if (res.success) {
        reloadCart();
        showToast({ type: "success", message: "Products added to cart successfully" });
        setQuantities({});
        return;
      }

      if (res.message === "Customer not found") {
        const existingCart = JSON.parse(localStorage.getItem("guest_cart")) || {};
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
        showToast({ type: "info", message: "Saved to cart. Login to continue" });
        setQuantities({});
        return;
      }

      showToast({ type: "error", message: res.message || "Something went wrong" });
    });
  };

  /* =========================
     🚀 OPTIMIZED FILTER PIPELINE
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
        `${p.name} ${p.sku}`.toLowerCase().includes(debouncedSearch)
      );
    }

    return data;
  }, [products, activeCategory, wishlistProductIds, debouncedSearch]);

  /* ========================= */

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
          onChange={(e) => handleWishlistPrefill(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="">Select Wishlist</option>
          {wishlists.map((w) => (
            <option key={w.id} value={w.id}>{w.title}</option>
          ))}
        </select>

        <select className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="">Select Order</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="relative overflow-x-auto rounded">
        <table className="w-full text-sm border border-gray-300">
          <tbody>
            {finalProducts.map((p, index) => (
              <tr key={p.id} className="odd:bg-white even:bg-[#F3F8FB]">
                <td className="border px-3">{p.sku}</td>
                <td className="border px-3">{p.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
