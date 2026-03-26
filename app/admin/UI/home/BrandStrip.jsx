"use client";

import { useRef } from "react";
import Image from "next/image";

export default function BrandStrip({ brands = [] }) {
  const sliderRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

  const onMouseDown = (e) => {
    isDown = true;
    startX = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft = sliderRef.current.scrollLeft;
  };

  const onMouseLeave = () => (isDown = false);
  const onMouseUp = () => (isDown = false);

  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full bg-white py-6">
      <div
        ref={sliderRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className="mx-auto max-w-7xl px-6 overflow-x-auto cursor-grab active:cursor-grabbing"
      >
        <div className="flex w-max items-center gap-12 select-none">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex h-35 w-40 items-center justify-center grayscale hover:grayscale-0 transition"
            >
              <Image
                src={brand.path}
                alt={brand.alt}
                width={140}
                height={60}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
