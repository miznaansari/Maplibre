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
    <div className="
       flex items-center justify-center 
      bg-[#0f0f0f] px-4 
    ">

      <div className="
        w-full max-w-md
        rounded-2xl
        mt-10
        bg-[#1a1a1a]
        border border-white/10
        shadow-[0_10px_40px_rgba(0,0,0,0.9)]
        p-8 text-center
      ">

        {/* ICON */}
        <div className="
          mx-auto mb-5 flex h-14 w-14 items-center justify-center
          rounded-full
          bg-[#347eb3]/10
          border border-[#38bdf8]/20
        ">
          <span className="text-2xl">⚠</span>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-2 text-sm text-[#9ca3af]">
          {description}
        </p>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">

          {errorType !== "AUTH" && (
            <button
              onClick={() => router.back()}
              className="
                flex-1 h-11 rounded-xl
                border border-white/10
                text-sm font-medium text-[#d1d5db]
                hover:bg-white/5
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
              hover:bg-[#38bdf8]

              shadow-[0_0_20px_rgba(14,165,233,0.35)]
              transition-all duration-200
              hover:scale-[1.02]
            "
          >
            Refresh
          </button>

        </div>

      </div>
    </div>
  );
}