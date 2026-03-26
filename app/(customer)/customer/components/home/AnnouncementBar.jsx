"use client";

export default function AnnouncementBar() {
  const text =
    "WHOLESALE MOBILE ACCESSORIES ★ AIRPODS ★ CHARGERS ★ DATA CABLES ★ HANDSFREE ★ NECKBANDS ★ POWER BANKS ★ PAN INDIA DELIVERY ★";

  return (
    <div className="w-full overflow-hidden bg-gray-100 border-b border-gray-200 text-black text-[11px] md:text-xs font-semibold uppercase tracking-[0.25em]">
      
      <div className="flex w-max whitespace-nowrap animate-marquee py-2">
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
      </div>

    </div>
  );
}