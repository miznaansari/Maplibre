export default function ServiceHighlights() {
  return (
    <section className=" py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-8 md:grid-cols-5">

          {/* ITEM 1 */}
          <div className="flex flex-col items-center text-center">
            <svg
              className="mb-4 h-10 w-10 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M21 16V8a2 2 0 00-1-1.73L13 2.27a2 2 0 00-2 0L4 6.27A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>

            <h4 className="font-semibold text-black">Instant Dispatch</h4>
            <p className="mt-1 text-sm text-gray-600">
              Ships same day subject to availability
            </p>
          </div>

          {/* DIVIDER */}
          <div className="hidden md:flex justify-center">
            <div className="h-14 w-[1px] bg-blue-600" />
          </div>

          {/* ITEM 2 */}
          <div className="flex flex-col items-center text-center">
            <svg
              className="mb-4 h-10 w-10 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 7h13v10H3z" />
              <path d="M16 10h5l-2 3h-3z" />
            </svg>

            <h4 className="font-semibold text-black">
              Australia-wide Delivery
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Fast, reliable, nationwide shipping
            </p>
          </div>

          {/* DIVIDER */}
          <div className="hidden md:flex justify-center">
            <div className="h-14 w-[1px] bg-blue-600" />
          </div>

          {/* ITEM 3 */}
          <div className="flex flex-col items-center text-center">
            <svg
              className="mb-4 h-10 w-10 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a6.5 6.5 0 0113 0" />
            </svg>

            <h4 className="font-semibold text-black">Friendly Support</h4>
            <p className="mt-1 text-sm text-gray-600">
              Here to help anytime
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
