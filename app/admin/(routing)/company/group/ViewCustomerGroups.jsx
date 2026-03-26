"use client";

import DataTable from "../../../UI/common/DataTable";
import Pagination from "../../../UI/common/Pagination";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientFetch } from "@/lib/clientFetch";
import { updateCustomerGroup } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import Link from "next/link";
export default function ViewCustomerGroups({
  customers,
  pagination,
  searchParams,
  customerGroupsData = [], // ✅ default array
}) {
    console.log('customerGroupsData',customerGroupsData)
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
    key: "group_name",
    label: "Group Name",
    render: (g) => (
      <span className="font-medium text-gray-900">
        {g.group_name}
      </span>
    ),
  },
  {
    key: "customers",
    label: "Total Customers",
    align: "text-center",
    render: (g) => g._count?.customers ?? 0,
  },
  {
    key: "status",
    label: "Status",
    render: (g) =>
      g.is_active ? (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Active
        </span>
      ) : (
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
          Inactive
        </span>
      ),
  },
  {
    key: "created_at",
    label: "Created",
    render: (g) =>
      new Date(g.created_at).toLocaleDateString("en-GB"),
  },
  {
    key: "actions",
    label: "Action",
    render: (g) => (
      <div className="relative">
        <button
          onClick={() =>
            setOpenMenuId(openMenuId === g.id ? null : g.id)
          }
          className="text-xl text-gray-400 hover:text-gray-600"
        >
          ⋯
        </button>

        {openMenuId === g.id && (
          <div className="absolute right-0 z-10 mt-2 w-36 rounded border bg-white shadow z-90">
            <button
              onClick={() =>
                router.push(`/admin/customer-groups/view/${g.id}`)
              }
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              View
            </button>

            <button
              onClick={() => {
                setSelectedGroup(g);
                setOpenDelete(true);
                setOpenMenuId(null);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    ),
  },
];

  return (
    <div className="p-2">
    

      {/* Card */}
      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Customers Group
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your customers group
            </p>
          </div>
               <Link
            href="/admin/company/group/add"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
          >
            + Add Company
          </Link>
        </div>

        {/* Table */}
        <div className="px-0">
          <DataTable columns={columns} data={customerGroupsData} />
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-6 py-4">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            searchParams={searchParams}
            limits={[5, 10, 25, 50]}
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
