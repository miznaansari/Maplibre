import Image from "next/image";

export default function Highlight() {
  return (
    <section className="py-0">
      <div className="mx-auto max-w-6xl px-2">
        <div className="grid items-center gap-6 md:grid-cols-5">

          {/* ITEM 1 */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/icons/delivery-box.svg"
              alt="Fast Shipping"
              width={32}
              height={32}
              className="mb-1"
            />
            <h4 className="text-sm font-semibold text-black">
              Fast Shipping
            </h4>
          </div>

          {/* DIVIDER */}
          <div className="hidden md:flex justify-center">
            <div className="h-10 w-px bg-blue-600" />
          </div>

          {/* ITEM 2 */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/icons/australia-wise.svg"
              alt="Australia-wide Delivery"
              width={32}
              height={32}
              className="mb-1"
            />
            <h4 className="text-sm font-semibold text-black">
              Australia-wide Delivery
            </h4>
          </div>

          {/* DIVIDER */}
          <div className="hidden md:flex justify-center">
            <div className="h-10 w-px bg-blue-600" />
          </div>

          {/* ITEM 3 */}
          <div className="flex flex-col items-center text-center">
            <svg
              className="mb-2 h-8 w-8 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a6.5 6.5 0 0113 0" />
            </svg>
            <h4 className="text-sm font-semibold text-black">
              Friendly Support
            </h4>
          </div>

        </div>
      </div>
    </section>
  );
}
