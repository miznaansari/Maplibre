"use client";

import { useEffect, useRef } from "react";

export default function SwipeableDrawer({
  open,
  onClose,
  children,
  height = "55vh",
}) {
  const drawerRef = useRef(null);
  const contentRef = useRef(null);

  const startY = useRef(0);
  const lastY = useRef(0);
  const startTime = useRef(0);
  const dragging = useRef(false);

  /* 🔒 Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  /* 🎬 OPEN ANIMATION */
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.style.transform = "translateY(100%)";

      requestAnimationFrame(() => {
        drawerRef.current.style.transition =
          "transform 280ms cubic-bezier(0.4,0,0.2,1)";
        drawerRef.current.style.transform = "translateY(0)";
      });
    }
  }, [open]);

  /* 🔻 CLOSE ANIMATION */
  const closeWithAnimation = () => {
    if (!drawerRef.current) return;

    const drawerHeight = drawerRef.current.offsetHeight;

    drawerRef.current.style.transition =
      "transform 240ms cubic-bezier(0.4,0,0.2,1)";
    drawerRef.current.style.transform = `translateY(${drawerHeight}px)`;

    setTimeout(onClose, 240);
  };

  /* 👆 TOUCH START */
  const onTouchStart = (e) => {
    // ❗ allow drag only if scroll is at top
    if (contentRef.current && contentRef.current.scrollTop > 0) {
      dragging.current = false;
      return;
    }

    startY.current = e.touches[0].clientY;
    lastY.current = startY.current;
    startTime.current = Date.now();
    dragging.current = true;

    drawerRef.current.style.transition = "none";
  };

  /* 👆 TOUCH MOVE */
  const onTouchMove = (e) => {
    if (!dragging.current) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;

    // Only allow swipe DOWN
    if (delta < 0) return;

    lastY.current = currentY;

    const resistance = delta > 300 ? 300 + (delta - 300) * 0.3 : delta;

    drawerRef.current.style.transform = `translateY(${resistance}px)`;
  };

  /* 👆 TOUCH END */
  const onTouchEnd = () => {
    if (!dragging.current) return;

    dragging.current = false;

    const delta = lastY.current - startY.current;
    const time = Date.now() - startTime.current;
    const velocity = delta / time;

    const drawerHeight = drawerRef.current.offsetHeight;

    drawerRef.current.style.transition =
      "transform 240ms cubic-bezier(0.4,0,0.2,1)";

    if (delta > drawerHeight * 0.3 || velocity > 0.6) {
      drawerRef.current.style.transform = `translateY(${drawerHeight}px)`;
      setTimeout(onClose, 240);
    } else {
      drawerRef.current.style.transform = "translateY(0)";
    }
  };

  if (!open) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
        onClick={closeWithAnimation}
      />

      {/* DRAWER */}
      <div
        ref={drawerRef}
        style={{ height }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-2xl shadow-xl touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* DRAG HANDLE */}
        <div className="flex justify-center py-3">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* CONTENT */}
        <div
          ref={contentRef}
          className="h-full overflow-y-auto px-4 pb-6"
        >
          {children}
        </div>
      </div>
    </>
  );
}