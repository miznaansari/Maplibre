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

    if (errorType === "AUTH" && !redirected.current) {
      redirected.current = true;
      router.replace("/login");
    }
  }, [error, errorType, router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const messages = {
    AUTH: {
      title: "Session Expired",
      description:
        "Your session has expired. Please log in again.",
    },
    NETWORK: {
      title: "Network Error",
      description:
        "Unable to connect. Check your internet and try again.",
    },
    SERVER: {
      title: "Something went wrong",
      description:
        "We’re fixing this. Try refreshing the page.",
    },
  };

  const { title, description } = messages[errorType];

  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 min-h-screen">

      <div className="
        w-full max-w-md
        rounded-2xl
        mt-10
        bg-white
        border border-gray-200
        shadow-lg
        p-8 text-center
      ">

        {/* ICON */}
        <div className="
          mx-auto mb-5 flex h-14 w-14 items-center justify-center
          rounded-full
          bg-[#347eb3]/10
          border border-[#347eb3]/20
        ">
          <span className="text-2xl">⚠</span>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-black">
          {title}
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">

          {errorType !== "AUTH" && (
            <button
              onClick={() => router.back()}
              className="
                flex-1 h-11 rounded-xl
                border border-gray-200
                text-sm font-medium text-gray-600
                hover:bg-gray-100
                transition
              "
            >
              Go Back
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="
              flex-1 h-11 rounded-xl
              text-sm font-semibold text-white
              bg-[#347eb3]
              hover:bg-[#0284c7]
              transition-all duration-200
            "
          >
            Refresh
          </button>

        </div>

      </div>
    </div>
  );
}