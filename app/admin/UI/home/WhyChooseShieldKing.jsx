import Image from "next/image";
import Link from "next/link";
import {
  GlobeAltIcon,
  BuildingStorefrontIcon,
  BoltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function WhyChoosetheclevar() {
  return (
    <section className="bg-[#eaf7fb] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl font-extrabold text-black">
              Why Choose Samad Agency?
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
                    Samad Agency is proudly Australian — delivering trusted
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
                    Why deal with 10 suppliers? At Samad Agency, everything’s
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
              href="/shop"
              className="mt-10 inline-flex items-center gap-2 rounded bg-[#0099dd] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007fb8]"
            >
              Shop Now  →
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
