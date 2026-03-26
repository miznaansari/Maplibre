"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import {
  getWishlists,
  createWishlist,
  addProductsToWishlist,
  addToCartAction
} from "./action";

import WishlistDropdown from "./WishlistDropdown";
import { useToast } from "@/app/admin/context/ToastProvider";
import QuickOrderTopBar from "./QuickOrderTopBar";

export default function QuickOrderClient({ products, customerId }) {
  const { showToast } = useToast();
  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [activeWishlistFor, setActiveWishlistFor] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [wishlists, setWishlists] = useState([]);
  const priceRefs = useRef([]);
  useEffect(() => {
    getWishlists(customerId).then(setWishlists);
  }, [customerId]);

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

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addToCartAction({
        customerId,
        quantities,
      });

      if (res.success) {
        showToast({
          type: "success",
          message: "Products added to cart successfully",
        });
        setQuantities({});
      } else {
        showToast({
          type: "error",
          message: res.message || "Something went wrong",
        });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 rounded bg-blue-600 px-4 py-2">
        <QuickOrderTopBar />

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
            {products.map((p, index) => (
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
                  {p.name}
                </td>

                <td className="border border-gray-300 text-center text-gray-600">
                  EA
                </td>

                <td className="border border-gray-300 text-center font-semibold">
                  ${p.sale_price ?? p.regular_price}
                </td>

                {/* TAB-ONLY FIELD */}
                <td className="border border-gray-300 text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-20 rounded border border-gray-400 px-2 py-1 text-center bg-white"
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
