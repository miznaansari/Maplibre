import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-white via-[#f8efe6] to-[#eef6fb]">
      <div className=" px-0 pr-0 py-0">
        <div className=" relative py-20">

          {/* LEFT CONTENT */}
          <div className="ml-10 md:ml-20 z-90">
            <div className="text-4xl font-semibold leading-tight text-black md:text-5xl">
              Your Partner for Tailored <br />
              Electrical Solutions
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-700">
              Fast-growing and customer-focused, Samad Agency goes beyond the
              shelves to source, supply, or custom order the right electrical
              products for you — no matter how unique your needs.
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-2 rounded
                         bg-[#347eb3] px-6 py-3 text-sm font-medium
                         text-white transition hover:bg-sky-600"
            >
              Shop Now
              <span className="text-lg">→</span>
            </Link>
          </div>

          {/* RIGHT IMAGE */}
          <div className="absolute   top-[-100] right-0 flex justify-center md:justify-end">
            <Image
              src="/images/product/product1.png"
              alt="Stainless steel cable ties"
              width={700}
              height={400}
              priority
              className="w-full h-150 rounded hidden md:block -scale-x-100"
            />



          </div>

        </div>
      </div>
    </section>
  );
}
