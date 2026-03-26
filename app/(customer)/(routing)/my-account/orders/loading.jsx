export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6 text-gray-900">

      {/* ================= HEADER ================= */}
      <div className="space-y-2">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* ================= MOBILE LIST ================= */}
      <div className="space-y-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm"
          >
            {/* Top Row */}
            <div className="flex justify-between items-center">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-14 rounded-full bg-blue-100 animate-pulse" />
            </div>

            {/* Total */}
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />

            {/* Bottom */}
            <div className="flex justify-between items-center">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm"
          >

            {/* Soft Glow */}
            <div className="absolute -top-16 -right-16 h-40 w-40 bg-blue-100 blur-3xl" />

            {/* Status */}
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-green-100 animate-pulse" />
            </div>

            {/* Order ID */}
            <div className="space-y-2">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Total */}
            <div className="space-y-1">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-28 bg-blue-100 rounded animate-pulse" />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}