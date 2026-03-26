"use client";

import { useEffect, useRef, useState } from "react";

function Counter({ end, suffix = "", label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          let start = 0;
          const duration = 2000; // ms
          const startTime = performance.now();

          const animate = (time) => {
            const progress = Math.min((time - startTime) / duration, 1);
            const value = Math.floor(progress * end);
            setCount(value);

            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref}>
      <h3 className="text-5xl font-extrabold text-gray-800">
        {count.toLocaleString()}
        {suffix}
      </h3>
      <p className="mt-2 text-base text-gray-700">{label}</p>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <section className="bg-[#eaf7fb] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 text-left md:grid-cols-3">
          
          {/* ITEM 1 */}
          <div>
            <div className="mb-6 h-[1px] w-full bg-black" />
            <Counter
              end={15}
              suffix="+ Years"
              label="Years Supporting Australian customers"
            />
          </div>

          {/* ITEM 2 */}
          <div>
            <div className="mb-6 h-[1px] w-full bg-black" />
            <Counter
              end={100000}
              suffix="+"
              label="Orders shipped nationwide"
            />
          </div>

          {/* ITEM 3 */}
          <div>
            <div className="mb-6 h-[1px] w-full bg-black" />
            <Counter
              end={1000}
              suffix="+"
              label="Products available"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
