export default function Loading() {
  return (
    <div className="mx-auto bg-white max-w-7xl px-4 py-8">

      {/* TITLE */}
      <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />

      {/* CATEGORY GRID */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>

    </div>
  );
}