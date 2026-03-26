import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative min-h-[100dvh] md:min-h-[90dvh] flex items-center justify-center overflow-hidden bg-[#0f0f0f]">

      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <Image
          src="/model/mode4.png"
          alt="Model"
          fill
          priority
          className="object-cover object-center opacity-40"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90"></div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-center max-w-4xl px-6">

        {/* SMALL TAG */}
        <div className="inline-flex items-center px-4 py-1 rounded-full 
                        border border-cyan-400/40 text-cyan-300 text-xs 
                        tracking-widest mb-6 backdrop-blur-md">
          ⚡ 2026 DROP IS HERE
        </div>

        {/* TITLE */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
          WEAR THE
          <br />
          <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]">
            VOID
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-6 text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
          GenZ Alpha Streetwear. Custom Tees. Heavy Hoodies. Oversized Drip.
          Built for those who exist beyond the algorithm.
        </p>

        {/* BUTTONS */}
        <div className="mt-10 flex items-center justify-center gap-4">

          <Link
            href="/shop"
            className="px-8 py-3 rounded-xl bg-cyan-400 text-black font-semibold
                       hover:bg-cyan-300 transition
                       shadow-[0_0_25px_rgba(34,211,238,0.5)]"
          >
            SHOP NOW →
          </Link>

          <Link
            href="/custom"
            className="px-8 py-3 rounded-xl border border-pink-500
                       text-pink-400 font-semibold
                       hover:bg-pink-500/10 transition
                       shadow-[0_0_20px_rgba(236,72,153,0.5)]"
          >
            CUSTOM ORDER
          </Link>

        </div>

        {/* STATS */}
        <div className="mt-14 flex items-center justify-center gap-10 text-gray-300 text-sm">

          <div>
            <p className="text-xl font-bold text-white">50K+</p>
            <p className="text-gray-400 text-xs">CUSTOMERS</p>
          </div>

          <div>
            <p className="text-xl font-bold text-white">4.9★</p>
            <p className="text-gray-400 text-xs">RATING</p>
          </div>

          <div>
            <p className="text-xl font-bold text-white">200+</p>
            <p className="text-gray-400 text-xs">DESIGNS</p>
          </div>

        </div>

      </div>
    </section>
  );
}