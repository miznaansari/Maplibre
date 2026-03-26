export default function LoadingCheckout() {
  return (
    <div className="min-h-screen bg-white text-black px-4 py-6">

      {/* BACK */}
      <div className="mb-4 h-4 w-28 bg-gray-200 rounded animate-pulse" />

      {/* TITLE */}
      <div className="flex justify-center mb-6">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-center gap-6 mb-8">

        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">

            <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />

            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse hidden sm:block" />

            {step !== 3 && (
              <div className="w-20 h-[1px] bg-gray-200 hidden md:block" />
            )}

          </div>
        ))}

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {/* LEFT */}
        <div className="lg:col-span-2">

          <div className="rounded-xl border border-gray-200 bg-white p-6">

            {/* TITLE */}
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-6" />

            {/* ADDRESS CARD */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">

              <div className="flex justify-between items-center">

                <div className="space-y-2 w-full">

                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />

                  <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />

                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />

                </div>

                <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
              </div>

            </div>

            {/* BUTTON */}
            <div className="h-12 w-full bg-[#347eb3]/20 rounded-lg animate-pulse" />

          </div>

        </div>

        {/* RIGHT PRICE */}
        <div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">

            {/* TITLE */}
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />

            {/* SUBTOTAL */}
            <div className="flex justify-between mb-3">
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* SHIPPING */}
            <div className="flex justify-between mb-4">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* TOTAL */}
            <div className="flex justify-between mb-6">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#347eb3]/30 rounded animate-pulse" />
            </div>

            {/* SECURITY BADGE */}
            <div className="h-10 w-full bg-green-100 rounded-lg animate-pulse" />

          </div>

        </div>

      </div>

    </div>
  );
} 