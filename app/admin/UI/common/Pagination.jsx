"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  searchParams = {},
  limits = [10, 20, 50, 100],
}) {
  const router = useRouter();

  const currentLimit =
    typeof searchParams.limit === "string"
      ? searchParams.limit
      : limits[0];

  const createParams = (newPage, newLimit) => {
    const params = new URLSearchParams({
      ...searchParams,
      page: newPage,
      ...(newLimit ? { limit: newLimit } : {}),
    });

    return `?${params.toString()}`;
  };

  const handleLimitChange = (e) => {
    router.push(createParams(1, e.target.value));
  };

  return (
    <div className="flex items-center justify-between p-4 text-sm">
      {/* Page info */}
      <span>
        Page {page} of {totalPages}
      </span>

      <div className="flex items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 ">Rows:</span>
          <select
            value={currentLimit}
            onChange={handleLimitChange}
            className="rounded  px-2 py-1 text-sm border border-gray-300"
          >
            {limits.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Prev / Next */}
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={createParams(page - 1)}
              className="rounded border border-gray-300 px-3 py-1"
            >
              Prev
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={createParams(page + 1)}
              className="rounded border border-gray-300 px-3 py-1"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
