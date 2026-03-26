"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

export default function BrandStrip({ brands = [] }) {
  const sliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const autoScrollRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  /* =========================
     AUTO SCROLL FUNCTIONS
  ========================= */
 const rafRef = useRef(null);

const startAutoScroll = () => {
  if (rafRef.current) return;

  const step = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollLeft += 0.5; // speed (lower = smoother)

    if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
      slider.scrollLeft = 0;
    }

    rafRef.current = requestAnimationFrame(step);
  };

  rafRef.current = requestAnimationFrame(step);
};

const stopAutoScroll = () => {
  if (rafRef.current) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
};


  const resumeAutoScrollWithDelay = () => {
    clearTimeout(resumeTimeoutRef.current);

    resumeTimeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, 2000); // ⏱️ 2 seconds delay
  };

  /* =========================
     INIT AUTO SCROLL
  ========================= */
  useEffect(() => {
    startAutoScroll();

    return () => {
      stopAutoScroll();
      clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  /* =========================
     MOUSE DRAG
  ========================= */
  const onMouseDown = (e) => {
    isDown.current = true;
    stopAutoScroll();

    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onMouseUp = () => {
    isDown.current = false;
    resumeAutoScrollWithDelay();
  };

  const onMouseLeave = () => {
    isDown.current = false;
    resumeAutoScrollWithDelay();
  };

  const onMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();

    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="w-full bg-white py-6">
      <div
        ref={sliderRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        className="
          mx-auto max-w-7xl px-6
          overflow-x-scroll
          cursor-grab active:cursor-grabbing
          scrollbar-hide
        "
      >
        <div className="flex w-max items-center gap-10 select-none">
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex h-20 w-32 items-center justify-center grayscale hover:grayscale-0 transition"
            >
              <img
                src={brand.path}
                alt={brand.alt || "brand"}
                width="120"
                height="50"
                className="object-contain"
                draggable={false}
              />

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
