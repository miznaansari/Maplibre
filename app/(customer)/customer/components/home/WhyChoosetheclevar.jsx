import Link from "next/link";
import {
  GlobeAltIcon,
  BuildingStorefrontIcon,
  BoltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function WhyChoosetheclevar() {
  return (
    <section className="bg-[#111827] py-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl font-extrabold text-white">
              Why Choose Samad Agency?
            </h2>

            <div className="my-6 h-[2px] w-48 bg-[#347eb3]" />

            <div className="space-y-8">

              {/* ITEM 1 */}
              <div className="flex gap-4">
                <GlobeAltIcon className="h-7 w-7 text-[#38bdf8]" />
                <div>
                  <h4 className="font-semibold text-white">
                    Premium Quality Fabric
                  </h4>
                  <p className="mt-1 text-sm text-gray-300">
                    At Samad Agency, we never compromise with quality. Every
                    t-shirt and shirt is crafted with comfortable,
                    long-lasting premium fabric.
                  </p>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="flex gap-4">
                <BuildingStorefrontIcon className="h-7 w-7 text-[#38bdf8]" />
                <div>
                  <h4 className="font-semibold text-white">
                    Customize Your Style
                  </h4>
                  <p className="mt-1 text-sm text-gray-300">
                    Choose your own design, print, and style. We make your
                    clothing unique — designed exactly the way you want.
                  </p>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="flex gap-4">
                <BoltIcon className="h-7 w-7 text-[#38bdf8]" />
                <div>
                  <h4 className="font-semibold text-white">
                    Trend-Focused Designs
                  </h4>
                  <p className="mt-1 text-sm text-gray-300">
                    We follow modern fashion trends to bring you styles that
                    look fresh, confident, and premium.
                  </p>
                </div>
              </div>

              {/* ITEM 4 */}
              <div className="flex gap-4">
                <HeartIcon className="h-7 w-7 text-[#38bdf8]" />
                <div>
                  <h4 className="font-semibold text-white">
                    Made With Customer Love
                  </h4>
                  <p className="mt-1 text-sm text-gray-300">
                    Your satisfaction comes first. From design selection to
                    delivery, we ensure a smooth and reliable experience.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/shop"
              className="mt-10 inline-flex items-center gap-2 rounded-md bg-[#347eb3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#38bdf8] shadow-[0_0_20px_rgba(14,165,233,0.35)]"
            >
              Explore Collection →
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
