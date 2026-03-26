export default function Loading() {
  return (
    <div className="p-6 mt-10">
      {/* Card Wrapper */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-10 w-60 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded border border-gray-200">
          {/* Table Head */}
          <div className="grid grid-cols-7 gap-4 border-b border-gray-200 bg-gray-50 p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-7 gap-4 border-b border-gray-200 p-4 last:border-b-0"
            >
              {Array.from({ length: 7 }).map((_, col) => (
                <div
                  key={col}
                  className="h-4 w-full animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
