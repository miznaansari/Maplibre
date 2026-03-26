import Image from "next/image";
import fs from "fs";
import path from "path";

export default function PartnersAndBrands() {
  /* =====================================
     READ LOGOS FROM public/client-logos
     Only files containing `_c`
  ===================================== */
  const logosDir = path.join(process.cwd(), "public/client-logos");

  const brands = fs
    .readdirSync(logosDir)
    .filter((file) => !file.includes("_c")) // remove _c and _cc files
    .sort()
    .map((file) => `/client-logos/${file}`);


  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* ================= GEMCELL SECTION ================= */}
        <div className="mb-20 rounded bg-[#e7f9ff] px-6 py-12 text-center">
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
          <h3 className="text-2xl font-bold text-black">Distributor brands</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            Whether you’re working on a small install or a large-scale project,
            we make sure you have everything you need — under one roof.
          </p>
        </div>

        {/* ================= BRANDS GRID ================= */}
       <div className="mt-16">
  {/* Row 1 */}
  <div className="grid grid-cols-6 justify-items-center">
    {brands.slice(0, 6).map((src, index) => (
      <Logo key={index} src={src} />
    ))}
  </div>

  {/* Row 2 */}
  <div className="grid grid-cols-6 justify-items-center">
    {brands.slice(6, 12).map((src, index) => (
      <Logo key={index} src={src} />
    ))}
  </div>

  {/* Row 3 (centered) */}
  <div className="flex justify-center">
    <div className="grid grid-cols-6 justify-items-center">
      <div></div>
      {brands.slice(12).map((src, index) => (
        <Logo key={index} src={src} />
      ))}
    </div>
  </div>
</div>






      </div>
    </section>
  );
}
function Logo({ src }) {
  return (
    <img
      src={src}
      alt="brand"
      className="block"
      draggable={false}
    />
  );
}
