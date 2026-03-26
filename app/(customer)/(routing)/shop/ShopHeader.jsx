export default function ShopHeader({ count = 0 }) {
  return (
    <div className="relative mb-8 overflow-hidden border border-gray-200 bg-white">

      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14,165,233,.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,.25) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* SOFT GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)]" />

      {/* CONTENT */}
      <div className="relative py-16 text-center space-y-3">

        <p className="text-xs tracking-[0.25em] text-[#347eb3] font-medium">
          BROWSE OUR PRODUCTS
        </p>

        <h1 className="text-4xl md:text-6xl font-bold tracking-wide text-black">
          MOBILE ACCESSORIES
        </h1>

        <p className="text-sm text-gray-500">
          {count} products available
        </p>

      </div>
    </div>
  );
}