"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid verification link");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Verification failed");
          return;
        }

        setSuccess(true);

        // redirect after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, router]);

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

      {/* RIGHT CONTENT */}
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

          <h1 className="text-2xl font-semibold mb-2">
            Email Verification
          </h1>

          {/* Loading */}
          {loading && (
            <div className="text-sm text-gray-500">
              Verifying your email...
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded bg-green-50 p-4 text-green-700 text-sm">
              ✅ Email verified successfully!  
              <br />
              Redirecting to login...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded bg-red-50 p-4 text-red-600 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Login button after success */}
          {!loading && success && (
            <Link href="/auth/login">
              <button className="mt-6 w-full rounded bg-[#00AEEF] py-2 text-white">
                Go to Login
              </button>
            </Link>
          )}

          {/* Back to login */}
          {!loading && !success && (
            <p className="text-center pt-6">
              Back to{" "}
              <span className="text-[#0072BC]">
                <Link href="/auth/login">Login</Link>
              </span>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}