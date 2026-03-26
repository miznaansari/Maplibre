export default function Loading() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 animate-pulse">
      {/* ================= TOP CONTROLS ================= */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonInput />
      </div>

      {/* ================= CATEGORY (MOBILE) ================= */}
      <div className="md:hidden rounded-lg bg-blue-600 p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-blue-500 last:border-0 pb-2"
          >
            <div className="h-4 w-32 rounded bg-blue-400" />
            <div className="h-3 w-3 rounded-full bg-blue-300" />
          </div>
        ))}

        <div className="h-10 mt-3 rounded bg-white/80" />
      </div>

      {/* ================= CATEGORY (DESKTOP) ================= */}
      <div className="hidden md:flex items-center justify-between bg-[#E7F9FF] px-4 py-3 rounded">
        <div className="flex gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-20 rounded bg-[#00AEEF]" />
          ))}
        </div>

        <div className="flex gap-3">
          <div className="h-9 w-28 rounded bg-[#00AEEF]" />
          <div className="h-9 w-28 rounded bg-[#00AEEF]" />
        </div>
      </div>

      {/* ================= TABLE (DESKTOP) ================= */}
      <div className="hidden md:block border border-gray-300 overflow-hidden">
        {/* TABLE HEAD */}
        <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-300">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="px-3 py-3 border-r border-gray-300 last:border-r-0"
            >
              <div className="h-4 w-20 rounded bg-gray-300" />
            </div>
          ))}
        </div>

        {/* TABLE ROWS */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-7 border-b border-gray-300 last:border-0"
          >
            <Cell w="w-4" />
            <Cell w="w-24" />
            <Cell w="w-32" />
            <Cell w="w-10" />
            <Cell w="w-16" />
            <CellInput />
            <CellIcon />
          </div>
        ))}
      </div>

      {/* ================= PRODUCT LIST (MOBILE) ================= */}
      <div className="md:hidden space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="h-4 w-32 rounded bg-gray-300" />
            <div className="h-4 w-48 rounded bg-gray-200" />

            <div className="flex items-center justify-between">
              <div className="h-8 w-20 rounded bg-gray-200" />
              <div className="h-6 w-6 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function SkeletonInput() {
  return <div className="h-11 rounded bg-gray-200" />;
}

function Cell({ w }) {
  return (
    <div className="px-3 py-4 border-r border-gray-300 last:border-r-0">
      <div className={`h-4 ${w} rounded bg-gray-200`} />
    </div>
  );
}

function CellInput() {
  return (
    <div className="px-3 py-3 border-r border-gray-300">
      <div className="h-8 w-20 rounded bg-gray-200" />
    </div>
  );
}

function CellIcon() {
  return (
    <div className="px-3 py-3 flex justify-center">
      <div className="h-6 w-6 rounded-full bg-gray-200" />
    </div>
  );
}
