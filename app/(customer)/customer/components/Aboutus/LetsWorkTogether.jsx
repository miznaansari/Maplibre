import Image from "next/image";
import Link from "next/link";

export default function CustomDesignSection() {
  return (
    <section className="py-16 px-2 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 
        bg-gradient-to-br from-[#020617] via-[#020617] to-[#1a0015] p-8 md:p-14">

          {/* glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"/>
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl"/>

          <div className="relative grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT CONTENT */}
            <div className="text-center md:text-left">

              <p className="text-green-400 text-xs tracking-widest font-semibold">
                MAKE IT YOURS
              </p>

              <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-white leading-tight">
                DESIGN YOUR
                <br />
                <span className="text-cyan-400">
                  OWN PIECE
                </span>
              </h2>

              <p className="mt-6 text-gray-400 max-w-md mx-auto md:mx-0 text-sm md:text-base leading-relaxed">
                Upload your design, choose your garment, pick your colors.
                We print and ship within 5–7 business days.
                Minimum 1 piece. Maximum flex.
              </p>

              <Link
                href="/custom"
                className="inline-flex items-center gap-2 mt-8 px-7 py-3 
                rounded-xl text-white font-semibold text-sm
                bg-gradient-to-r from-pink-500 to-fuchsia-600
                hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]
                transition-all duration-300"
              >
                START DESIGNING →
              </Link>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">

              <div className="rounded-xl  overflow-hidden">
                <img
                  src="/model/custom-shirt.jpg"
                  alt="Custom T-Shirt"
                  width={300}
                  height={200}
                  className=" w-full h-38 md:h-100 object-cover"
                />
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}