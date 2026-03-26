"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#347eb3] rounded-full animate-spin" />
  );
}
export default function LoginPage({ isLoggedIn }) {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);
const handleGoogleLogin = async () => {
  try {
    setLoading(true);

    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    const res = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Google login failed");
      return;
    }

    localStorage.setItem("userName", data.user.name);

    router.replace(redirectTo);
    router.refresh();
  } catch (err) {
    setError("Google login failed");
  } finally {
    setLoading(false);
  }
};
  if (isLoggedIn) {
    return (
      <div className=" flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200"></div>

            <div
              className="
              absolute inset-0
              rounded-full
              border-2 border-t-[#38bdf8] border-r-[#347eb3]
              animate-spin
            "
            ></div>
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-black text-lg font-medium tracking-wide">
              Redirecting...
            </p>

            <p className="text-gray-500 text-sm mt-1">
              Taking you to your Home 🚀
            </p>
          </div>

          {/* Dots */}
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("userName", data.user.name);

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex bg-white pt-10">

      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex w-1/2 pt-10 justify-center text-black p-0">
        <div className="max-w-md">
          <Image
            src="/images/logo/samadLogoremove.png"
            alt="Samad Agency"
            width={480}
            height={80}
            priority
          />

          <h2 className="mt-6 text-3xl font-semibold">
            Welcome Back to{" "}
            <span className="text-[#347eb3]">Samad Agency</span>
          </h2>

          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            Wholesale mobile accessories supplier delivering high-quality
            products across India.
          </p>

          <div className="mt-4 text-sm text-gray-700">
            Airpods • Chargers • Data Cables • Handsfree • Neckbands • Power Banks
          </div>

          <p className="mt-4 text-[#347eb3] text-sm font-medium">
            Pan India Delivery Available 🇮🇳
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-6 pt-0">

        <div className="w-full max-w-md rounded-2xl bg-white p-2">

          {/* Logo */}
          <Image
            src="/images/logo/samadLogoremove.png"
            alt="Samad Agency"
            width={140}
            height={60}
            priority
            className="w-[120px] pb-6"
          />

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-black mb-1">
            Login to Your Account
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Access your orders, wishlist & product dashboard
          </p>
       

{/* GOOGLE LOGIN */}
<div className="mt-4">
<button
  onClick={handleGoogleLogin}
  disabled={loading}
  className="
    w-full flex items-center justify-center gap-3
    border border-gray-300
    rounded-lg py-2.5
    bg-white
    hover:bg-gray-50
    transition
    disabled:opacity-70
  "
>
  {loading ? (
    <>
      <Spinner />
      <span className="text-sm font-medium text-gray-700">
        Signing in...
      </span>
    </>
  ) : (
    <>
      <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.4 0 6.4 1.2 8.8 3.5l6.6-6.6C35.2 2.7 30 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.7 6C12.2 13.3 17.7 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.7-2 5-4.3 6.6l6.6 5.1c3.9-3.6 6.1-8.9 6.1-15.9z"
        />
        <path
          fill="#FBBC05"
          d="M10.3 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3l-7.7-6C1 16.5 0 20.1 0 24s1 7.5 2.6 10.3l7.7-6z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.5 0 12-2.1 16-5.7l-6.6-5.1c-2 1.4-4.6 2.2-9.4 2.2-6.3 0-11.8-3.8-13.7-9.2l-7.7 6C6.5 42.6 14.6 48 24 48z"
        />
      </svg>

      <span className="text-sm font-medium text-gray-700">
        Continue with Google
      </span>
    </>
  )}
</button>
</div>

{/* OR DIVIDER */}
<div className="flex items-center my-6">
  <div className="flex-1 border-t border-gray-200"></div>

  <span className="px-3 text-xs text-gray-400 font-medium">
    OR
  </span>

  <div className="flex-1 border-t border-gray-200"></div>
</div>

          {/* Error */}
          {error && (
            <div
              className="
              mb-4 rounded-lg
              bg-red-50
              border border-red-200
              p-3 text-sm text-red-600
            "
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm text-black">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="
                  w-full mt-1 rounded-lg
                  border border-gray-300
                  bg-white
                  px-3 py-2 text-black
                  outline-none
                  focus:border-[#347eb3]
                  focus:ring-1 focus:ring-[#347eb3]
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-black">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
                className="
                  w-full mt-1 rounded-lg
                  border border-gray-300
                  bg-white
                  px-3 py-2 text-black
                  outline-none
                  focus:border-[#347eb3]
                  focus:ring-1 focus:ring-[#347eb3]
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full rounded-lg
                bg-[#347eb3]
                py-2.5 font-semibold text-white
                hover:bg-[#0284c7]
                transition disabled:opacity-60
              "
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 pt-4">
            Don’t have an account?{" "}
            <Link
              href="/auth/register"
              className="
                font-semibold
                text-[#347eb3]
                hover:text-[#0284c7]
                hover:underline
                underline-offset-4
              "
            >
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}