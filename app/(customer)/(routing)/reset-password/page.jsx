"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT IMAGE */}
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
            Reset Password
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Create a new password for your account
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

            {/* New Password */}
            <div>
              <label className="text-sm text-gray-700">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full mt-1 rounded border  focus:border-[rgb(var(--inputFieldFocusBorder))]
      focus:outline-none
              border-[rgb(var(--inputField))]   focus:border-[rgb(var(--inputFieldFocusBorder))]  px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full mt-1 rounded border  focus:border-[rgb(var(--inputFieldFocusBorder))]
      focus:outline-none
              border-[rgb(var(--inputField))]   focus:border-[rgb(var(--inputFieldFocusBorder))]  px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[#00AEEF] py-2 text-white disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password"}
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