"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { useDeferredValue, useMemo } from "react";
export default function QuickOrderClient({ products, customerId }) {
  // console.log('customerIdcustomerId', customerId)
  const { showToast } = useToast();
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState({});
  const [wishlistProductIds, setWishlistProductIds] = useState([]); // ✅ NEW
  const [activeWishlistFor, setActiveWishlistFor] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null); // ✅ CATEGORY STATE
  const [isPending, startTransition] = useTransition();
  const [wishlists, setWishlists] = useState([]);
  const priceRefs = useRef([]);
  useEffect(() => {
    getWishlists(customerId).then(setWishlists);
  }, [customerId]);
  const categoryFilteredProducts = activeCategory
    ? products.filter((p) =>
      p.slug.toLowerCase().startsWith(activeCategory.toLowerCase())
    )
    : products;
  // mock wishlists (replace with DB)
  const handlePriceTab = (e, index) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const nextIndex = index + 1;
      if (priceRefs.current[nextIndex]) {
        priceRefs.current[nextIndex].focus();
      }
    }
  };


  const handleQtyChange = (id, value) => {
    setQuantities((p) => ({ ...p, [id]: value }));
  };

  const toggleSelect = (id) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  };

  /* =========================
     WISHLIST HANDLERS
  ========================= */
  const selectedProductIds = Object.keys(selected).filter(
    (id) => selected[id]
  );
  const deferredSearch = useDeferredValue(search);
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
      // bulk selected products
      items = selectedProductIds.map((productId) => ({
        productId: Number(productId),
        quantity: Number(quantities[productId]) > 0
          ? Number(quantities[productId])
          : 1, // ✅ default 1
      }));
    } else {
      // single heart click
      items = [
        {
          productId: activeWishlistFor,
          quantity: Number(quantities[activeWishlistFor]) > 0
            ? Number(quantities[activeWishlistFor])
            : 1, // ✅ default 1
        },
      ];
    }

    await addProductsToWishlist({
      wishlistId: wishlist.id,
      items,
    });

    setActiveWishlistFor(null);

    showToast({
      type: "success",
      message: "Added to wishlist",
    });
  };


  const handleCreateWishlist = async (name) => {
    const res = await createWishlist(customerId, name);

    if (res.success) {
      setWishlists((p) => [res.wishlist, ...p]);
      showToast({
        type: "success",
        message: "Wishlist created",
      });
    }
  };
  const { reloadCart } = useCart();

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addToCartAction({
        customerId,
        quantities,
      });

      // ✅ SUCCESS (logged in)
      if (res.success) {
        reloadCart();

        showToast({
          type: "success",
          message: "Products added to cart successfully",
        });
        setQuantities({});
        return;
      }

      // ❌ CUSTOMER NOT FOUND → STORE IN localStorage
      if (res.message === "Customer not found") {
        const existingCart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};

        const updatedCart = { ...existingCart };

        products.forEach((product) => {
          const qty = quantities[product.id];
          if (!qty || qty <= 0) return;

          if (updatedCart[product.id]) {
            updatedCart[product.id].quantity =
              Number(updatedCart[product.id].quantity) + Number(qty);

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

      // ❌ OTHER ERRORS
      showToast({
        type: "error",
        message: res.message || "Something went wrong",
      });
    });
  };



  const handleWishlistPrefill = async (wishlistId) => {
    if (!wishlistId) {
      setWishlistProductIds([]); // 🔄 show all again
      setQuantities({});
      return;
    }

    try {
      const wl = await getWishlistForPrefill(wishlistId, customerId);
      if (!wl || !wl.items?.length) return;

      const updatedQty = {};
      const ids = [];

      wl.items.forEach((item) => {
        updatedQty[item.product_list_id] = item.qty;
        ids.push(item.product_list_id);
      });

      setQuantities(updatedQty);
      setWishlistProductIds(ids); // ✅ FILTER TABLE

      showToast({
        type: "success",
        message: "Wishlist loaded",
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        message: "Failed to load wishlist",
      });
    }
  };

  const handleOrderPrefill = (orderId) => {
    if (!orderId) return;

    const order = orderLists.find((o) => o.id === Number(orderId));
    if (!order || !order.items) return;

    const updatedQty = {};

    order.items.forEach((item) => {
      updatedQty[item.product_list_id] = item.qty;
    });

    setQuantities(updatedQty);

    showToast({
      type: "success",
      message: "Quantities filled from previous order",
    });
  };
  const searchFilteredProducts = categoryFilteredProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const finalProducts = useMemo(() => {
    let list = products;

    // category filter
    if (activeCategory) {
      list = list.filter((p) =>
        p.slug.toLowerCase().startsWith(activeCategory.toLowerCase())
      );
    }

    // search filter (use deferred value)
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // wishlist filter
    if (wishlistProductIds.length > 0) {
      list = list.filter((p) => wishlistProductIds.includes(p.id));
    }

    return list;
  }, [products, activeCategory, deferredSearch, wishlistProductIds]);


  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Bar */}
      {/* FILTER BAR */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for Products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm
             focus:border-blue-600 focus:outline-none"
          />

          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Wishlist Select */}
        <select
          onChange={(e) => handleWishlistPrefill(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          defaultValue=""
        >
          <option value="">Select Wishlist</option>
          {wishlists.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>

        {/* Order Select */}
        <select
          onChange={(e) => handleOrderPrefill(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          defaultValue=""
        >
          <option value="">Select Order</option>
          {/* {orderLists.map((o) => (
      <option key={o.id} value={o.id}>
        Order #{o.id}
      </option>
    ))} */}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2 rounded bg-blue-600 px-4 py-2">
        <QuickOrderTopBar onCategorySelect={setActiveCategory} />

        <button
          onClick={openWishlistForBulk}
          className="bg-white text-blue-600 w-[200px] px-4 py-2 rounded text-sm font-medium border
             active:scale-95 active:opacity-90
             transition-transform duration-100
             disabled:opacity-50"
        >
          Add Wishlist ▾
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className="bg-white text-blue-600 w-[200px] px-4 py-2 rounded text-sm font-medium border
             active:scale-95 active:opacity-90
             transition-transform duration-100
             disabled:opacity-50"
        >
          Add to Cart
        </button>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto rounded">
        <table className="w-full text-sm border border-gray-300 border-collapse">

          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="border border-gray-300  px-2 py-2 text-center">
                <input type="checkbox" />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left">
                Product Code
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left">
                Product Name
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Unit
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Unit Price (Ex GST)
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                QTY
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Wishlist
              </th>
            </tr>
          </thead>


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
                  {/* <Image
                    src={p.mainImage || "/images/no-found.png"}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="inline-block mr-2 object-contain"
                  /> */}
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
                    type="number"
                    min="0"
                    className="
    w-full
    border border-gray-400
    px-2 py-1
    text-center
    bg-white
    focus:outline-none
    focus:ring-0
    focus:border-blue-500
  "
                    ref={(el) => (priceRefs.current[index] = el)}
                    onKeyDown={(e) => handlePriceTab(e, index)}
                    value={quantities[p.id] ?? ""}
                    onChange={(e) => handleQtyChange(p.id, e.target.value)}
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

        {/* Bulk wishlist dropdown */}
        {activeWishlistFor === "bulk" && (
          <div className="absolute right-4 top-14">
            <WishlistDropdown
              wishlists={wishlists}
              onSelect={handleWishlistSelect}
              onCreate={handleCreateWishlist}
            />
          </div>
        )}
      </div>
    </div>
  );
}
