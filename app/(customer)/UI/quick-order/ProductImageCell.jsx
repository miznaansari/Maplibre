"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductImageCell({
  src,
  alt = "Product image",
  loadingDetails = false,
}) {
  const [open, setOpen] = useState(false);
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsHoverDevice(media.matches);

    const handler = (e) => setIsHoverDevice(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={isHoverDevice ? () => setOpen(true) : undefined}
      onMouseLeave={isHoverDevice ? () => setOpen(false) : undefined}
      onClick={!isHoverDevice ? () => setOpen((p) => !p) : undefined}
    >
      {/* ===== THUMBNAIL ===== */}
      <div className="relative w-7 aspect-square overflow-hidden rounded border border-gray-200 bg-white cursor-pointer">
        {loadingDetails ? (
          <span className="absolute inset-0 bg-gray-200 animate-pulse" />
        ) : (
          <img
  src={src || "/images/not-found.png"}
  alt={alt}
  className="w-full h-full object-cover"
/>

        )}
      </div>

      {/* ===== PREVIEW ===== */}
      {open && src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* invisible backdrop (fixes white screen issue) */}
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-[300px] h-[300px] bg-white rounded  shadow-lg p-2">
          <img
  src={src}
  alt={alt}
  className="object-fit w-full h-full"
/>

          </div>
        </div>
      )}
    </div>
  );
}
