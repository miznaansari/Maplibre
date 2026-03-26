"use client";

import { useState } from "react";

export default function MyAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // const data = await res.json();

      // if (!res.ok) {
      //   setError(data.message || "Login failed");
      //   setLoading(false);
      //   return;
      // }

      // ✅ Store JWT in cookie (SSR readable)
      // document.cookie = `authToken=${data.token}; path=/; max-age=604800; SameSite=Lax`;

      // (Optional) store user for client usage
      // localStorage.setItem("user", JSON.stringify(data.user));

      // 🔁 Reload so server layout re-checks cookie
      // window.location.reload();

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">

        {/* LOGIN */}
        <div className="bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Login</h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm font-medium">
                Username or email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full mt-1 border px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full mt-1 border px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b5fa5] text-white py-2 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        {/* REGISTER (STATIC UI) */}
        <div className="bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Register</h2>
          <p className="text-sm text-gray-600">
            Registration disabled (static demo).
          </p>
        </div>

      </div>
    </div>
  );
}
