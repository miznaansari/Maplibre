import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* ================= ABOUT US HEADER ================= */}
      <section className="bg-[#f7f7fb] py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-4xl font-semibold text-black">About Us</div>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600">
            We pride ourselves on providing high quality products at competitive
            prices without losing sight of our clients individual needs
          </p>
        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      <section className="bg-[#eaf7fb] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* LEFT CONTENT */}
            <div>
              <h2 className="text-3xl font-bold text-black">Who we are</h2>

              {/* DIVIDER */}
              <div className="my-6 h-[2px] w-56 bg-black" />

              <div className="space-y-6 text-sm leading-relaxed text-gray-800">
                <p>
                  At Samad Agency, we’re proud to be a 100% Australian owned and
                  operated business, supplying high-quality electrical and
                  telecommunication solutions to clients across the country.
                  Whether you’re a contractor, project manager, or business
                  owner, we understand the importance of reliable supply, expert
                  support, and fast turnaround — and we’re here to deliver
                  exactly that.
                </p>

                <p>
                  Driven by integrity and a commitment to our customers, we’re
                  not just a supplier — we’re your project partner. Our clients
                  trust us because we’re responsive, fast, and genuinely
                  invested in helping them succeed. That’s the Samad Agency
                  difference.
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/shop"
                className="mt-8 inline-flex items-center gap-2 rounded bg-[#0099dd] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007fb8]"
              >
                Shop Now →
              </Link>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative h-[420px] w-full overflow-hidden rounded">
              <Image
                src="/images/page/about.png"
                alt="Samad Agency Warehouse"
                fill
                className="object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
