"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Banner({ products }) {
  if (!products || products.length === 0) return null;

  const topProducts = products.slice(0, 4);

  return (
    <section className="border border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* TITLE */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Most Popular
          </h2>

          <p className="text-gray-400 mt-2">
            Discover trending styles from Samad Agency
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {topProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="relative cursor-pointer overflow-hidden rounded-xl
                bg-[#1a1a1a] border border-white/10"
              >
                {/* IMAGE */}
                <div className="relative h-[360px] w-full">
                  <Image
                    src={
                      product.images?.[0]?.image_url ||
                      "/images/not-found.png"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* HOVER OVERLAY */}
                <div
                  className="absolute inset-0 flex flex-col items-center
                  justify-center bg-black/50 opacity-0 transition
                  hover:opacity-100"
                >
                  <p className="text-sm text-gray-200 mb-2">
                    TRENDING NOW
                  </p>

                  <h3 className="text-white text-lg font-bold text-center px-4">
                    {product.name}
                  </h3>

                  <span className="mt-3 text-[#38bdf8] font-semibold">
                    ₹{product.regular_price}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
