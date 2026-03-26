"use client";

import Link from "next/link";
import ProductSearch from "./ProductSearch";
import DataTable from "../../UI/common/DataTable";
import Pagination from "../../UI/common/Pagination";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { clientFetch } from "@/lib/clientFetch";
import { useToast } from "../../context/ToastProvider";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import StatusToggle from "./StatusToggle";
import ImageGallery from "react-image-gallery";

export default function ViewProduct({
  products,
  pagination,
  searchParams,
}) {
  // console.log('productsproducts',products)
  const { showToast } = useToast();
  const [openGallery, setOpenGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);


  const router = useRouter();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleImageClick = (product) => {
    const images =
      product.images?.map((img) => ({
        original: img.image_url,
        thumbnail: img.image_url,
      })) || [];

    setGalleryImages(images);
    setOpenGallery(true);
  };
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

          {/* Edit */}
          <Link
            href={`/admin/product/edit/${p.id}`}
            aria-label="Edit product"
            className="group relative rounded p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100"
          >
            <PencilSquareIcon className="h-5 w-5" />

            {/* Tooltip */}
            <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              Edit
            </span>
          </Link>

          {/* Delete */}
          <button
            onClick={() => {
              setSelectedProduct(p);
              setOpenDelete(true);
            }}
            className="group relative cursor-pointer rounded p-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
            aria-label="Delete product"
          >
            <TrashIcon className="h-5 w-5" />

            {/* Tooltip */}
            <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              Delete
            </span>
          </button>

        </div>
      ),
    }
    ,
    {
      key: "name",
      label: "Product",
      render: (p) => (
        <>
          <div className="flex items-center gap-3">
            <img src={p.images?.[0]?.image_url} alt=""
              className="min-w-12 h-12 object-cover rounded cursor-pointer hover:scale-105 transition"

              onClick={() => handleImageClick(p)}
            />
            <div className="">
            <span className="font-medium text-gray-900 text-md">
              {p.name}
            </span><br />
            <span className="font-small text-gray-500 text-xs">
              {p.sku}
            </span>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => p.category?.name || "-",
    },
    // {
    //   key: "slug",
    //   label: "Slug",
    //   render: (p) => p.slug || "-",
    // },
    {
      key: "regular_price",
      label: "Price",
      render: (p) => `₹${p.regular_price}`,
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => <StatusToggle id={row.id} isActive={row.is_active} />,
    },
    // {
    //   key: "stock",
    //   label: "Stock",
    //   render: (p) => {
    //     let label = "Stock";
    //     let bg = "bg-green-100 text-green-700";

    //     if (p.stock_qty === 0) {
    //       label = "Out of Stock";
    //       bg = "bg-red-100 text-red-700";
    //     } else if (
    //       p.low_stock_threshold !== null &&
    //       p.stock_qty <= p.low_stock_threshold
    //     ) {
    //       label = "Low ";
    //       bg = "bg-yellow-100 text-yellow-700";
    //     }

    //     return (
    //       <div className="relative group inline-block">
    //         <span
    //           className={`rounded-full px-2 py-1 text-xs font-medium ${bg}`}
    //         >
    //           {label}
    //         </span>

    //         {/* Tooltip */}

    //         <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
    //           Stock Qty: {p.stock_qty}

    //         </span>
    //       </div>
    //     );
    //   },
    // }
    // ,
    {
      key: "created_at",
      label: "Created",
      render: (p) =>
        new Date(p.created_at).toLocaleDateString("en-GB"),
    },

  ];
  return (
    <div className="p-2 w-full">


      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-gray-200 px-4 py-1 ">
          <div className="flex items-center gap-4 sm:flex-row sm:items-center justify-between">





            {/* Search */}
            <ProductSearch title="Products List" />




            {/* Add Product Button */}
            <Link
              href="/admin/product/add"
              className="flex items-center w-28 md:w-50 justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
            >
              <span className="md:hidden">+ Add</span>
              <span className="hidden md:inline">+ Add Product</span>
            </Link>

          </div>
        </div>



        {/* Table */}
        <div className="px-0">
          <DataTable columns={columns} data={products} />
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-0 py-0">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            searchParams={searchParams}
            limits={[10, 25, 50]}
          />
        </div>
      </div>
      {/* Delete Dialog */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Product
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Do you want to delete{" "}
              <span className="font-medium">
                {selectedProduct?.name}
              </span>
              ?
              <br />
              If you delete, all related data will be removed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpenDelete(false)}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={async () => {
                  console.log("Deleting:", selectedProduct);
                  const res = await clientFetch(`/admin/api/products/${selectedProduct.id}`, {
                    method: 'DELETE',
                  });

                  console.log('res', res)
                  // 🔥 REFRESH SERVER DATA
                  showToast({
                    type: "success",
                    message: "Product deleted successfully",
                  });
                  router.refresh();

                  // 🔥 CALL DELETE API HERE
                  setOpenDelete(false);
                }}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {openGallery && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-white p-0 rounded-lg max-w-3xl w-full relative">

            <button
              onClick={() => setOpenGallery(false)}
              className="absolute top-10 right-3 z-90 text-black text-xl"
            >
              ✕
            </button>

            <ImageGallery
              items={galleryImages}
              showPlayButton={false}
              showFullscreenButton={false}
            />
          </div>
        </div>
      )}
    </div>
  );

}
