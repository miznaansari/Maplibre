"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-[#0f0f0f] py-20">

        {/* Glow */}
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-[#38bdf8]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-[#347eb3]/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">

          <p className="text-xs tracking-widest text-gray-500 uppercase">
            Samad Agency
          </p>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-white leading-tight">
            We Don’t Just Sell Clothes.
            <br />
            <span className="bg-gradient-to-r from-[#38bdf8] to-[#347eb3] bg-clip-text text-transparent">
              We Build Your Style.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm md:text-base text-gray-400">
            Minimal. Custom. Statement pieces.  
            Built for people who don’t follow trends — they create them.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151515] px-6 py-3 text-sm font-semibold text-white transition hover:border-[#38bdf8] hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]"
          >
            Explore Collection →
          </Link>

        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      <section className="bg-[#0f0f0f] py-20">

        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT TEXT */}
          <div className="space-y-6">

            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built for the <span className="text-[#38bdf8]">Next Generation</span>
            </h2>

            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              Samad Agency is not just a clothing brand — it’s a movement.
              We design pieces that reflect individuality, confidence, and modern street culture.
            </p>

            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              From custom prints to premium fits, every product is crafted
              to give you that perfect balance of comfort and statement.
            </p>

            <div className="flex gap-4 pt-4">
              <Link
                href="/shop"
                className="rounded-xl bg-gradient-to-r from-[#347eb3] to-[#0284c7] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]"
              >
                Shop Now
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-300 hover:border-[#38bdf8] hover:text-white"
              >
                Contact →
              </Link>
            </div>

          </div>

          {/* RIGHT VISUAL BLOCK */}
          <div className="relative">

            <div className="rounded-3xl bg-[#151515] border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

              <img src="/images/logo3.png" alt="Samad Agency Logo" className=" object-contain" />

            </div>

            {/* floating glow */}
            {/* <div className="absolute -top-10 -right-10 h-40 w-40 bg-[#38bdf8]/20 blur-3xl" /> */}

          </div>

        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="bg-[#0f0f0f] py-20">

        <div className="mx-auto max-w-6xl px-6 text-center">

          <h3 className="text-3xl font-bold text-white">
            Why People Choose <span className="text-[#38bdf8]">Clevar</span>
          </h3>

          <p className="mt-3 text-gray-400 text-sm">
            Not basic. Not boring. Built different.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* CARD */}
            {[
              {
                title: "Premium Feel",
                desc: "Top-tier fabrics with perfect fits and long-lasting comfort.",
              },
              {
                title: "Custom Game Strong",
                desc: "Create your own designs and wear something truly yours.",
              },
              {
                title: "Fast Delivery",
                desc: "Across India, quick and reliable shipping every time.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/10 bg-[#151515] p-6 text-left transition hover:border-[#38bdf8]"
              >
                {/* glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-[#38bdf8]/10 to-transparent rounded-2xl" />

                <h4 className="relative font-semibold text-white">
                  {item.title}
                </h4>

                <p className="relative mt-3 text-sm text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>
    </>
  );
}