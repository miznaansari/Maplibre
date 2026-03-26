import Image from "next/image";
import Link from "next/link";
import {
  GlobeAltIcon,
  BuildingStorefrontIcon,
  BoltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function WhyChooseShieldKing() {
  return (
    <section className=" py-16 pb-0 mx-6 mx-auto max-w-7xl  ">
      <div className="bg-[#eaf7fb] mx-0 md:mx-6 px-6 md:p-[45px] py-17 rounded-t-lg">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl font-extrabold text-black">
              Why Choose Shield King?
            </h2>

            <div className="my-6 h-[2px] w-48 bg-black" />

            <div className="space-y-8">
              {/* ITEM 1 */}
              <div className="flex gap-4">
                <GlobeAltIcon className="h-7 w-7 text-black" />
                <div>
                  <h4 className="font-semibold text-black">
                    100% Australian Owned & Operated
                  </h4>
                  <p className="mt-1 text-sm text-gray-700">
                    Shield King is proudly Australian — delivering trusted
                    electrical and telecom solutions with local expertise.
                  </p>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="flex gap-4">
                <BuildingStorefrontIcon className="h-7 w-7 text-black" />
                <div>
                  <h4 className="font-semibold text-black">
                    Your One-Stop Shop
                  </h4>
                  <p className="mt-1 text-sm text-gray-700">
                    Why deal with 10 suppliers? At Shield King, everything’s
                    under one roof — so your project runs faster and smoother
                    saving you time, hassle and stress.
                  </p>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="flex gap-4">
                <BoltIcon className="h-7 w-7 text-black" />
                <div>
                  <h4 className="font-semibold text-black">
                    Fast Label Printing
                  </h4>
                  <p className="mt-1 text-sm text-gray-700">
                    We deliver high-quality label printing with rapid 3–4 hour
                    turnaround — speed you won’t find anywhere else.
                  </p>
                </div>
              </div>

              {/* ITEM 4 */}
              <div className="flex gap-4">
                <HeartIcon className="h-7 w-7 text-black" />
                <div>
                  <h4 className="font-semibold text-black">
                    Customer-First Approach
                  </h4>
                  <p className="mt-1 text-sm text-gray-700">
                    We believe in building relationships, not just transactions
                    — helping you find the right product, at the right price,
                    with the right support.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/quick-order"
              className="mt-10 inline-flex items-center gap-2 rounded bg-[rgb(var(--primary))] text-[rgb(var(--text))]  px-6 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(var(--hover))]"
            >
              Shop Now →
            </Link>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative h-50 md:h-[420px] w-full overflow-hidden rounded">
            <img
              src="/images/product/Shield.webp"
              alt="Telecom Infrastructure"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
