"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

export default function BrandStrip({ brands = [] }) {
  const sliderRef = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const rafRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const scrollPosRef = useRef(0); // ✅ FIX

  const SPEED = 0.3;

  /* =========================
     AUTO SCROLL (RAF)
  ========================= */
  const startAutoScroll = () => {
    if (rafRef.current) return;

    const step = () => {
      const slider = sliderRef.current;
      if (!slider) return;

      // accumulate fractional scroll
      scrollPosRef.current += SPEED;
      slider.scrollLeft = scrollPosRef.current;

      if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
        scrollPosRef.current = 0;
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
    resumeTimeoutRef.current = setTimeout(startAutoScroll, 2000);
  };

  /* =========================
     INIT
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
    scrollPosRef.current = sliderRef.current.scrollLeft; // sync position
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
    const newScroll = scrollLeft.current - walk;

    sliderRef.current.scrollLeft = newScroll;
    scrollPosRef.current = newScroll; // keep RAF in sync
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
              <Image
                src={brand.path}
                alt={brand.alt || "brand"}
                width={120}
                height={50}
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
