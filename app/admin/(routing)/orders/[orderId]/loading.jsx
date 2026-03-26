export default function Loading() {
  return (
     <div className="mx-auto max-w-5xl mt-4 md:mt-4 p-4  pt-0 max-w-6xl space-y-6 animate-pulse">

                {/* ================= HEADER ================= */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Orders <span className="text-blue-600">› Order Details</span>
                    </h2>

                    {/* <div className="h-8 w-36 bg-gray-200 rounded" /> */}

                </div>

                {/* ================= ORDER META ================= */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded p-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                            <div className="h-4 w-32 bg-gray-300 rounded" />
                        </div>
                    ))}
                </div>

                {/* ================= ADDRESSES + SUMMARY ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded p-6">

                    {/* Shipping */}
                    <div className="space-y-3">
                        <div className="h-4 w-36 bg-gray-300 rounded" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-3 w-full bg-gray-200 rounded" />
                        ))}
                    </div>

                    {/* Billing */}
                    <div className="space-y-3">
                        <div className="h-4 w-36 bg-gray-300 rounded" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-3 w-full bg-gray-200 rounded" />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        <div className="h-4 w-40 bg-gray-300 rounded" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-3 w-24 bg-gray-200 rounded" />
                                <div className="h-3 w-16 bg-gray-200 rounded" />
                            </div>
                        ))}
                        <div className="flex justify-between pt-3 border-t border-gray-200">
                            <div className="h-4 w-28 bg-gray-300 rounded" />
                            <div className="h-4 w-20 bg-gray-300 rounded" />
                        </div>
                    </div>
                </div>

                {/* ================= ORDER ITEMS ================= */}
                <div className="border border-gray-200 rounded ">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex justify-between p-4 border-b border-dashed border-gray-200">
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-gray-300 rounded" />
                                <div className="h-3 w-28 bg-gray-200 rounded" />
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
                                <div className="h-4 w-20 bg-gray-300 rounded ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= PAYPAL INFO ================= */}
                <div className="border border-gray-200 rounded p-4 space-y-2">
                    <div className="h-3 w-64 bg-gray-200 rounded" />
                    <div className="h-3 w-72 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-300 rounded" />
                </div>

            </div>
  );
}
