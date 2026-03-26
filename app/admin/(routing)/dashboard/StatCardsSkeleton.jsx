function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="
            flex items-center gap-4
            bg-white
            border border-gray-200
            rounded-xl
            px-5 py-4
            shadow-sm
          "
        >
          {/* Icon Skeleton */}
          <div className="w-11 h-11 rounded-lg bg-gray-200 animate-pulse" />

          {/* Text Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-12 bg-gray-300 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}