"use client";

import Link from "next/link";
import DataTable from "../common/DataTable";
import Pagination from "../common/Pagination";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { deleteCategory } from "./action";
import { useToast } from "../../context/ToastProvider";
import ProductSearch from "../../(routing)/product/ProductSearch";
import { useRouter } from "next/navigation";

export default function ViewCategory({
  categories = [],
  pagination = {},
  searchParams = {},
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  console.log("CATEGORIES →", categories);
  console.log("PAGINATION →", pagination);
  console.log("SEARCH PARAMS →", searchParams);

  const columns = [
    {
      key: "sno",
      label: "S.No",
      align: "text-center",
      render: (_, index) => index + 1,
    },
    {
      key: "actions",
      label: "Action",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/category/edit/${p.id}`}
            className="rounded p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Link>

          <button
            onClick={() => {
              setSelectedCategory(p);
              setOpenDelete(true);
            }}
            className="rounded p-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
    {
      key: "name",
      label: "Category Name",
      render: (c) => c.name,
    },
    {
      key: "path",
      label: "Path",
      render: (c) => c.path || "-",
    },
    {
      key: "product_count",
      label: "Product Count",
      render: (c) => c.product_count || 0,
    },
    {
      key: "meta_title",
      label: "Meta Title",
      render: (c) => c.seo?.meta_title || "-",
    },
    {
      key: "meta_description",
      label: "Meta Description",
      render: (c) => c.seo?.meta_description || "-",
    },
    {
      key: "created_at",
      label: "Created",
      render: (c) =>
        c.created_at
          ? new Date(c.created_at).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <div className="p-2">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b gap-2 pr-2 border-gray-200 ">
          <ProductSearch
            title="Product Categories"
            searchPlaceholder="Search categories..."
          />

          <Link
            href="/admin/category/add"
                         className="flex items-center w-28 md:w-50 justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
 >
            + Add Category
          </Link>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={categories} />

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="border-t border-gray-200 ">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              searchParams={searchParams}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete Category</h3>

            <p className="mt-2 text-sm text-gray-600">
              Do you want to delete{" "}
              <span className="font-medium">
                {selectedCategory?.name}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpenDelete(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                No
              </button>

              <button
                onClick={async () => {
                  const res = await deleteCategory(selectedCategory.id);

                  showToast({
                    type: res.success ? "success" : "error",
                    message:
                      res.message ||
                      (res.success
                        ? "Category deleted successfully"
                        : "Failed to delete category"),
                  });

                  router.refresh();
                  setOpenDelete(false);
                }}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
