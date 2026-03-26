"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getWishlists, createWishlist, deleteWishlistById } from "./action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import VisibilityChip from "./VisibilityChip";
import { useToast } from "../../context/ToastProvider";

export default function WishlistList({ onSelect, selectedId, search, setSearch }) {
  const [wishlists, setWishlists] = useState([]);
  const { showToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /* ===============================
     LOAD WISHLISTS
  =============================== */
  const loadWishlists = async () => {
    const data = await getWishlists();
    setWishlists(data);
  };

  useEffect(() => {
    loadWishlists();
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

  /* ===============================
     CREATE WISHLIST
  =============================== */
  const handleCreate = async (formData) => {
    startTransition(async () => {
      const res =  await createWishlist(formData);
      showToast({
        type: res ? "success" : "error",
        message: res.message || "Failed to create wishlist",
      });
      await loadWishlists();
    });
  };
  const handleDelete = async (e, wishlistId) => {
    e.stopPropagation();

    const confirmed = confirm("Are you sure you want to delete this wishlist?");
    if (!confirmed) return;

    const res = await deleteWishlistById(wishlistId);

    showToast({
      type: res.success ? "success" : "error",
      message: res.message,
    });

    if (res.success) {
      // refresh list after delete
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistId));
    }
  };

  return (
    <div className="border border-gray-200 rounded bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Wishlist Manager</h1>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search wishlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* CREATE */}
        <form action={handleCreate} className="flex gap-2 items-center">
          <input
            name="title"
            placeholder="Wishlist name"
            className="border border-gray-300 px-2 py-1 rounded"
            required
          />
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="is_public" />
            Public
          </label>
          <input type="hidden" name="admin_id" value="1" />
          <button
            disabled={isPending}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {/* TABLE */}
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
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
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
              {/* S.NO */}
              <td
                className="px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                {index + 1}
              </td>

              {/* ACTIONS */}
              <td
                className="px-3 py-2"
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
                    onClick={(e) => handleDelete(e, w.id)}
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
              <td className="px-3 py-2 font-medium">{w.title}</td>

              {/* VISIBILITY */}
              <td
                className="px-3 py-2 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <VisibilityChip
                  wishlistId={w.id}
                  initialStatus={w.is_public}
                />
              </td>

              {/* ITEMS */}
              <td className="px-3 py-2 text-center">
                {w.products?.length ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
