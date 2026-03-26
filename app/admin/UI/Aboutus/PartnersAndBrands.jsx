import Image from "next/image";

export default function PartnersAndBrands() {
  const brands = [
    "/images/brands/panduit.png",
    "/images/brands/bandit.png",
    "/images/brands/eaton.png",
    "/images/brands/brady.png",
    "/images/brands/lpi.png",
    "/images/brands/jma.png",
    "/images/brands/wattmaster.png",
    "/images/brands/commscope.png",
    "/images/brands/nader.png",
    "/images/brands/ezystud.png",
    "/images/brands/nexans.png",
    "/images/brands/schneider.png",
    "/images/brands/prysmian.png",
    "/images/brands/cabac.png",
    "/images/brands/garland.png",
    "/images/brands/electra.png",
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* ================= GEMCELL SECTION ================= */}
        <div className="mb-20 rounded bg-[#eaf7fb] px-6 py-12 text-center">
          <div className="mx-auto mb-6 w-fit rounded bg-white px-6 py-3 shadow-sm">
            <Image
              src="/images/page/gemcel.png"
              alt="Gemcell Electrical Group"
              width={180}
              height={50}
            />
          </div>

          <h3 className="text-xl font-bold text-black">
            Proud Member of Gemcell
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-700">
            Samad Agency is a proud member of Gemcell Electrical Group — Australia’s
            largest electrical buying group.
            <br />
            <br />
            As part of the Gemcell network, we have access to leading national
            suppliers, competitive pricing, and the latest industry innovations —
            benefits we pass directly on to our customers.
            <br />
            <br />
            Our Gemcell membership strengthens our buying power, expands our
            product range, and ensures we remain aligned with the highest
            standards in the electrical and communications industry.
          </p>
        </div>

        {/* ================= DISTRIBUTOR BRANDS ================= */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black">Distributor Brands</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            Whether you’re working on a small install or a large-scale project,
            we make sure you have everything you need — under one roof.
            Distributor brands
          </p>
        </div>

        {/* BRANDS GRID */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((src, index) => (
            <div
              key={index}
              className="flex h-20 items-center justify-center rounded border border-gray-200 bg-white"
            >
              <Image
                src={src}
                alt="Distributor Brand"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
