"use client";

import DataTable from "../../UI/common/DataTable";
import Pagination from "../../UI/common/Pagination";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientFetch } from "@/lib/clientFetch";
import { updateCustomerGroup, updateCustomerPriceTier, customerBlockAction } from "./actions";
import { useToast } from "../../context/ToastProvider";
import ProductSearch from "../product/ProductSearch";
import ControlledAutoSelect from "./ControlledAutoSelect";
import { EllipsisVerticalIcon, NoSymbolIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import StatusToggle from "./StatusToggle";
export default function ViewCustomer({
  customers,
  pagination,
  searchParams,
  customerGroupsData
}) {
  const [loadingId, setLoadingId] = useState(null);

  // console.log('customerGroupsData',customerGroupsData)
  const { showToast } = useToast();
  const router = useRouter();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /* =========================
     TABLE COLUMNS
  ========================= */
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
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.is_blocked === false ? (
  <button
    onClick={async () => {
      try {
        setLoadingId(c.id); // 🔄 start loader
        await customerBlockAction(c.id);
        showToast({ type: "success", message: "Customer blocked successfully" });
      } finally {
        setLoadingId(null); // ✅ stop loader
      }
    }}
    disabled={loadingId === c.id}
    className="group relative cursor-pointer text-gray-500 hover:text-blue-600 disabled:opacity-50"
  >
    {loadingId === c.id ? (
      <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    ) : (
      <NoSymbolIcon className="h-5 w-5" />
    )}

    {/* Tooltip */}
    <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
      Block
    </span>
  </button>
) : (
  <button
    onClick={async () => {
      try {
        setLoadingId(c.id); // 🔄 start loader
        await customerBlockAction(c.id);
        showToast({ type: "success", message: "Customer unblocked successfully" });
      } finally {
        setLoadingId(null); // ✅ stop loader
      }
    }}
    disabled={loadingId === c.id}
    className="group relative text-red hover:text-blue-600 disabled:opacity-50"
  >
    {loadingId === c.id ? (
      <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    ) : (
      <NoSymbolIcon className="h-5 w-5 text-red-500" />
    )}

    {/* Tooltip */}
    <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
      Unblock
    </span>
  </button>
)}

          {/* Edit */}
          <button
            onClick={() => router.push(`/admin/customer/view/${c.id}`)}
            className="group relative text-gray-500 cursor-pointer hover:text-blue-600"
          >
            <PencilSquareIcon className="h-5 w-5" />

            {/* Tooltip */}
            <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              Edit
            </span>
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              setSelectedCustomer(c);
              setOpenDelete(true);
            }}
            className="group relative cursor-pointer text-gray-500 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />

            {/* Tooltip */}
            <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              Delete
            </span>
          </button>

        </div>
      ),
    }
    ,
    {
      key: "name",
      label: "Customer",
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {c.first_name} {c.last_name || ""}
          </span>
          <span className="text-xs text-gray-500">
            {c.email}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (c) => c.phone || "-",
    },

    {
      key: "price_tier",
      label: "Price Tier",
      render: (c) => (
        <ControlledAutoSelect
          key={`price-tier-${c.id}-${c.price_tier}`} // 🔑 IMPORTANT
          name="price_tier"
          initialValue={c.price_tier || ""}
          onSave={async (value) => {
            await updateCustomerPriceTier(c.id, value);
            showToast({ type: "success", message: "Price tier updated" });
          }}
          options={
            <>
              <option value="">No Tier</option>
              {Array.from({ length: 10 }).map((_, i) => {
                const t = `TIER_${i + 1}`;
                return (
                  <option key={t} value={t}>
                    Tier {i + 1}
                  </option>
                );
              })}
            </>
          }
        />
      ),
    }

    ,

    {
      key: "customer_group",
      label: "Customer Group",
      render: (c) => (
        <ControlledAutoSelect
          name="group_id"
          initialValue={c?.group?.id || ""}
          onSave={async (value) => {
            await updateCustomerGroup(c.id, value);
            showToast({ type: "success", message: "Customer group updated" });
          }}
          options={
            <>
              <option value="">No Group</option>
              {customerGroupsData.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.group_name}
                </option>
              ))}
            </>
          }
        />
      ),
    }
    ,
    {
      key: "status",
      label: "Status",
      render: (c) => <StatusToggle customer={c} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (c) =>
        new Date(c.created_at).toLocaleDateString("en-GB"),
    }

  ];

  return (
    <div className="p-2">


      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b gap-4 border-gray-200 px-2 py-1">
          <div className="w-full flex items-center ">

            <ProductSearch
              title="Customers List"
              searchPlaceholder="Search customer..."
              filters={[
                {
                  key: "status",
                  label: "Status",
                  type: "select",
                  showInline: true,
                  options: [
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ],
                },
                {
                  key: "is_blocked",
                  label: "Blocked",
                  type: "select",
                  showInline: true,
                  options: [
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ],
                },
                {
                  key: "group",
                  label: "Group",
                  type: "select",
                  showInline: false, // 👈 goes into 3-dot menu
                  options: [
                    { label: "Retail", value: "1" },
                    { label: "Wholesale", value: "2" },
                    { label: "VIP", value: "3" },
                  ],
                },

              ]}
            />

          </div>
          <Link
            href="/admin/customer/add"
            className="flex items-center w-28 md:w-50 justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
          >
            <span className="md:hidden">+ Add</span>
            <span className="hidden md:inline">+ Add Customer</span>
          </Link>

        </div>

        {/* Table */}
        <div className="px-0">
          <DataTable columns={columns} data={customers} />
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-0 py-0">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            searchParams={searchParams}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Customer
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Do you want to delete{" "}
              <span className="font-medium">
                {selectedCustomer?.first_name}
              </span>
              ?
              <br />
              This action cannot be undone.
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
                  await clientFetch(
                    `/admin/api/customers/${selectedCustomer.id}`,
                    { method: "DELETE" }
                  );

                  showToast({
                    type: "success",
                    message: "Customer deleted successfully",
                  });

                  router.refresh();
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
    </div>
  );
}