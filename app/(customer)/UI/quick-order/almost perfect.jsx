"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addToCartAction,
  getWishlists,
  createWishlist,
  addProductsToWishlist,
  getWishlistForPrefill,
  getOrderList,
  getOrderForPrefill,
} from "./action";

export default function QuickOrderClient({ products, customerId }) {
  /* =========================
     STATE
  ========================= */
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState({});
  const [checked, setChecked] = useState({});
  const [activeIds, setActiveIds] = useState(null);

  const [wishlists, setWishlists] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedWishlist, setSelectedWishlist] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");

  const qtyRefs = useRef({});

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    getWishlists(customerId).then(setWishlists);
    getOrderList(customerId).then(setOrders);
  }, [customerId]);

  /* =========================
     FILTERING (NAME ONLY)
  ========================= */
  const visibleProducts = useMemo(() => {
    let list = products;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (activeIds) {
      list = list.filter((p) => activeIds.has(p.id));
    }

    return list;
  }, [products, search, activeIds]);

  /* =========================
     PREFILL (WISHLIST / ORDER)
  ========================= */
  async function applyPrefill(type, id) {
    if (!id) return;

    const data =
      type === "wishlist"
        ? await getWishlistForPrefill(id, customerId)
        : await getOrderForPrefill(id, customerId);

    if (!data) return;

    const newQty = {};
    const idSet = new Set();

    data.items.forEach((i) => {
      newQty[i.product_list_id] = i.qty;
      idSet.add(i.product_list_id);
    });

    setQuantities(newQty);
    setChecked({});
    setActiveIds(idSet);
  }

  /* =========================
     TAB → NEXT QTY ONLY
  ========================= */
  function handleTab(e, productId) {
    if (e.key !== "Tab") return;

    e.preventDefault();

    const ids = visibleProducts.map((p) => p.id);
    const idx = ids.indexOf(productId);
    const next = ids[idx + 1];

    if (next && qtyRefs.current[next]) {
      qtyRefs.current[next].focus();
    }
  }

  /* =========================
     ADD TO CART
  ========================= */
  async function handleAddToCart() {
    const res = await addToCartAction({ customerId, quantities });
    if (res.success) alert("Added to cart");
  }

  /* =========================
     SAVE WISHLIST
  ========================= */
  async function handleSaveWishlist() {
    let wishlistId = selectedWishlist;

    if (!wishlistId) {
      const title = prompt("Wishlist name");
      if (!title) return;

      const res = await createWishlist(customerId, title);
      wishlistId = res.wishlist.id;
      setWishlists((w) => [res.wishlist, ...w]);
    }

    const items = Object.keys(checked)
      .filter((pid) => checked[pid] && Number(quantities[pid]) > 0)
      .map((pid) => ({
        productId: Number(pid),
        quantity: Number(quantities[pid]),
      }));

    if (!items.length) {
      alert("No items selected");
      return;
    }

    await addProductsToWishlist({ wishlistId, items });
    alert("Wishlist saved");
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-4">
      {/* CONTROLS */}
      <div className="flex gap-3 items-center">
        <input
          className="border px-3 py-2 w-64"
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-2 py-2"
          value={selectedWishlist}
          onChange={(e) => {
            setSelectedWishlist(e.target.value);
            setSelectedOrder("");
            applyPrefill("wishlist", e.target.value);
          }}
        >
          <option value="">Wishlist</option>
          {wishlists.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>

        <select
          className="border px-2 py-2"
          value={selectedOrder}
          onChange={(e) => {
            setSelectedOrder(e.target.value);
            setSelectedWishlist("");
            applyPrefill("order", e.target.value);
          }}
        >
          <option value="">Order List</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Add to Cart
        </button>

        <button
          onClick={handleSaveWishlist}
          className="bg-green-600 text-white px-4 py-2"
        >
          Save Wishlist
        </button>
      </div>

      {/* TABLE */}
      <div className="border max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th />
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th className="w-20">Qty</th>
            </tr>
          </thead>

          <tbody>
            {visibleProducts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!checked[p.id]}
                    onChange={(e) =>
                      setChecked((c) => ({
                        ...c,
                        [p.id]: e.target.checked,
                      }))
                    }
                  />
                </td>

                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>₹{p.price}</td>

                <td>
                  <input
                    ref={(el) => (qtyRefs.current[p.id] = el)}
                    type="number"
                    min="0"
                    defaultValue={quantities[p.id] || ""}
                    onBlur={(e) =>
                      setQuantities((q) => ({
                        ...q,
                        [p.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => handleTab(e, p.id)}
                    className="border w-16 px-1 text-center"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
