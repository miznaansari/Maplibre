"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error }) {
  const router = useRouter();
  const redirected = useRef(false);

  // 🔎 Detect error type
  const errorType = useMemo(() => {
    if (
      error?.message?.toLowerCase().includes("token") ||
      error?.message?.toLowerCase().includes("unauthorized") ||
      error?.status === 401
    ) {
      return "AUTH";
    }

    if (
      error?.message?.toLowerCase().includes("fetch") ||
      error?.message?.toLowerCase().includes("network")
    ) {
      return "NETWORK";
    }

    return "SERVER";
  }, [error]);

  useEffect(() => {
    console.error("App Error:", error);

    // 🔐 Session expired → redirect
    if (errorType === "AUTH" && !redirected.current) {
      redirected.current = true;
      router.replace("/login");
    }
  }, [error, errorType, router]);

  const handleRefresh = () => {
    window.location.reload(); // HARD refresh
  };

  // 🧾 UI messages
  const messages = {
    AUTH: {
      title: "Session Expired",
      description:
        "Your session has expired for security reasons. Please log in again.",
    },
    NETWORK: {
      title: "Network Error",
      description:
        "We’re having trouble connecting to the server. Please check your internet connection.",
    },
    SERVER: {
      title: "Server Error",
      description:
        "Something went wrong on our side. Please refresh the page or try again later.",
    },
  };

  const { title, description } = messages[errorType];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>

      <p className="mt-2 max-w-md text-sm text-gray-600">
        {description}
      </p>

      <div className="mt-6 flex gap-4">
        {errorType !== "AUTH" && (
          <button
            onClick={() => router.back()}
            className="rounded border px-6 py-2"
          >
            Go back
          </button>
        )}

        <button
          onClick={handleRefresh}
          className="rounded bg-black px-6 py-2 text-white"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
