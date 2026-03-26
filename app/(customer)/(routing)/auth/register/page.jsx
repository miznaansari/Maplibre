"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "./action";
import { useToast } from "@/app/admin/context/ToastProvider";

const initialState = {
  error: null,
  success: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  /* =========================
     TOAST + REDIRECT
  ========================= */
  useEffect(() => {
    if (state.success) {
      showToast({
        type: "success",
        message: "Account created successfully. Please login.",
      });

      router.replace("/auth/login");
    }

    if (state.error) {
      showToast({
        type: "error",
        message: state.error,
      });
    }
  }, [state.success, state.error, showToast, router]);

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#0f0f0f] to-[#111827]">

      {/* ================= LEFT BRAND / IMAGE ================= */}
      <div className="hidden lg:flex w-1/2 relative">

        {/* Overlay gradient */}
        <div className="absolute inset-0  z-10" />

        
        {/* Brand Content */}
        <div className="relative z-20 flex flex-col pt-32 px-16 text-white max-w-xl">

          <Image
            src="/images/logo4.png"
            alt="Samad Agency"
            width={480}
            height={80}
            priority
          />

          <h2 className="mt-6 text-3xl font-semibold">
            Join{" "}
            <span className="text-[#38bdf8]">
              Samad Agency
            </span>
          </h2>

          <p className="mt-4 text-[#d1d5db] text-sm leading-relaxed">
            Premium fashion. Custom shirts. Trend-driven
            designs crafted to match your unique style.
          </p>

          <p className="mt-4 text-[#38bdf8] text-sm font-medium">
            Pan India Delivery Available 🇮🇳
          </p>
        </div>
      </div>

      {/* ================= RIGHT REGISTER FORM ================= */}
      <div className="flex w-full lg:w-1/2  justify-center  py-16">

        {/* Glass Card */}
        <div
          className="
            w-full max-w-md
            p-4 rounded-2xl
          "
        >

          {/* Logo */}
          <Image
            src="/images/logo4.png"
            alt="Samad Agency"
            width={140}
            height={60}
            priority
            className="w-[120px] pb-6"
          />

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-white mb-1">
            Create Account
          </h1>

          <p className="text-sm text-[#9ca3af] mb-6">
            Sign up to access orders, wishlist & custom designs
          </p>

          {/* FORM */}
          <form action={formAction} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm text-[#d1d5db]">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="john@gmail.com"
                disabled={isPending}
                required
                className="
                  w-full mt-1 rounded-lg
                  border border-white/10
                  bg-[#0f0f0f]
                  px-3 py-2 text-white
                  outline-none
                  focus:border-[#38bdf8]
                  focus:ring-1 focus:ring-[#38bdf8]
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-[#d1d5db]">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Create password"
                disabled={isPending}
                required
                className="
                  w-full mt-1 rounded-lg
                  border border-white/10
                  bg-[#0f0f0f]
                  px-3 py-2 text-white
                  outline-none
                  focus:border-[#38bdf8]
                  focus:ring-1 focus:ring-[#38bdf8]
                "
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="
                w-full rounded-lg
                bg-[#347eb3]
                py-2.5 font-semibold text-white
                shadow-[0_0_20px_rgba(14,165,233,0.35)]
                hover:bg-[#38bdf8]
                transition disabled:opacity-60
              "
            >
              {isPending
                ? "Creating account..."
                : "Register"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#9ca3af] pt-4">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="
                font-semibold
                text-[#38bdf8]
                hover:text-[#7dd3fc]
                hover:underline
                underline-offset-4
              "
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
