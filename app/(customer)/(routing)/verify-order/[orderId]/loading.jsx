export default function Loading() {
  return (
  <div className="min-h-screen bg-[#0f0f0f] text-white px-4 md:px-8 py-6 space-y-6">

      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] p-6">

        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-60 w-60 bg-[#38bdf8]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 bg-[#a78bfa]/20 blur-3xl" />

        <div className="relative z-10 flex justify-between items-center">

          <div className="space-y-3">
            <div className="h-3 w-28 rounded bg-white/10 shimmer" />
            <div className="h-5 w-56 rounded bg-white/10 shimmer" />
            <div className="h-3 w-40 rounded bg-white/10 shimmer" />
          </div>

          <div className="text-right space-y-2">
            <div className="h-6 w-16 rounded-full bg-[#22c55e]/20 shimmer" />
            <div className="h-4 w-20 rounded bg-white/10 shimmer" />
          </div>

        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= ITEMS ================= */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#151515]">

          <div className="p-4 border-b border-white/10">
            <div className="h-4 w-24 bg-white/10 rounded shimmer" />
          </div>

          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-white/5">

              <div className="flex gap-3 items-center">
                <div className="h-14 w-14 rounded-lg bg-white/10 shimmer" />

                <div className="space-y-2">
                  <div className="h-4 w-40 bg-white/10 rounded shimmer" />
                  <div className="h-3 w-24 bg-white/10 rounded shimmer" />
                </div>
              </div>

              <div className="h-4 w-16 bg-white/10 rounded shimmer" />
            </div>
          ))}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="rounded-2xl border border-white/10 bg-[#151515] p-5 space-y-4">

          <div className="h-4 w-32 bg-white/10 rounded shimmer" />

          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 bg-white/10 rounded shimmer" />
              <div className="h-3 w-16 bg-white/10 rounded shimmer" />
            </div>
          ))}

          <div className="border-t border-white/10 pt-3 flex justify-between">
            <div className="h-4 w-24 bg-white/10 rounded shimmer" />
            <div className="h-4 w-20 bg-[#38bdf8]/20 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* ================= ACCORDION (ADDRESS) ================= */}
      <div className="space-y-4">

        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-[#151515] p-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-white/10 rounded shimmer" />
              <div className="h-4 w-4 bg-white/10 rounded shimmer" />
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}