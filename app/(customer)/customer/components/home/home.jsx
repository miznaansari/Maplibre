"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative hidden md:flex min-h-[100dvh] md:min-h-[90dvh] flex items-center justify-center overflow-hidden bg-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <Image
          src="/model/product.jpeg"
          alt="Accessories"
          fill
          priority
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-white" />
      </div>

      {/* CONTENT */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-4xl px-6"
      >

        {/* TAG */}
        <motion.div
          variants={item}
          className="inline-flex items-center px-4 py-1 rounded-full border border-[#347eb3]/40 text-[#347eb3] text-xs tracking-widest mb-6 backdrop-blur-md"
        >
          ⚡ NEW ARRIVALS AVAILABLE
        </motion.div>

        {/* TITLE */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-extrabold text-black tracking-tight"
        >
          MOBILE
          <br />
          <span className="text-[#347eb3]">
            ACCESSORIES
          </span>
        </motion.h1>

        {/* DESCRIPTION */}
        <motion.p
          variants={item}
          className="mt-6 text-gray-600 max-w-xl mx-auto text-lg leading-relaxed"
        >
          Wholesale supplier of premium mobile accessories including
          Airpods, Chargers, Data Cables, Handsfree, Neckbands, and Power Banks.
          Quality products with reliable delivery across India.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          variants={item}
          className="mt-10 flex items-center justify-center gap-4 flex-wrap"
        >

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#347eb3] text-white font-semibold hover:bg-[#0284c7] transition"
          >
            SHOP PRODUCTS

            <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/contact-us"
            className="px-8 py-3 rounded-xl border border-[#347eb3] text-[#347eb3] font-semibold hover:bg-[#347eb3]/10 transition"
          >
            CONTACT WHOLESALE
          </Link>
        </motion.div>

        {/* STATS */}
        <motion.div
          variants={container}
          className="mt-14 flex items-center justify-center gap-10 text-gray-600 text-sm"
        >

          <motion.div variants={item}>
            <p className="text-xl font-bold text-black">1000+</p>
            <p className="text-gray-500 text-xs">PRODUCTS</p>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-xl font-bold text-black">500+</p>
            <p className="text-gray-500 text-xs">RESELLERS</p>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-xl font-bold text-black">PAN INDIA</p>
            <p className="text-gray-500 text-xs">DELIVERY</p>
          </motion.div>

        </motion.div>

      </motion.div>
    </section>
  );
}