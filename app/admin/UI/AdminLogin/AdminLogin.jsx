"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin({ adminToken }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/admin/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      router.replace("/admin/dashboard");
      router.refresh();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      router.replace("/admin/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen flex">

      {/* LEFT INFO PANEL */}
      <div className="hidden md:flex w-1/2 bg-slate-900 text-white flex-col justify-center px-16">

        <Image
          src="/images/logo/samadLogoremove.png"
          alt="logo"
          width={200}
          height={70}
          className="mb-8"
        />

        <h1 className="text-3xl font-semibold mb-4">
          Samad Agency Admin Panel
        </h1>

        <p className="text-slate-300 leading-relaxed max-w-md">
          Manage orders, products, and customers securely from the
          administrative dashboard.
        </p>

      </div>

      {/* LOGIN FORM */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">

          <h2 className="text-xl font-semibold text-slate-800 mb-1">
            Admin Login
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email Address
              </label>

              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@samad-agency.com"
                className="w-full border text-base border-slate-300 rounded-md px-4 py-2.5  outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border text-base border-slate-300 rounded-md px-4 py-2.5  outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            © {new Date().getFullYear()} Samad Agency
          </p>

        </div>

      </div>
    </div>
  );
}