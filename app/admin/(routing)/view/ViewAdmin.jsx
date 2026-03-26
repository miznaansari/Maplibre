"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { adminColumns } from "./columns";
import DataTable from "../../UI/common/DataTable";
import Pagination from "../../UI/common/Pagination";

export default function ViewAdmins({
  data,
  page,
  totalPages,
  searchParams,
}) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  return (
    <>
      <DataTable
        columns={adminColumns({
          router,
          setOpenDelete,
          setSelectedAdmin,
        })}
        data={data}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />

      {/* DELETE MODAL */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Admin
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Do you want to delete{" "}
              <span className="font-medium">
                {selectedAdmin?.name}
              </span>
              ?
              <br />
              This action cannot be undone.
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
                  await fetch(
                    `/admin/api/admins/${selectedAdmin.id}`,
                    { method: "DELETE" }
                  );

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
    </>
  );
}
