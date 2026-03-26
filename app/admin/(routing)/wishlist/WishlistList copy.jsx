"use client";

import { useEffect, useMemo, useState } from "react";
import { getWishlists } from "./action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function WishlistList({ onSelect, selectedId, search }) {
  const [wishlists, setWishlists] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getWishlists().then(setWishlists);
  }, []);

  /* ===============================
     SEARCH FILTER
  =============================== */
  const filtered = useMemo(() => {
    if (!search) return wishlists;
    const q = search.toLowerCase();
    return wishlists.filter((w) =>
      w.title.toLowerCase().includes(q)
    );
  }, [wishlists, search]);

  /* ===============================
     ROW CLICK
  =============================== */
  const handleRowClick = (id) => {
    onSelect?.(id);
    router.push(`/admin/wishlist/${id}`);
  };

  return (
    <div className="border border-gray-200 rounded bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left w-12">S.No</th>
            <th className="px-3 py-2 text-center w-32">Actions</th>

            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-center">Visibility</th>
            <th className="px-3 py-2 text-center">Items</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-gray-500"
              >
                No wishlists found
              </td>
            </tr>
          )}

          {filtered.map((w, index) => (
            <tr
              key={w.id}
              onClick={() => handleRowClick(w.id)}
              className={`cursor-pointer border-t border-gray-200 hover:bg-gray-50 ${selectedId === w.id ? "bg-gray-100" : ""
                }`}
            >
              {/* S.NO (NO CLICK) */}
              <td
                className="px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                {index + 1}
              </td>
             <td
  className="px-3 py-2 align-middle"
  onClick={(e) => e.stopPropagation()}
>
  <div className="flex items-center gap-2 whitespace-nowrap">
    {/* VIEW */}
    <Link
      href={`/admin/wishlist/${w.id}`}
      className="group relative rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
    >
      <EyeIcon className="h-5 w-5" />
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        View
      </span>
    </Link>

    {/* EDIT */}
    <Link
      href={`/admin/wishlist/${w.id}`}
      className="group relative rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
    >
      <PencilSquareIcon className="h-5 w-5" />
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        Edit
      </span>
    </Link>

    {/* DELETE */}
    <button
      className="group relative rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
    >
      <TrashIcon className="h-5 w-5" />
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        Delete
      </span>
    </button>
  </div>
</td>

              {/* NAME */}
              <td className="px-3 py-2 font-medium">
                {w.title}
              </td>

              {/* VISIBILITY */}
              <td className="px-3 py-2 text-center">
                {w.is_public ? "Public" : "Private"}
              </td>

              {/* ITEMS */}
              <td className="px-3 py-2 text-center">
                {w.products?.length ?? 0}
              </td>

              {/* ACTIONS (NO ROW CLICK) */}



            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
