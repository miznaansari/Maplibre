export default function Loading() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      {/* ================= Header ================= */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-gray-200 rounded md:hidden" />
          <div className="h-9 w-24 bg-blue-200 rounded" />
        </div>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-3 flex gap-3"
          >
            {/* Left index */}
            <div className="h-6 w-6 bg-gray-200 rounded" />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded" />
              <div className="h-6 w-6 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {[
                "S.NO",
                "ACTION",
                "PRODUCT",
                "CATEGORY",
                "SLUG",
                "PRICE",
                "STOCK",
                "CREATED",
              ].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 10 }).map((_, row) => (
              <tr key={row} className="border-t border-gray-200">
                <td className="px-4 py-4">
                  <div className="h-4 w-6 bg-gray-200 rounded" />
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-6 w-20 bg-green-200 rounded-full" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= Footer ================= */}
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-14 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
