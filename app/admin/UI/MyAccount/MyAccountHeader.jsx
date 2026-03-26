export default function MyAccountHeader() {
  return (
   <div className="relative h-40 w-full overflow-hidden">
  {/* BACKGROUND IMAGE */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/page/my-account.jpg')",
    }}
  />

  {/* BLUE OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#0b5fa5]/90 to-[#2f8ecb]/90" />

  {/* CONTENT */}
  <div className="relative z-10 flex h-full flex-col items-center justify-center text-white text-center">
    <div className="text-3xl font-semibold">My Account</div>
    <p className="text-sm mt-1 opacity-90">
      Home / <span className="font-medium">My account</span>
    </p>
  </div>
</div>
  );
}
