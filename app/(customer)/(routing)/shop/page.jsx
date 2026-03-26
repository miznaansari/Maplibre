"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProductCard from "./ProductCard";
import FilterPanel from "./FilterPanel";
import SwipeableDrawer from "@/app/admin/UI/common/SwipeableDrawer";

import {
  FunnelIcon,
  Squares2X2Icon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import ShopHeader from "./ShopHeader";

export default function ShopPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [openFilter, setOpenFilter] = useState(false);

  const query = {
    category: params.get("category") || "",
    size: params.get("size") || "",
    sort: params.get("sort") || "",
    page: params.get("page") || 1,
  };

  const fetchProducts = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/shop/products?category=${query.category}&size=${query.size}&sort=${query.sort}&page=${query.page}`
    );

    const json = await res.json();

    setProducts(json.products);
    setMeta(json.meta);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [params.toString()]);

  const updateQuery = (key, value) => {
    router.push(
      `?${new URLSearchParams({
        ...query,
        [key]: value,
      })}`
    );
  };

  return (
    <div className="bg-white max-w-7xl mx-auto min-h-screen text-black">

      <ShopHeader count={products.length} />

      {/* CATEGORY TABS */}

      <div className="flex items-center p-2 gap-3 mb-6 overflow-x-auto">

        {["", "airpods", "charger", "data-cable", "handsfree", "neckband", "power-bank"].map((c) => {
          const active = query.category === c;

          return (
            <button
              key={c || "all"}
              onClick={() => updateQuery("category", c)}
              className={`px-4 py-2 text-xs rounded-full border whitespace-nowrap transition
                ${
                  active
                    ? "bg-[#347eb3] text-white border-[#347eb3]"
                    : "border-gray-300 text-gray-500 hover:border-[#347eb3] hover:text-black"
                }
              `}
            >
              {c || "ALL"}
            </button>
          );
        })}

      </div>

      {/* FILTER BAR */}

      <div className="rounded m-2 border border-gray-200 bg-gray-50 p-4 mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* LEFT */}

          <div className="flex items-center gap-4 flex-wrap">

            <p className="text-xs text-gray-500">
              Price Range: ₹0 - ₹3400
            </p>

            <div className="flex gap-2 flex-wrap">

              {["New", "Trending", "Bestseller", "Limited", "Sale"].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-500 hover:border-[#347eb3] hover:text-black cursor-pointer"
                >
                  {t}
                </span>
              ))}

            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            {/* SORT */}

            <select
              value={query.sort}
              onChange={(e) => updateQuery("sort", e.target.value)}
              className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#347eb3]"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price Low → High</option>
              <option value="price_desc">Price High → Low</option>
            </select>

            {/* FILTER BUTTON */}

            <button
              onClick={() => setOpenFilter(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#347eb3] text-[#347eb3] text-xs hover:bg-[#347eb3]/10 transition"
            >
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>

            {/* GRID / LIST ICON */}

            <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-black">
              <Squares2X2Icon className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-black">
              <Bars3Icon className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}

      <div className="grid p-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}

      </div>

      {/* PAGINATION */}

      <div className="flex justify-center mt-10 gap-2 flex-wrap">

        {[...Array(meta.totalPages || 1)].map((_, i) => {
          const active = Number(query.page) === i + 1;

          return (
            <button
              key={i}
              onClick={() => updateQuery("page", i + 1)}
              className={`px-3 py-1.5 text-sm rounded-lg transition
                ${
                  active
                    ? "bg-[#347eb3] text-white"
                    : "bg-white text-gray-500 border border-gray-300 hover:border-[#347eb3] hover:text-black"
                }
              `}
            >
              {i + 1}
            </button>
          );
        })}

      </div>

      {/* MOBILE FILTER */}

      <SwipeableDrawer
        open={openFilter}
        onClose={() => setOpenFilter(false)}
      >
        <FilterPanel query={query} />
      </SwipeableDrawer>

    </div>
  );
}