"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage("Reset link sent! Check your email.");
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT IMAGE (Same as Login) */}
      <div className="hidden lg:flex w-1/2 relative">
        <Image
          src="/images/page/about.png"
          alt="Shield King"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="flex w-full lg:w-1/2 mt-20 justify-center px-6">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <Image
            src="/images/logo.png"
            alt="Shield King"
            width={140}
            height={60}
            priority
            className="w-[110px] pb-10 sm:w-[130px] md:w-[183px]"
          />

          <h1 className="text-2xl font-semibold mb-1">
            Forgot Password
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Enter your email to receive a password reset link
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                placeholder="john@gmail.com"
                className="w-full mt-1 rounded border  focus:border-[rgb(var(--inputFieldFocusBorder))]
      focus:outline-none
              border-[rgb(var(--inputField))]   focus:border-[rgb(var(--inputFieldFocusBorder))]  px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[#00AEEF] py-2 text-white disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Back to login */}
          <p className="text-center pt-4">
            Remember your password?{" "}
            <span className="text-[#0072BC]">
              <Link href="/auth/login">Login</Link>
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}