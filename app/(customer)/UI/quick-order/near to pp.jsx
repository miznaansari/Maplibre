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
  const [wishlists, setWishlists] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedWishlist, setSelectedWishlist] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [activeFilterIds, setActiveFilterIds] = useState(null);

  const qtyRefs = useRef({});

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    getWishlists(customerId).then(setWishlists);
    getOrderList(customerId).then(setOrders);
  }, [customerId]);

  /* =========================
     SEARCH FILTER (NAME ONLY)
  ========================= */
  const visibleProducts = useMemo(() => {
    let list = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (activeFilterIds) {
      list = list.filter((p) => activeFilterIds.has(p.id));
    }

    return list;
  }, [products, search, activeFilterIds]);

  /* =========================
     PREFILL HANDLER
  ========================= */
  async function applyPrefill(type, id) {
    const data =
      type === "wishlist"
        ? await getWishlistForPrefill(id, customerId)
        : await getOrderForPrefill(id, customerId);

    if (!data) return;

    const map = {};
    const idSet = new Set();

    data.items.forEach((i) => {
      map[i.product_list_id] = i.qty;
      idSet.add(i.product_list_id);
    });

    setQuantities(map);
    setActiveFilterIds(idSet);
  }

  /* =========================
     TAB KEY → NEXT QTY ONLY
  ========================= */
  function handleTab(e, productId) {
    if (e.key !== "Tab") return;
    e.preventDefault();

    const ids = visibleProducts.map((p) => p.id);
    const idx = ids.indexOf(productId);
    const nextId = ids[idx + 1];

    if (nextId && qtyRefs.current[nextId]) {
      qtyRefs.current[nextId].focus();
    }
  }

  /* =========================
     ADD TO CART
  ========================= */
  async function handleAddToCart() {
    await addToCartAction({
      customerId,
      quantities,
    });
    alert("Added to cart");
  }

  /* =========================
     ADD TO WISHLIST
  ========================= */
  async function handleWishlistSave() {
    let wishlistId = selectedWishlist;

    if (!wishlistId) {
      const title = prompt("Enter wishlist name");
      if (!title) return;

      const res = await createWishlist(customerId, title);
      wishlistId = res.wishlist.id;
      setWishlists((w) => [res.wishlist, ...w]);
    }

    const items = Object.entries(checked)
      .filter(([_, v]) => v)
      .map(([pid]) => ({
        productId: Number(pid),
        quantity: Number(quantities[pid] || 0),
      }))
      .filter((i) => i.quantity > 0);

    await addProductsToWishlist({ wishlistId, items });
    alert("Wishlist saved");
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-4">
      {/* TOP BAR */}
      <div className="flex gap-3">
        <input
          className="border px-3 py-2 w-64"
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-2"
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
          className="border px-2"
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

        <button onClick={handleAddToCart} className="bg-blue-600 text-white px-4">
          Add to Cart
        </button>

        <button
          onClick={handleWishlistSave}
          className="bg-green-600 text-white px-4"
        >
          Save Wishlist
        </button>
      </div>

      {/* TABLE */}
      <div className="border max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100">
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
                      setChecked({ ...checked, [p.id]: e.target.checked })
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
                    className="border w-16 px-1 text-center"
                    value={quantities[p.id] || ""}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [p.id]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => handleTab(e, p.id)}
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
